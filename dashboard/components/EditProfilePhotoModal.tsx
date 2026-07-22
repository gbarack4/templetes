"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  clearStudentAvatarUrl,
  DEFAULT_STUDENT_AVATAR,
  PRESET_AVATARS,
  setStudentAvatarUrl,
} from "../student-avatar";
import { useIsClient } from "@/shared/hooks/useIsClient";

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
  const [selectedUrl, setSelectedUrl] = useState(currentAvatarUrl);

  const isClient = useIsClient();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const scroller = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );
    const previousOverflow = scroller?.style.overflow ?? "";

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    if (scroller) scroller.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (scroller) scroller.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function handleSave() {
    setStudentAvatarUrl(selectedUrl);
    onSave(selectedUrl);
    onClose();
  }

  function handleRemove() {
    clearStudentAvatarUrl();
    onSave(DEFAULT_STUDENT_AVATAR);
    onClose();
  }

  const hasChanges = selectedUrl !== currentAvatarUrl;
  const isCustomPhoto = currentAvatarUrl !== DEFAULT_STUDENT_AVATAR;

  if (!isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
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
        className="absolute inset-x-0 bottom-0 z-10 mx-auto flex h-[85dvh] w-full max-w-md flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
          <h2
            id="edit-photo-title"
            className="text-lg font-bold text-slate-900"
          >
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6 [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col items-center">
            <img
              src={selectedUrl}
              alt={`${userName}'s profile preview`}
              className="h-24 w-24 rounded-full bg-slate-100 object-cover ring-4 ring-slate-100"
            />
            <p className="mt-3 text-center text-sm text-slate-500">
              Choose an avatar for your student profile.
            </p>
          </div>

          <div
            role="listbox"
            aria-label="Avatar options"
            className="mt-5 grid grid-cols-4 gap-3"
          >
            {PRESET_AVATARS.map((avatarUrl, index) => {
              const isSelected = selectedUrl === avatarUrl;

              return (
                <button
                  key={avatarUrl}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Avatar option ${index + 1}`}
                  onClick={() => setSelectedUrl(avatarUrl)}
                  className={`relative aspect-square overflow-hidden rounded-full bg-slate-100 transition ${
                    isSelected
                      ? "ring-2 ring-blue-600 ring-offset-2"
                      : "ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Save photo
          </button>

          {isCustomPhoto && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full rounded-lg py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Reset to default
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
