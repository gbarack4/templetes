"use client";

import { createContext, useContext, useMemo } from "react";
import { StudentAuthProvider } from "@/lib/auth/AuthProvider";
import { authScope, type StudentAuthConfig } from "@/lib/auth/types";

export type SchoolBranding = Readonly<{
  schoolId: string;
  schoolName: string;
  logoUrl: string;
  authKey: string;
}>;

const SchoolContext = createContext<SchoolBranding | null>(null);

export function SchoolProvider({
  schoolId,
  schoolName = "",
  logoUrl = "",
  children,
  authConfig = null,
  authError = null,
}: Readonly<{
  schoolId: string;
  authConfig?: StudentAuthConfig | null;
  authError?: string | null;
  schoolName?: string;
  logoUrl?: string;
  children: React.ReactNode;
}>) {
  const parentSchool = useContext(SchoolContext);
  const authKey = authConfig ? authScope(authConfig) : `${schoolId}:unconfigured`;
  const value = useMemo(
    () => ({ schoolId, schoolName, logoUrl, authKey }),
    [schoolId, schoolName, logoUrl, authKey],
  );

  return (
    <SchoolContext.Provider value={value}>
      {schoolId && parentSchool?.authKey === authKey ? (
        children
      ) : (
        <StudentAuthProvider
          key={authConfig ? authScope(authConfig) : `${schoolId}:unconfigured`}
          config={authConfig}
          error={authError}
        >
          {children}
        </StudentAuthProvider>
      )}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchool must be used within SchoolProvider");
  }
  return context;
}

export function useSchoolId() {
  return useSchool().schoolId;
}
