"use client";

import { createContext, useContext, useMemo } from "react";

export type SchoolBranding = Readonly<{
  schoolId: string;
  schoolName: string;
  logoUrl: string;
}>;

const SchoolContext = createContext<SchoolBranding | null>(null);

export function SchoolProvider({
  schoolId,
  schoolName = "",
  logoUrl = "",
  children,
}: Readonly<{
  schoolId: string;
  schoolName?: string;
  logoUrl?: string;
  children: React.ReactNode;
}>) {
  const value = useMemo(
    () => ({ schoolId, schoolName, logoUrl }),
    [schoolId, schoolName, logoUrl],
  );

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
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
