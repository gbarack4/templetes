"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentProfile } from "@/lib/student-api";
import { useSchoolId } from "@/dashboard/SchoolContext";

export interface StudentData {
  id: string;
  schoolId: string;
  name: string;
  email: string | null;
  phone: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    address: string | null;
  };
}

export function useStudent() {
  const schoolId = useSchoolId();

  const {
    data: student = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<StudentData>({
    queryKey: ["student", schoolId],
    queryFn: () => fetchStudentProfile(schoolId!),
    enabled: Boolean(schoolId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    student,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
