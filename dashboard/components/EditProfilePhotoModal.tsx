"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearStudentAvatarUrl,
  compressProfilePhoto,
  DEFAULT_STUDENT_AVATAR,
  setStudentAvatarUrl,
} from "../student-avatar";

type EditProfilePhotoModalProps = Readonly<{
  currentAvatarUrl: string;
  userName: string;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
}>;

export function EditProfilePhotoModal({
  currentAvatarUrl,
  userName,
  onClose,
  onSave,
}: EditProfilePhotoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);
    setIsSaving(true);

    try {
      const dataUrl = await compressProfilePhoto(file);
      setPreviewUrl(dataUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this image.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSave() {
    setStudentAvatarUrl(previewUrl);
    onSave(previewUrl);
    onClose();
  }

  function handleRemove() {
    clearStudentAvatarUrl();
    onSave(DEFAULT_STUDENT_AVATAR);
    onClose();
  }

  const hasChanges = previewUrl !== currentAvatarUrl;
  const isCustomPhoto = previewUrl !== DEFAULT_STUDENT_AVATAR;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close photo editor"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-photo-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="edit-photo-title" className="text-lg font-bold text-slate-900">
            Edit profile photo
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={previewUrl}
            alt={`${userName}'s profile preview`}
            className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-100"
          />
          <p className="mt-4 text-sm text-slate-500">
            Choose a clear photo of yourself for your student profile.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isSaving ? "Processing..." : "Choose photo"}
          </button>

          {hasChanges && (
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Save photo
            </button>
          )}

          {isCustomPhoto && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full rounded-lg py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
