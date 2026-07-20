"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { ChevronRightIcon } from "./components/icons";

const BUTTON_LOADING_MS = 2000;

const DATA_WE_STORE = [
  "Name, email, phone, and address",
  "Learner permit and date of birth",
  "Lesson bookings and payment history",
  "Instructor notes linked to your lessons",
] as const;

const HOW_WE_USE_DATA = [
  "Schedule and confirm your driving lessons",
  "Share pickup details with your instructor",
  "Send reminders and important account updates",
  "Keep records required for school operations",
] as const;

function PreferenceToggle({
  label,
  description,
  enabled,
  onChange,
}: Readonly<{
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InfoList({
  title,
  items,
}: Readonly<{
  title: string;
  items: readonly string[];
}>) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-700">
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PrivacyAndDataFlow() {
  const router = useRouter();
  const [shareWithInstructor, setShareWithInstructor] = useState(true);
  const [usageAnalytics, setUsageAnalytics] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === "delete";

  function handleDownload() {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadDone(false);
    window.setTimeout(() => {
      setIsDownloading(false);
      setDownloadDone(true);
    }, BUTTON_LOADING_MS);
  }

  function handleDelete() {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    window.setTimeout(() => {
      router.push("/login");
    }, BUTTON_LOADING_MS);
  }

  return (
    <>
      <FlowPageHeader
        title="Privacy and data"
        onBack={() => router.push("/dashboard/account")}
      />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          See what we keep, control how it is used, and manage your account data.
        </p>

        <InfoList title="Data we store" items={DATA_WE_STORE} />
        <InfoList title="How we use your data" items={HOW_WE_USE_DATA} />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your choices
          </h2>
          <div className="mt-1">
            <PreferenceToggle
              label="Share details with instructors"
              description="Allow instructors to see your contact and pickup info for booked lessons"
              enabled={shareWithInstructor}
              onChange={setShareWithInstructor}
            />
            <PreferenceToggle
              label="Help improve the app"
              description="Share anonymous usage data to fix issues and improve booking"
              enabled={usageAnalytics}
              onChange={setUsageAnalytics}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your data
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Download a copy of your profile, bookings, and payment history. We will
            prepare a file you can keep for your records.
          </p>
          <button
            type="button"
            aria-busy={isDownloading}
            disabled={isDownloading}
            onClick={handleDownload}
            className={`mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 ${
              isDownloading ? "pointer-events-none" : ""
            }`}
          >
            {isDownloading ? (
              <ButtonSpinner className="border-slate-200 border-t-slate-700" />
            ) : downloadDone ? (
              "Download ready"
            ) : (
              "Download my data"
            )}
          </button>
          {downloadDone ? (
            <p className="mt-2 text-xs text-slate-500">
              In a live app, a download link would be emailed to you.
            </p>
          ) : null}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Policies
          </h2>
          <div className="mt-2 overflow-hidden rounded-2xl bg-slate-50">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/account/privacy-and-data/privacy-policy")
              }
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-100/80"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">Privacy policy</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  How we collect, use, and protect your information
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Delete account</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Permanently delete your account, booking history, and personal details.
            This cannot be undone.
          </p>

          {!confirmOpen ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="mt-4 w-full rounded-lg border border-red-200 bg-white py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete account
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-900">
                  Type <span className="font-semibold">delete</span> to confirm
                </span>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  autoComplete="off"
                  placeholder="delete"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmText("");
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  aria-busy={isDeleting}
                  disabled={!canDelete || isDeleting}
                  onClick={handleDelete}
                  className={`inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isDeleting ? "pointer-events-none" : ""
                  }`}
                >
                  {isDeleting ? (
                    <ButtonSpinner className="border-red-200 border-t-white" />
                  ) : (
                    "Delete forever"
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </FlowPageContent>
    </>
  );
}
