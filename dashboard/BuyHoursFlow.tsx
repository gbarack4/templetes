"use client";

import { trackPackagePurchase } from "@/lib/tracking/runtime";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  fetchPublicPackages,
  type PublicPackage,
} from "@/lib/public-booking-api";
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

function BuyHours({
  schoolId,
  userId,
}: Readonly<{ schoolId: string; userId: string }>) {
  const router = useRouter();
  const { getToken } = useAuth();
  const studentState = useStudent();
  const balance = useStudentCreditBalance();
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
  const suburb = studentState.student?.addressSuburb?.trim() ?? "";
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
        const attempt = parsePurchaseAttempt(raw);
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
            errorMessage(
              cause,
              "Unable to restore your payment. Please try again.",
            ),
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

  useEffect(() => {
    if (!paid || !payment) return;
    trackPackagePurchase(
      schoolId, payment.purchaseId, payment.amount, payment.currency,
    );
  }, [paid, payment, schoolId]);

  async function start(packageId = selectedId) {
    if (busyRef.current || (!packageId && !attempt)) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const nextAttempt = attempt ?? {
        packageId: packageId!,
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
      setError(errorMessage(cause, "Unable to start payment."));
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

  function goToDashboard() {
    router.push("/dashboard");
  }

  function cancelAttempt() {
    void cancelPayment().catch((cause: unknown) =>
      setError(errorMessage(cause, "Unable to cancel payment.")),
    );
  }

  if (paid && payment) {
    return <PurchaseConfirmation payment={payment} onBack={goToDashboard} />;
  }

  let content: ReactNode;
  if (restoring) {
    content = <p>Loading...</p>;
  } else if (payment) {
    content = (
      <PaymentStep
        payment={payment}
        waiting={processing && status.data?.paymentStatus !== "failed"}
        statusError={status.isError}
        onCheckStatus={() => void status.refetch()}
        onProcessing={() => setProcessing(true)}
        onCancel={cancelPayment}
      />
    );
  } else {
    content = (
      <PackageSelection
        balance={balance}
        student={studentState}
        suburb={suburb}
        packages={packages}
        selectedId={selectedId}
        busy={busy}
        hasAttempt={!!attempt}
        onSelect={setSelectedId}
        onStart={(packageId) => void start(packageId)}
        onCancel={cancelAttempt}
      />
    );
  }

  return (
    <>
      <FlowPageHeader title="Buy more hours" onBack={goToDashboard} />
      <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
        {content}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </main>
    </>
  );
}

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

function parsePurchaseAttempt(raw: string): PurchaseAttempt {
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !("packageId" in value) ||
    !("requestId" in value) ||
    typeof value.packageId !== "string" ||
    typeof value.requestId !== "string"
  ) {
    throw new Error(
      "Unable to restore the previous payment. Please contact the school.",
    );
  }
  return { packageId: value.packageId, requestId: value.requestId };
}

function PurchaseConfirmation({
  payment,
  onBack,
}: Readonly<{
  payment: Payment;
  onBack: () => void;
}>) {
  return (
    <main className="flex-1 space-y-5 px-5 pb-24 pt-10 text-center">
      <div className="text-4xl text-green-600" aria-hidden="true">
        ✓
      </div>
      <h1 className="text-xl font-bold text-slate-900">Hours added</h1>
      <p className="text-sm text-slate-600">
        {formatLessonHoursLabel(payment.purchasedMinutes / 60)} have been added
        to your credit.
      </p>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold">{payment.packageName}</p>
        <p>{formatPaymentAmount(payment.amount, payment.currency)}</p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-lg bg-blue-600 py-3 text-white"
      >
        Back to Dashboard
      </button>
    </main>
  );
}

type PaymentStepProps = Readonly<{
  payment: Payment;
  waiting: boolean;
  statusError: boolean;
  onCheckStatus: () => void;
  onProcessing: () => void;
  onCancel: () => Promise<void>;
}>;

function PaymentStep({
  payment,
  waiting,
  statusError,
  onCheckStatus,
  onProcessing,
  onCancel,
}: PaymentStepProps) {
  let paymentContent: ReactNode;
  if (waiting) {
    paymentContent = (
      <section className="space-y-3" aria-live="polite">
        <h2 className="font-semibold">Confirming your payment</h2>
        <p className="text-sm text-slate-600">
          We are waiting for payment confirmation. Your hours will appear once
          it is complete. You can return to your dashboard while we process it.
        </p>
        <button
          type="button"
          className="text-blue-600 underline"
          onClick={onCheckStatus}
        >
          Check payment status
        </button>
      </section>
    );
  } else {
    paymentContent = (
      <HoursPayment
        payment={payment}
        onProcessing={onProcessing}
        onCancel={onCancel}
      />
    );
  }
  return (
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
      {paymentContent}
      {statusError && (
        <p role="alert" className="text-sm text-red-600">
          Unable to check payment status. We will retry; please do not pay
          again.
        </p>
      )}
    </>
  );
}

type PackagesState = Readonly<{
  data?: PublicPackage[];
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}>;

type PackageSelectionProps = Readonly<{
  balance: ReturnType<typeof useStudentCreditBalance>;
  student: ReturnType<typeof useStudent>;
  suburb: string;
  packages: PackagesState;
  selectedId: string | null;
  busy: boolean;
  hasAttempt: boolean;
  onSelect: (id: string) => void;
  onStart: (packageId?: string) => void;
  onCancel: () => void;
}>;

function balanceLabel(loading: boolean, minutes: number | null): string {
  if (loading) return "Loading...";
  if (minutes === null) return "Unavailable";
  return formatLessonHoursLabel(minutes / 60);
}

function formatPackagePrice(price: string): string {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return formatPaymentAmount(price);
  }

  return `AUD $${amount.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ClockIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageSelection(props: PackageSelectionProps) {
  const { balance, selectedId, busy, hasAttempt, onSelect, onStart, onCancel } =
    props;
  const [showConfirm, setShowConfirm] = useState(false);
  const selectedPackage =
    props.packages.data?.find((pkg) => pkg.id === selectedId) ?? null;

  function handleChoose(packageId: string) {
    onSelect(packageId);
    setShowConfirm(true);
  }

  return (
    <>
      <section className="flex overflow-hidden rounded-2xl bg-[#f9f9f9]">
        <div className="flex items-center justify-center px-4">
          <ClockIcon className="h-7 w-7 text-blue-600" />
        </div>

        <div className="my-3 w-px self-stretch bg-slate-200" />

        <div className="flex-1 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Current balance</p>
          <p className="text-lg font-bold leading-tight text-slate-900">
            {balanceLabel(balance.loading, balance.balanceMinutes)}
          </p>
        </div>
      </section>
      {balance.error && (
        <p role="alert" className="text-sm text-red-600">
          {balance.error}
        </p>
      )}
      <LocationPackages
        student={props.student}
        suburb={props.suburb}
        packages={props.packages}
        selectedId={selectedId}
        disabled={busy || hasAttempt}
        onSelect={onSelect}
        onChoose={handleChoose}
      />
      {showConfirm && selectedPackage ? (
        <ContinueToPaymentModal
          pkg={selectedPackage}
          busy={busy}
          onClose={() => setShowConfirm(false)}
          onContinue={() => {
            onStart(selectedPackage.id);
            setShowConfirm(false);
          }}
        />
      ) : null}
      {hasAttempt && (
        <button
          type="button"
          disabled={busy}
          className="w-full text-sm text-slate-600"
          onClick={onCancel}
        >
          Cancel payment attempt
        </button>
      )}
    </>
  );
}

type PackageListProps = Readonly<{
  packages: PackagesState;
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onChoose: (id: string) => void;
}>;

type LocationPackagesProps = PackageListProps &
  Readonly<{
    student: ReturnType<typeof useStudent>;
    suburb: string;
  }>;

function LocationPackages({
  student,
  suburb,
  ...listProps
}: LocationPackagesProps) {
  if (student.loading) return <p>Loading your location...</p>;
  if (student.error)
    return (
      <div role="alert">
        <p>{student.error}</p>
        <button onClick={() => void student.refetch()}>Try again</button>
      </div>
    );
  if (!suburb)
    return <p>Add your address in your profile to see available packages.</p>;
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-slate-900">
        Packages for {suburb}
      </h2>
      <PackageList {...listProps} />
    </div>
  );
}

function PackageList({
  packages,
  selectedId,
  disabled,
  onChoose,
}: PackageListProps) {
  if (packages.isPending) return <p>Loading packages...</p>;
  if (packages.isError)
    return (
      <div role="alert">
        <p>Unable to load packages.</p>
        <button
          className="text-blue-600 underline"
          onClick={() => void packages.refetch()}
        >
          Try again
        </button>
      </div>
    );
  if (!packages.data?.length)
    return <p>No lesson packages are available for this location.</p>;
  return (
    <div className="space-y-2">
      {packages.data.map((pkg) => {
        const hours = pkg.durationMinutes / 60;
        const isPopular = hours === 5;
        const isSelected = selectedId === pkg.id;

        return (
          <button
            key={pkg.id}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(pkg.id)}
            aria-pressed={isSelected}
            className={`w-full rounded-xl border bg-white px-3 py-2.5 text-left shadow-sm transition ${
              isSelected ? "border-blue-600" : "border-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">{pkg.name}</h3>

              {isPopular ? (
                <span className="shrink-0 rounded-full bg-[#F5C400] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1A2744]">
                  Popular
                </span>
              ) : null}
            </div>

            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatLessonHoursLabel(hours)}
            </p>

            <p className="mt-1.5 text-base font-bold text-slate-900">
              {formatPackagePrice(pkg.price)}
            </p>

            <span className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-xs font-bold text-white">
              Choose package
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ContinueToPaymentModal({
  pkg,
  busy,
  onClose,
  onContinue,
}: Readonly<{
  pkg: PublicPackage;
  busy: boolean;
  onClose: () => void;
  onContinue: () => void;
}>) {
  const [isVisible, setIsVisible] = useState(false);
  const hours = pkg.durationMinutes / 60;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const frameId = window.requestAnimationFrame(() => setIsVisible(true));

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close package confirmation"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <dialog
        open
        aria-modal="true"
        aria-label="Continue to payment"
        className={`relative z-10 flex w-full max-w-md flex-col rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

        <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>

        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <ClockIcon className="h-4 w-4" />
          {formatLessonHoursLabel(hours)}
        </p>

        <p className="mt-3 text-xl font-bold text-slate-900">
          {formatPackagePrice(pkg.price)}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          All hours will be added to your credit. Book your lessons later.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={onContinue}
          className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Continue to payment
        </button>
      </dialog>
    </div>
  );
}
