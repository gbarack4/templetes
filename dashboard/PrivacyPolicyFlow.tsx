"use client";

import { useRouter } from "next/navigation";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";

const SECTIONS = [
  {
    title: "Information we collect",
    body: "We collect your name, email, phone number, address, learner permit details, date of birth, lesson bookings, payment history, and any notes linked to your lessons. This information is provided by you or created when you use the booking app.",
  },
  {
    title: "How we use your information",
    body: "We use your data to schedule and confirm lessons, share pickup details with your instructor, send reminders and important account updates, process payments, and keep records required for school operations.",
  },
  {
    title: "Who we share with",
    body: "Instructors only see what they need for a booked session, such as your name, contact details, and pickup location. We do not sell your personal information to third parties. Service providers that help us run payments or messaging may process data on our behalf under strict agreements.",
  },
  {
    title: "How we protect your data",
    body: "Personal details are stored securely with access limited to authorised school staff and systems. We use industry-standard safeguards to protect your account and booking information.",
  },
  {
    title: "Your rights",
    body: "You can update your profile details in Account settings, download a copy of your data, or delete your account from Privacy and data. If you have questions about your information, contact your driving school.",
  },
  {
    title: "Data retention",
    body: "Active account data is kept while you remain a student. After you delete your account, personal details are removed within 30 days, except records we must keep for legal or payment reasons.",
  },
] as const;

export function PrivacyPolicyFlow() {
  const router = useRouter();

  return (
    <>
      <FlowPageHeader
        title="Privacy policy"
        onBack={() => router.push("/dashboard/account/privacy-and-data")}
      />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          Last updated July 2026. This policy explains how we collect, use, and
          protect your information when you use the driving school booking app.
        </p>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </FlowPageContent>
    </>
  );
}
