"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  formatLessonHoursLabel,
  mockDashboardData,
  mockHourPackages,
} from "./mock-data";
import { useStudentCreditHours } from "./useStudentCreditHours";
import { CardPaymentForm } from "./components/CardPaymentForm";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { CalendarIcon } from "./components/icons";

type BuyHoursFlowProps = Readonly<{
  initialCreditHours?: number;
}>;

export function BuyHoursFlow({
  initialCreditHours = mockDashboardData.availableCreditHours,
}: BuyHoursFlowProps) {
  const router = useRouter();
  const [currentCreditHours, setCurrentCreditHours] = useStudentCreditHours(
    initialCreditHours,
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedPackage = mockHourPackages.find(
    (pkg) => pkg.id === selectedPackageId,
  );

  function goToDashboard() {
    router.push("/dashboard");
  }

  function handlePurchaseComplete() {
    if (!selectedPackage) return;
    setCurrentCreditHours((hours) => hours + selectedPackage.hours);
    setIsConfirmed(true);
  }

  if (isConfirmed && selectedPackage) {
    return (
      <main className="flex flex-1 flex-col px-5 pb-24 pt-6 text-center">
        <div className="flex flex-1 flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Hours added</h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatLessonHoursLabel(selectedPackage.hours)} have been added to your
            account.
          </p>
          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Package purchased
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {selectedPackage.label}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatCurrency(selectedPackage.price)} paid
            </p>
            <p className="mt-3 text-sm text-slate-500">
              New balance:{" "}
              <span className="font-semibold text-slate-900">
                {formatLessonHoursLabel(currentCreditHours + selectedPackage.hours)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={goToDashboard}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (showPayment && selectedPackage) {
    return (
      <>
        <FlowPageHeader title="Payment" onBack={() => setShowPayment(false)} />
        <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
          <section className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Package summary
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {selectedPackage.label}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatCurrency(selectedPackage.pricePerHour)}/hour
              {selectedPackage.savingsLabel && ` · ${selectedPackage.savingsLabel}`}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
              <span>Total due</span>
              <span>{formatCurrency(selectedPackage.price)}</span>
            </div>
          </section>

          <CardPaymentForm
            amount={selectedPackage.price}
            onBack={() => setShowPayment(false)}
            backLabel="Back to packages"
            onComplete={handlePurchaseComplete}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <FlowPageHeader title="Buy hours" onBack={goToDashboard} />
      <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
        <section className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">Current balance</p>
            <p className="text-base font-bold text-slate-900">
              {formatLessonHoursLabel(currentCreditHours)}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Choose a package</h2>
          <div className="space-y-3">
            {mockHourPackages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`relative w-full rounded-2xl p-4 text-left transition ${
                    isSelected
                      ? "bg-blue-50 ring-2 ring-blue-600"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {pkg.badge}
                    </span>
                  )}
                  <p className="text-sm font-medium text-slate-600">{pkg.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(pkg.price)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(pkg.pricePerHour)}/hour
                    {pkg.savingsLabel && (
                      <span className="ml-1 font-medium text-green-600">
                        · {pkg.savingsLabel}
                      </span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {selectedPackage && (
          <button
            type="button"
            onClick={() => setShowPayment(true)}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Continue to payment · {formatCurrency(selectedPackage.price)}
          </button>
        )}
      </main>
    </>
  );
}
