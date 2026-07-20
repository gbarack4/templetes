"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import type { StudentAccount } from "./types";
import { mockStudentAccount } from "./mock-data";
import { useStudentAvatar } from "./useStudentAvatar";
import { EditProfilePhotoModal } from "./components/EditProfilePhotoModal";
import { ChevronRightIcon } from "./components/icons";

type AccountSettingsProps = Readonly<{
  account?: StudentAccount;
}>;

const BUTTON_LOADING_MS = 2000;

function SettingsSection({
  title,
  children,
  plain = false,
}: Readonly<{
  title: string;
  children: React.ReactNode;
  plain?: boolean;
}>) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className={plain ? "space-y-4" : "overflow-hidden rounded-2xl bg-slate-50"}>
        {children}
      </div>
    </section>
  );
}

function EditableField({
  label,
  value,
  initialValue,
  onChange,
  onEditStart,
  onEditEnd,
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  initialValue: string;
  onChange: (value: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  type?: "text" | "email" | "tel";
}>) {
  const [isFocused, setIsFocused] = useState(false);
  const isEdited = value !== initialValue;
  const showBorder = isFocused || isEdited;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onEditStart?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onEditEnd?.();
          }}
          className={`w-full rounded-xl py-3 pl-4 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            showBorder
              ? isFocused
                ? "border border-blue-500 bg-white ring-2 ring-blue-100"
                : "border border-slate-200 bg-white"
              : "border border-transparent bg-transparent"
          }`}
        />
        <ChevronRightIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
}: Readonly<{
  label: string;
  value?: string;
  onClick?: () => void;
}>) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {value && <p className="mt-0.5 truncate text-sm text-slate-500">{value}</p>}
      </div>
      {onClick && (
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-b-0 hover:bg-slate-100/80"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0">
      {content}
    </div>
  );
}

function SettingsToggle({
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
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0">
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

function buildEmergencyContact(account: StudentAccount) {
  return {
    name: account.emergencyContact.name,
    phone: account.emergencyContact.phone,
  };
}

function SaveSectionButton({
  visible,
  onClick,
}: Readonly<{
  visible: boolean;
  onClick: () => void;
}>) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
    >
      Save
    </button>
  );
}

function useEditableSection<T extends Record<string, string>>(initial: T) {
  const [saved, setSaved] = useState(() => ({ ...initial }));
  const [values, setValues] = useState(() => ({ ...initial }));
  const [editing, setEditing] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasChanges = (Object.keys(saved) as (keyof T)[]).some(
    (key) => values[key] !== saved[key],
  );
  const showSave = editing || hasChanges;

  function handleFocus() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setEditing(true);
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => {
      setEditing(false);
    }, 120);
  }

  function update(field: keyof T, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function save() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setSaved(values);
    setEditing(false);
  }

  return { saved, values, showSave, handleFocus, handleBlur, update, save };
}

export function AccountSettings({ account = mockStudentAccount }: AccountSettingsProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(account.notifications);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const emergencyContactSection = useEditableSection(buildEmergencyContact(account));
  const avatarUrl = useStudentAvatar(account.avatarUrl);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = `${account.firstName} ${account.lastName}`;

  function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    window.setTimeout(() => {
      router.push("/login");
    }, BUTTON_LOADING_MS);
  }

  return (
    <main className="flex-1 space-y-6 px-5 pb-6 pt-6">
      <section>
        <h1 className="text-xl font-bold text-slate-900">Account</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage your profile and preferences.
        </p>
      </section>

      <section className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={`${displayName}'s profile`}
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900">{displayName}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{account.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPhotoModal(true)}
          className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Add avatar
        </button>
      </section>

      {showPhotoModal && (
        <EditProfilePhotoModal
          key={avatarUrl}
          currentAvatarUrl={avatarUrl}
          userName={displayName}
          onClose={() => setShowPhotoModal(false)}
          onSave={() => setShowPhotoModal(false)}
        />
      )}

      <SettingsSection title="Profile">
        <SettingsRow
          label="Personal information"
          value={`${account.firstName} ${account.lastName}`}
          onClick={() => router.push("/dashboard/account/personal-information")}
        />
        <SettingsRow
          label="Driving details"
          value={account.learnerPermitNumber}
          onClick={() => router.push("/dashboard/account/driving-details")}
        />
      </SettingsSection>

      <SettingsSection title="Emergency contact" plain>
        <EditableField
          label="Contact name"
          value={emergencyContactSection.values.name}
          initialValue={emergencyContactSection.saved.name}
          onChange={(value) => emergencyContactSection.update("name", value)}
          onEditStart={emergencyContactSection.handleFocus}
          onEditEnd={emergencyContactSection.handleBlur}
        />
        <EditableField
          label="Contact phone"
          type="tel"
          value={emergencyContactSection.values.phone}
          initialValue={emergencyContactSection.saved.phone}
          onChange={(value) => emergencyContactSection.update("phone", value)}
          onEditStart={emergencyContactSection.handleFocus}
          onEditEnd={emergencyContactSection.handleBlur}
        />
        <SaveSectionButton
          visible={emergencyContactSection.showSave}
          onClick={emergencyContactSection.save}
        />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsToggle
          label="Lesson reminders"
          description="Get notified before upcoming lessons"
          enabled={notifications.lessonReminders}
          onChange={(lessonReminders) =>
            setNotifications((current) => ({ ...current, lessonReminders }))
          }
        />
        <SettingsToggle
          label="Email updates"
          description="Receive news and promotions by email"
          enabled={notifications.emailUpdates}
          onChange={(emailUpdates) =>
            setNotifications((current) => ({ ...current, emailUpdates }))
          }
        />
      </SettingsSection>

      <SettingsSection title="Links">
        <SettingsRow
          label="Connect sign in links"
          onClick={() => router.push("/dashboard/account/sign-in-links")}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow
          label="Change password"
          onClick={() => router.push("/dashboard/account/change-password")}
        />
        <SettingsRow
          label="Privacy and data"
          onClick={() => router.push("/dashboard/account/privacy-and-data")}
        />
      </SettingsSection>

      <button
        type="button"
        aria-busy={isSigningOut}
        onClick={handleSignOut}
        className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100 ${
          isSigningOut ? "pointer-events-none" : ""
        }`}
      >
        {isSigningOut ? (
          <ButtonSpinner className="border-red-200 border-t-red-600" />
        ) : (
          "Sign out"
        )}
      </button>
    </main>
  );
}
