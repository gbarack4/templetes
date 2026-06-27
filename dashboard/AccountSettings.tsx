"use client";

import { useState } from "react";
import type { StudentAccount } from "./types";
import { mockStudentAccount } from "./mock-data";
import { useStudentAvatar } from "./useStudentAvatar";
import { EditProfilePhotoModal } from "./components/EditProfilePhotoModal";
import { ChevronRightIcon } from "./components/icons";

type AccountSettingsProps = Readonly<{
  account?: StudentAccount;
}>;

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
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  initialValue: string;
  onChange: (value: string) => void;
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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

export function AccountSettings({ account = mockStudentAccount }: AccountSettingsProps) {
  const [notifications, setNotifications] = useState(account.notifications);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const initialPersonalInfo = {
    fullName: `${account.firstName} ${account.lastName}`,
    email: account.email,
    phone: account.phone,
    address: account.address,
  };
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const avatarUrl = useStudentAvatar(account.avatarUrl);

  function updatePersonalInfo(field: keyof typeof personalInfo, value: string) {
    setPersonalInfo((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
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
            alt={`${personalInfo.fullName}'s profile`}
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900">{personalInfo.fullName}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{personalInfo.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPhotoModal(true)}
          className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit profile photo
        </button>
      </section>

      {showPhotoModal && (
        <EditProfilePhotoModal
          key={avatarUrl}
          currentAvatarUrl={avatarUrl}
          userName={personalInfo.fullName}
          onClose={() => setShowPhotoModal(false)}
          onSave={() => setShowPhotoModal(false)}
        />
      )}

      <SettingsSection title="Personal information" plain>
        <EditableField
          label="Full name"
          value={personalInfo.fullName}
          initialValue={initialPersonalInfo.fullName}
          onChange={(value) => updatePersonalInfo("fullName", value)}
        />
        <EditableField
          label="Email"
          type="email"
          value={personalInfo.email}
          initialValue={initialPersonalInfo.email}
          onChange={(value) => updatePersonalInfo("email", value)}
        />
        <EditableField
          label="Phone"
          type="tel"
          value={personalInfo.phone}
          initialValue={initialPersonalInfo.phone}
          onChange={(value) => updatePersonalInfo("phone", value)}
        />
        <EditableField
          label="Address"
          value={personalInfo.address}
          initialValue={initialPersonalInfo.address}
          onChange={(value) => updatePersonalInfo("address", value)}
        />
      </SettingsSection>

      <SettingsSection title="Driving details">
        <SettingsRow
          label="Learner permit"
          value={account.learnerPermitNumber}
          onClick={() => {}}
        />
        <SettingsRow label="Date of birth" value={account.dateOfBirth} onClick={() => {}} />
      </SettingsSection>

      <SettingsSection title="Emergency contact">
        <SettingsRow
          label="Contact name"
          value={account.emergencyContact.name}
          onClick={() => {}}
        />
        <SettingsRow
          label="Contact phone"
          value={account.emergencyContact.phone}
          onClick={() => {}}
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

      <SettingsSection title="Security">
        <SettingsRow label="Change password" onClick={() => {}} />
      </SettingsSection>

      <button
        type="button"
        className="w-full rounded-lg bg-red-50 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
      >
        Sign out
      </button>
    </main>
  );
}
