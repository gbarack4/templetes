const STORAGE_KEY = "student-avatar-url";
export const DEFAULT_STUDENT_AVATAR = "/avatars/presets/avatar-01.svg";
export const AVATAR_UPDATED_EVENT = "student-avatar-updated";

export const PRESET_AVATARS = [
  "/avatars/presets/avatar-01.svg",
  "/avatars/presets/avatar-02.svg",
  "/avatars/presets/avatar-03.svg",
  "/avatars/presets/avatar-04.svg",
  "/avatars/presets/avatar-05.svg",
  "/avatars/presets/avatar-06.svg",
  "/avatars/presets/avatar-07.svg",
  "/avatars/presets/avatar-08.svg",
  "/avatars/presets/avatar-09.svg",
  "/avatars/presets/avatar-10.svg",
  "/avatars/presets/avatar-11.svg",
  "/avatars/presets/avatar-12.svg",
  "/avatars/presets/avatar-13.svg",
  "/avatars/presets/avatar-14.svg",
  "/avatars/presets/avatar-15.svg",
  "/avatars/presets/avatar-16.svg",
  "/avatars/presets/avatar-17.svg",
  "/avatars/presets/avatar-18.svg",
  "/avatars/presets/avatar-19.svg",
  "/avatars/presets/avatar-20.svg",
  "/avatars/presets/avatar-21.svg",
  "/avatars/presets/avatar-22.svg",
  "/avatars/presets/avatar-23.svg",
  "/avatars/presets/avatar-24.svg",
  "/avatars/presets/avatar-25.svg",
  "/avatars/presets/avatar-26.svg",
  "/avatars/presets/avatar-27.svg",
  "/avatars/presets/avatar-28.svg",
  "/avatars/presets/avatar-29.svg",
  "/avatars/presets/avatar-30.svg",
  "/avatars/presets/avatar-31.svg",
  "/avatars/presets/avatar-32.svg",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function getStudentAvatarUrl(fallback = DEFAULT_STUDENT_AVATAR): string {
  if (typeof window === "undefined") return fallback;
  return sessionStorage.getItem(STORAGE_KEY) ?? fallback;
}

function dispatchAvatarUpdate(url: string | null) {
  window.dispatchEvent(
    new CustomEvent<string | null>(AVATAR_UPDATED_EVENT, { detail: url }),
  );
}

export function setStudentAvatarUrl(url: string) {
  sessionStorage.setItem(STORAGE_KEY, url);
  dispatchAvatarUpdate(url);
}

export function clearStudentAvatarUrl() {
  sessionStorage.removeItem(STORAGE_KEY);
  dispatchAvatarUpdate(null);
}

export function validateProfilePhoto(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }

  return null;
}

export async function compressProfilePhoto(file: File): Promise<string> {
  const validationError = validateProfilePhoto(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const bitmap = await createImageBitmap(file);
  const maxSize = 256;
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not process this image.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}
