import type { Metadata } from "next";
import { BuyHoursFlow } from "@/dashboard/BuyHoursFlow";

export const metadata: Metadata = {
  title: "Buy Hours | Driving School",
  description: "Purchase driving lesson hours.",
};

export default function BuyHoursPage() {
  return <BuyHoursFlow />;
}
