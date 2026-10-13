import type { Metadata } from "next";
import { PaymentsSettings } from "@/dashboard/PaymentsSettings";

export const metadata: Metadata = {
  title: "Payments | Driving School",
  description: "View your payments and receipts.",
};

export default function PaymentsPage() {
  return <PaymentsSettings />;
}
