"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { DEFAULT_STUDENT_AVATAR } from "./student-avatar";
import { mockStudentAccount } from "./mock-data";
import { EditProfilePhotoModal } from "./components/EditProfilePhotoModal";
import { ChevronRightIcon, CloseIcon } from "./components/icons";
import { useClerk } from "@clerk/nextjs";
import { useStudent } from "@/shared/hooks/useStudent";

function SettingsSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl bg-slate-50">{children}</div>
    </section>
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
        {value && (
          <p className="mt-0.5 truncate text-sm text-slate-500">{value}</p>
        )}
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

export function AccountSettings() {
  const router = useRouter();
  const { signOut } = useClerk();
  const {
    student,
    loading: studentLoading,
    error: studentError,
  } = useStudent();

  const [notifications, setNotifications] = useState({
    lessonReminders: true,
    emailUpdates: false,
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const avatarUrl =
    student?.avatarUrl || student?.user?.avatarUrl || DEFAULT_STUDENT_AVATAR;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayName =
    student?.name ||
    [student?.user?.firstName, student?.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "User";

  const email = student?.email || student?.user?.email || "";
  const emergencyContactName = mockStudentAccount.emergencyContact.name;

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsSigningOut(false);
    }
  }

  if (studentLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading account...</div>
    );
  }

  if (studentError) {
    return (
      <div className="p-8 text-center text-red-500">Error: {studentError}</div>
    );
  }

  return (
    <>
      <header className="flex shrink-0 items-center px-5 pt-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          aria-label="Close"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>
      <main className="flex-1 space-y-6 px-5 pb-8 pt-2">
        <section>
          <h1 className="text-xl font-bold text-slate-900">Account</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage your profile and preferences.
          </p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-4">
            <Image
              src={
                imageError || !avatarUrl
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      displayName,
                    )}&background=random`
                  : avatarUrl
              }
              alt={`${displayName}'s profile`}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white"
              onError={() => setImageError(true)}
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900">{displayName}</p>
              <p className="mt-0.5 truncate text-sm text-slate-500">{email}</p>
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
            value={displayName}
            onClick={() =>
              router.push("/dashboard/account/personal-information")
            }
          />
          <SettingsRow
            label="Driving details"
            onClick={() => router.push("/dashboard/account/driving-details")}
          />
        </SettingsSection>

        <SettingsSection title="Emergency contact">
          <SettingsRow
            label="Emergency contact"
            value={emergencyContactName}
            onClick={() =>
              router.push("/dashboard/account/emergency-contact")
            }
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
    </>
  );
}
