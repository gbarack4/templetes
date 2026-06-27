import type { Metadata } from "next";
import { PaymentsSettings } from "@/dashboard/PaymentsSettings";

export const metadata: Metadata = {
  title: "Payments | Driving School",
  description: "Manage your payment methods.",
};

export default function PaymentsPage() {
  return <PaymentsSettings />;
}
