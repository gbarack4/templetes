import type { Metadata } from "next";
import { AccountSettings } from "@/dashboard/AccountSettings";

export const metadata: Metadata = {
  title: "Account | Driving School",
  description: "Manage your student account settings.",
};

export default function AccountPage() {
  return <AccountSettings />;
}
