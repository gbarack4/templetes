"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { fetchStudentProfile, updateStudentAvatar } from "@/lib/student-api";
import { useSchoolId } from "@/dashboard/SchoolContext";

export interface StudentData {
  id: string;
  schoolId: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
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
  const { getToken } = useAuth();

  const {
    data: student = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<StudentData>({
    queryKey: ["student", schoolId],
    queryFn: async () => {
      const token = await getToken();
      return fetchStudentProfile(schoolId, token);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    student,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useUpdateStudentAvatar() {
  const schoolId = useSchoolId();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarUrl: string | null) => {
      const token = await getToken();
      return updateStudentAvatar(schoolId, avatarUrl, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", schoolId] });
    },
  });
}
