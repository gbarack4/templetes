"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchPublicPackages } from "@/lib/public-booking-api";
import {
  paymentRequest,
  formatPaymentAmount,
  type HoursPayment as Payment,
  type PurchaseAttempt,
} from "@/lib/hours-payment-api";
import { useStudent } from "@/shared/hooks/useStudent";
import { useStudentCreditBalance } from "@/shared/hooks/useStudentCreditBalance";
import { useSchoolId } from "./SchoolContext";
import { formatLessonHoursLabel } from "./mock-data";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { HoursPayment } from "./components/HoursPayment";

export function BuyHoursFlow() {
  const schoolId = useSchoolId();
  const { userId, isSignedIn } = useAuth();
  if (!isSignedIn || !userId)
    return <p className="p-5">Please sign in to buy hours.</p>;
  return (
    <BuyHours
      key={`${schoolId}:${userId}`}
      schoolId={schoolId}
      userId={userId}
    />
  );
}

function BuyHours({ schoolId, userId }: Readonly<{ schoolId: string; userId: string }>) {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    student,
    loading: studentLoading,
    error: studentError,
    refetch: reloadStudent,
  } = useStudent();
  const {
    balanceMinutes,
    loading: balanceLoading,
    error: balanceError,
  } = useStudentCreditBalance();
  const queryClient = useQueryClient();
  const storageKey = `hours-purchase:${schoolId}:${userId}`;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<PurchaseAttempt | null>(null);
  const busyRef = useRef(false);
  const suburb = student?.addressSuburb?.trim() ?? "";
  const packages = useQuery({
    queryKey: ["public-packages", schoolId, suburb],
    enabled: !!suburb,
    staleTime: 0,
    queryFn: () => fetchPublicPackages(schoolId, suburb),
  });
  const status = useQuery({
    queryKey: ["hours-payment-status", schoolId, userId, payment?.purchaseId],
    enabled: !!payment,
    queryFn: async () =>
      paymentRequest<{ status: string; paymentStatus: string | null }>(
        schoolId,
        await getToken(),
        `hours/${payment!.purchaseId}/status`,
      ),
    refetchInterval: (query) =>
      query.state.data?.status === "paid" ? false : 2000,
    staleTime: 0,
  });
  const paid =
    payment?.purchaseStatus === "paid" || status.data?.status === "paid";

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) return;
        const value: unknown = JSON.parse(raw);
        if (
          !value ||
          typeof value !== "object" ||
          !("packageId" in value) ||
          !("requestId" in value) ||
          typeof value.packageId !== "string" ||
          typeof value.requestId !== "string"
        )
          throw new Error(
            "Unable to restore the previous payment. Please contact the school.",
          );
        const attempt = {
          packageId: value.packageId,
          requestId: value.requestId,
        };
        setAttempt(attempt);
        const result = await paymentRequest<Payment>(
          schoolId,
          await getToken(),
          "hours",
          attempt,
        );
        if (!cancelled) {
          setPayment(result);
          setProcessing(
            ["succeeded", "processing"].includes(result.intentStatus),
          );
        }
      } catch (cause) {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to restore your payment. Please try again.",
          );
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, [schoolId, storageKey, getToken]);

  useEffect(() => {
    if (!paid) return;    
    sessionStorage.removeItem(storageKey);
    void queryClient.invalidateQueries({
      queryKey: ["student-credit-balance", schoolId, userId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["student-payments", schoolId, userId],
    });
  }, [paid, queryClient, schoolId, storageKey, userId]);

  async function start() {
    if (busyRef.current || (!selectedId && !attempt)) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const nextAttempt = attempt ?? {
        packageId: selectedId!,
        requestId: crypto.randomUUID(),
      };      
      sessionStorage.setItem(storageKey, JSON.stringify(nextAttempt));
      setAttempt(nextAttempt);
      const result = await paymentRequest<Payment>(
        schoolId,
        await getToken(),
        "hours",
        nextAttempt,
      );
      setPayment(result);
      setProcessing(["succeeded", "processing"].includes(result.intentStatus));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to start payment.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function cancelPayment() {
    if (!attempt) return;
    await paymentRequest(
      schoolId,
      await getToken(),
      `hours/attempt/${attempt.requestId}/cancel`,
      {},
    );
    sessionStorage.removeItem(storageKey);
    setAttempt(null);
    setPayment(null);
    setSelectedId(null);
    setProcessing(false);
    setError("");
  }

  if (paid && payment)
    return (
      <main className="flex-1 space-y-5 px-5 pb-24 pt-10 text-center">
        <div className="text-4xl text-green-600" aria-hidden="true">
          ✓
        </div>
        <h1 className="text-xl font-bold text-slate-900">Hours added</h1>
        <p className="text-sm text-slate-600">
          {formatLessonHoursLabel(payment.purchasedMinutes / 60)} have been
          added to your credit.
        </p>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold">{payment.packageName}</p>
          <p>{formatPaymentAmount(payment.amount, payment.currency)}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-lg bg-blue-600 py-3 text-white"
        >
          Back to Dashboard
        </button>
      </main>
    );

  return (
    <>
      <FlowPageHeader
        title="Buy more hours"
        onBack={() => router.push("/dashboard")}
      />
      <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
        {restoring ? (
          <p>Loading...</p>
        ) : payment ? (
          <>
            <section className="rounded-2xl bg-slate-50 p-4">
              <h2 className="font-semibold">{payment.packageName}</h2>
              <p className="mt-1 text-sm">
                {formatLessonHoursLabel(payment.purchasedMinutes / 60)} ·{" "}
                {formatPaymentAmount(payment.amount, payment.currency)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                All hours will be added to your credit. Book your lessons later.
              </p>
            </section>
            {processing && status.data?.paymentStatus !== "failed" ? (
              <section className="space-y-3" aria-live="polite">
                <h2 className="font-semibold">Confirming your payment</h2>
                <p className="text-sm text-slate-600">
                  We are waiting for payment confirmation. Your hours will
                  appear once it is complete. You can return to your dashboard
                  while we process it.
                </p>
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => void status.refetch()}
                >
                  Check payment status
                </button>
              </section>
            ) : (
              <HoursPayment
                payment={payment}
                onProcessing={() => setProcessing(true)}
                onCancel={cancelPayment}
              />
            )}
            {status.isError && (
              <p role="alert" className="text-sm text-red-600">
                Unable to check payment status. We will retry; please do not pay
                again.
              </p>
            )}
          </>
        ) : (
          <>
            <section className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Current balance</p>
              <p className="font-bold">
                {balanceLoading
                  ? "Loading..."
                  : balanceMinutes === null
                    ? "Unavailable"
                    : formatLessonHoursLabel(balanceMinutes / 60)}
              </p>
            </section>
            {balanceError && (
              <p role="alert" className="text-sm text-red-600">
                {balanceError}
              </p>
            )}
            {studentLoading ? (
              <p>Loading your location...</p>
            ) : studentError ? (
              <div role="alert">
                <p>{studentError}</p>
                <button onClick={() => void reloadStudent()}>Try again</button>
              </div>
            ) : !suburb ? (
              <p>Add your address in your profile to see available packages.</p>
            ) : (
              <>
                <h2 className="text-sm font-semibold">Packages for {suburb}</h2>
                {packages.isPending ? (
                  <p>Loading packages...</p>
                ) : packages.isError ? (
                  <div role="alert">
                    <p>Unable to load packages.</p>
                    <button
                      className="text-blue-600 underline"
                      onClick={() => void packages.refetch()}
                    >
                      Try again
                    </button>
                  </div>
                ) : packages.data?.length ? (
                  <div className="space-y-3">
                    {packages.data.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        disabled={busy || !!attempt}
                        onClick={() => setSelectedId(pkg.id)}
                        aria-pressed={selectedId === pkg.id}
                        className={`cursor-pointer w-full rounded-2xl p-4 text-left ${selectedId === pkg.id ? "bg-blue-50 ring-2 ring-blue-600" : "bg-slate-50"}`}
                      >
                        <p className="font-semibold">{pkg.name}</p>
                        <p className="text-sm text-slate-600">
                          {formatLessonHoursLabel(pkg.durationMinutes / 60)}
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          {formatPaymentAmount(pkg.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>No lesson packages are available for this location.</p>
                )}
              </>
            )}
            {(selectedId || attempt) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void start()}
                className="w-full rounded-lg bg-blue-600 py-3 text-white disabled:opacity-50"
              >
                {busy
                  ? "Please wait..."
                  : attempt
                    ? "Resume payment"
                    : "Continue to payment"}
              </button>
            )}
            {attempt && (
              <button
                type="button"
                disabled={busy}
                className="w-full text-sm text-slate-600"
                onClick={() => {
                  void cancelPayment().catch((cause: unknown) =>
                    setError(
                      cause instanceof Error
                        ? cause.message
                        : "Unable to cancel payment.",
                    ),
                  );
                }}
              >
                Cancel payment attempt
              </button>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
