import { DashboardInstructorProfile } from "@/dashboard/DashboardInstructorProfile";

export default async function DashboardInstructorProfilePage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <DashboardInstructorProfile instructorId={id} />;
}
