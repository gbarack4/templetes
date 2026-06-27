"use client";

import { useEffect, useState } from "react";
import {
  AVATAR_UPDATED_EVENT,
  DEFAULT_STUDENT_AVATAR,
  getStudentAvatarUrl,
} from "./student-avatar";

export function useStudentAvatar(fallback = DEFAULT_STUDENT_AVATAR) {
  const [avatarUrl, setAvatarUrl] = useState(fallback);

  useEffect(() => {
    setAvatarUrl(getStudentAvatarUrl(fallback));

    function handleAvatarUpdate(event: Event) {
      const nextUrl = (event as CustomEvent<string | null>).detail;
      setAvatarUrl(nextUrl ?? fallback);
    }

    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate);
  }, [fallback]);

  return avatarUrl;
}
