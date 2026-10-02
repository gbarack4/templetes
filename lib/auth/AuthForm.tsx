"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { authErrorMessage, errorName } from "./errors";

export const AUTH_INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
export const AUTH_BUTTON =
  "w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400";

function submitLabel(
  busy: boolean,
  profileRequired: boolean,
  verifying: boolean,
  isSignup: boolean,
): string {
  if (busy) return "Please wait...";
  if (profileRequired) return "Save and continue";
  if (verifying) return "Verify and sign in";
  return isSignup ? "Create account" : "Sign in";
}

type FieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
}>;
function Field({ label, value, onChange, ...props }: FieldProps) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      {label}
      <input
        required
        {...props}
        className={AUTH_INPUT}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CredentialFields({
  verifying,
  confirmed,
  isSignup,
  email,
  password,
  code,
  setEmail,
  setPassword,
  setCode,
}: Readonly<{
  verifying: boolean;
  confirmed: boolean;
  isSignup: boolean;
  email: string;
  password: string;
  code: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setCode: (value: string) => void;
}>) {
  return (
    <>
      {!verifying && (
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
      )}
      {verifying && (
        <p className="text-sm text-slate-600">
          Enter the verification code sent to {email}.
        </p>
      )}
      <Field
        label="Password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        value={password}
        onChange={setPassword}
      />
      {isSignup && !verifying && (
        <p className="text-xs text-slate-500">
          Use a strong password with uppercase and lowercase letters, a number and a
          symbol.
        </p>
      )}
      {verifying && !confirmed && (
        <Field
          label="Verification code"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
        />
      )}
    </>
  );
}

export function AuthForm({
  mode,
  onComplete,
}: Readonly<{
  mode: "sign-in" | "sign-up";
  onComplete: () => void;
}>) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const completed = useRef(false);
  const isSignup = mode === "sign-up";
  const profile = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phoneNumber: phoneNumber.trim(),
  };

  useEffect(() => {
    if (auth.isSignedIn && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [auth.isSignedIn, onComplete]);

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (auth.hasSession) {
        await auth.syncProfile(profile);
      } else if (verifying) {
        if (!confirmed) {
          await auth.confirm(email, code);
          setConfirmed(true);
        }
        await auth.signIn(email, password, isSignup ? profile : undefined);
        setPassword("");
      } else if (isSignup) {
        const alreadyConfirmed = await auth.signUp(email, password);
        if (alreadyConfirmed) {
          await auth.signIn(email, password, profile);
          setPassword("");
        } else setVerifying(true);
      } else {
        await auth.signIn(email, password);
        setPassword("");
      }
    } catch (err) {
      if (errorName(err) === "UserNotConfirmedException") {
        setVerifying(true);
        setNotice("Your email is not verified. Enter your code or request a new one.");
      } else setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await auth.resend(email);
      setNotice("A new verification code has been sent.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    setBusy(true);
    setError("");
    try {
      await auth.retry();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!auth.isLoaded)
    return (
      <p role="status" className="text-sm text-slate-500">
        Restoring your session...
      </p>
    );
  if (auth.configError)
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {auth.configError}
        </p>
        <button
          type="button"
          className={AUTH_BUTTON}
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  if (auth.isSignedIn)
    return (
      <p role="status" className="text-sm text-slate-500">
        Opening your account...
      </p>
    );
  if (auth.hasSession && !auth.profileRequired)
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm text-slate-500">
          Completing your student account...
        </p>
        {(error || auth.error) && (
          <p role="alert" className="text-sm text-red-600">
            {error || auth.error}
          </p>
        )}
        <button type="button" className={AUTH_BUTTON} disabled={busy} onClick={retry}>
          Retry
        </button>
        <button
          type="button"
          disabled={busy}
          className="text-sm text-blue-600"
          onClick={() => {
            void auth.signOut().catch((err: unknown) => setError(authErrorMessage(err)));
          }}
        >
          Sign out
        </button>
      </div>
    );

  const showProfile = auth.profileRequired || (isSignup && !verifying);
  return (
    <form onSubmit={submit} className="space-y-4">
      {(error || auth.error) && (
        <p role="alert" className="text-sm text-red-600">
          {error || auth.error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-slate-600">
          {notice}
        </p>
      )}
      {auth.profileRequired && (
        <p className="text-sm text-slate-600">
          Finish your profile to continue booking lessons.
        </p>
      )}
      {showProfile && (
        <>
          <Field
            label="First name"
            maxLength={100}
            autoComplete="given-name"
            value={firstName}
            onChange={setFirstName}
          />
          <Field
            label="Last name"
            maxLength={100}
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
          />
          <Field
            label="Phone"
            type="tel"
            minLength={7}
            maxLength={50}
            autoComplete="tel"
            value={phoneNumber}
            onChange={setPhoneNumber}
          />
        </>
      )}
      {!auth.hasSession && (
        <CredentialFields
          verifying={verifying}
          confirmed={confirmed}
          isSignup={isSignup}
          email={email}
          password={password}
          code={code}
          setEmail={setEmail}
          setPassword={setPassword}
          setCode={setCode}
        />
      )}
      <button type="submit" disabled={busy} className={AUTH_BUTTON}>
        {submitLabel(busy, auth.profileRequired, verifying, isSignup)}
      </button>
      {verifying && !confirmed && (
        <button
          type="button"
          disabled={busy}
          onClick={resend}
          className="text-sm font-medium text-blue-600"
        >
          Resend code
        </button>
      )}
      {!auth.hasSession && auth.error && (
        <button
          type="button"
          disabled={busy}
          onClick={retry}
          className="block text-sm text-blue-600"
        >
          Retry saved session
        </button>
      )}
    </form>
  );
}
