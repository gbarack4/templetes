"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";

type PasswordFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
}>;

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full rounded-xl border py-3 pl-4 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-300 bg-white ring-2 ring-red-100"
              : isFocused
                ? "border-blue-500 bg-white ring-2 ring-blue-100"
                : "border-slate-200 bg-white"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function isPasswordValid(password: string) {
  return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

const BUTTON_LOADING_MS = 2000;

export function ChangePasswordFlow() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const currentPasswordError =
    submitAttempted && !currentPassword ? "Enter your current password" : undefined;
  const newPasswordError =
    submitAttempted && !isPasswordValid(newPassword)
      ? "Use at least 8 characters with letters and numbers"
      : submitAttempted && newPassword === currentPassword
        ? "New password must be different"
        : undefined;
  const confirmPasswordError =
    submitAttempted && confirmPassword !== newPassword
      ? "Passwords do not match"
      : undefined;

  const canSave =
    currentPassword.length > 0 &&
    isPasswordValid(newPassword) &&
    newPassword !== currentPassword &&
    confirmPassword === newPassword;

  function goBack() {
    router.push("/dashboard/account");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!canSave || isSaving) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, BUTTON_LOADING_MS));
    setIsSaving(false);
    setIsConfirmed(true);
  }

  if (isConfirmed) {
    return (
      <FlowPageContent className="text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Password updated</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your password has been changed successfully.
          </p>
          <button
            type="button"
            onClick={goBack}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Account
          </button>
        </div>
      </FlowPageContent>
    );
  }

  return (
    <>
      <FlowPageHeader title="Change password" onBack={goBack} />
      <FlowPageContent className="pb-24">
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Choose a strong password you have not used elsewhere. You will stay signed
            in on this device.
          </p>
        </section>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            error={currentPasswordError}
          />
          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            error={newPasswordError}
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            error={confirmPasswordError}
          />

          <ul className="space-y-1.5 px-1 text-xs text-slate-500">
            <li>At least 8 characters</li>
            <li>Includes letters and numbers</li>
            <li>Different from your current password</li>
          </ul>

          <button
            type="submit"
            aria-busy={isSaving}
            className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 ${
              isSaving ? "pointer-events-none" : ""
            }`}
          >
            {isSaving ? <ButtonSpinner inverse /> : "Update password"}
          </button>
        </form>
      </FlowPageContent>
    </>
  );
}
