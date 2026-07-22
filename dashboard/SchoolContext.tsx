"use client";

import { createContext, useContext, useMemo } from "react";

const SchoolContext = createContext<{ schoolId: string } | null>(null);

export function SchoolProvider({
  schoolId,
  children,
}: Readonly<{
  schoolId: string;
  children: React.ReactNode;
}>) {
  const value = useMemo(() => ({ schoolId }), [schoolId]);

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchoolId() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchoolId must be used within SchoolProvider");
  }
  return context.schoolId;
}
