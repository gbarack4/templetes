"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentRequest,
  type PaymentHistory,
} from "@/lib/hours-payment-api";
import { useSchoolId } from "./SchoolContext";
import { formatLessonHoursLabel } from "./mock-data";

function Receipt({
  schoolId,
  paymentId,
}: Readonly<{
  schoolId: string;
  paymentId: string;
}>) {
  const { getToken, userId } = useAuth();
  const [requested, setRequested] = useState(false);
  const receipt = useQuery({
    queryKey: ["payment-receipt", schoolId, userId, paymentId],
    enabled: requested,
    queryFn: async () =>
      paymentRequest<{ url: string }>(
        schoolId,
        await getToken(),
        `history/${paymentId}/receipt`,
      ),
    retry: false,
    staleTime: 0,
  });

  let receiptLabel = "View receipt";

  if (receipt.isFetching) {
    receiptLabel = "Loading receipt...";
    } else if (receipt.isError) {
    receiptLabel = "Retry receipt";
  }

  if (receipt.data)
    return (
      <a
        href={receipt.data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 underline"
      >
        Open receipt
      </a>
    );

  return (
    <div>
      <button
        type="button"
        disabled={receipt.isFetching}
        onClick={() =>
          requested ? void receipt.refetch() : setRequested(true)
        }
        className="text-xs text-blue-600 underline"
      >
       {receiptLabel}
      </button>
      {receipt.isError && (
        <p role="alert" className="mt-1 max-w-48 text-xs text-red-600">
          {receipt.error.message}
        </p>
      )}
    </div>
  );
}

export function PaymentsSettings() {
  const schoolId = useSchoolId();
  const { getToken, userId, isSignedIn } = useAuth();
  const history = useInfiniteQuery({
    queryKey: ["student-payments", schoolId, userId],
    enabled: isSignedIn && !!userId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      paymentRequest<PaymentHistory>(
        schoolId,
        await getToken(),
        `history?offset=${pageParam}`,
      ),
    getNextPageParam: (last) => last.nextOffset,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const payments = history.data?.pages.flatMap((page) => page.payments) ?? [];
  return (
    <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
      <section>
        <h1 className="text-xl font-bold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your lesson and hour package payments and receipts.
        </p>
      </section>
      {history.isPending ? (
        <p>Loading payments...</p>
      ) : (
        <>
          {history.isError && (
            <div role="alert" className="text-sm text-red-600">
              <p>{history.error.message}</p>
              <button
                onClick={() => void history.refetch()}
                className="underline"
              >
                Try again
              </button>
            </div>
          )}
          {!history.isError && payments.length === 0 && (
            <p className="text-sm text-slate-500">No payments yet.</p>
          )}
          <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="flex justify-between gap-3 p-4"
              >
                <div>
                  <h2 className="text-sm font-semibold">
                    {payment.packageName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {formatLessonHoursLabel(payment.purchasedMinutes / 60)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatPaymentDate(payment.paidAt ?? payment.createdAt)}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-semibold">
                    {formatPaymentAmount(payment.amount, payment.currency)}
                  </p>
                  <p
                    className={`text-xs capitalize ${payment.status === "paid" ? "text-green-700" : "text-slate-600"}`}
                  >
                    {payment.status}
                  </p>
                  {payment.status === "paid" && (
                    <Receipt schoolId={schoolId} paymentId={payment.id} />
                  )}
                </div>
              </article>
            ))}
          </div>
          {history.hasNextPage && (
            <button
              type="button"
              disabled={history.isFetchingNextPage}
              onClick={() => void history.fetchNextPage()}
              className="w-full rounded-lg border border-slate-200 py-3 text-sm"
            >
              {history.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </main>
  );
}
