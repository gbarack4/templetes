import type { Metadata } from "next";
import { Dashboard } from "@/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Driving School",
  description: "Your driving lesson overview.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
