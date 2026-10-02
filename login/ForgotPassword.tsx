"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AUTH_BUTTON, AUTH_INPUT } from "@/lib/auth/AuthForm";
import { authErrorMessage } from "@/lib/auth/errors";

export function ForgotPassword({
  loginHref = "/login",
}: Readonly<{ loginHref?: string }>) {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "done">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (stage === "email") {
        await auth.requestReset(email);
        setStage("code");
      } else {
        if (password !== confirmation) throw new Error("Passwords do not match.");
        await auth.confirmReset(email, code, password);
        setPassword("");
        setConfirmation("");
        setStage("done");
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <FlowPageHeader title="Reset password" onBack={() => router.push(loginHref)} />
      <main className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-6">
        {stage === "done" ? (
          <p role="status">Your password has been updated. You can now sign in.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {(error || auth.configError) && (
              <p role="alert" className="text-sm text-red-600">
                {error || auth.configError}
              </p>
            )}
            {stage === "email" ? (
              <label className="block space-y-1.5 text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={AUTH_INPUT}
                />
              </label>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  If this account can reset its password, a code has been sent to {email}.
                </p>
                <label className="block space-y-1.5 text-sm font-medium">
                  Code
                  <input
                    required
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={AUTH_INPUT}
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">
                  New password
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={AUTH_INPUT}
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">
                  Confirm password
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className={AUTH_INPUT}
                  />
                </label>
              </>
            )}
            <button
              type="submit"
              disabled={busy || !!auth.configError}
              className={AUTH_BUTTON}
            >
              {busy
                ? "Please wait..."
                : stage === "email"
                  ? "Send reset code"
                  : "Update password"}
            </button>
            {stage === "code" && (
              <button
                type="button"
                disabled={busy}
                className="text-sm text-blue-600"
                onClick={() => setStage("email")}
              >
                Request another code
              </button>
            )}
          </form>
        )}
        <Link href={loginHref} className="text-sm font-medium text-blue-600">
          Back to sign in
        </Link>
      </main>
    </>
  );
}
