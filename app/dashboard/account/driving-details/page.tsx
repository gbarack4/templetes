import type { Metadata } from "next";
import { DrivingDetailsFlow } from "@/dashboard/DrivingDetailsFlow";

export const metadata: Metadata = {
  title: "Driving Details | Driving School",
  description: "Update your learner permit and date of birth.",
};

export default function DrivingDetailsPage() {
  return <DrivingDetailsFlow />;
}
