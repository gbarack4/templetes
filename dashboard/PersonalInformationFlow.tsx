"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { ChevronRightIcon } from "./components/icons";
import {
  useStudent,
  useUpdateStudentPersonalInfo,
  type StudentData,
} from "@/shared/hooks/useStudent";

function EditableField({
  label,
  value,
  initialValue,
  onChange,
  onEditStart,
  onEditEnd,
  type = "text",
  disabled = false,
  helperText,
}: Readonly<{
  label: string;
  value: string;
  initialValue: string;
  onChange: (value: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  type?: "text" | "email" | "tel";
  disabled?: boolean;
  helperText?: string;
}>) {
  const [isFocused, setIsFocused] = useState(false);
  const isEdited = value !== initialValue;
  const showBorder = isFocused || isEdited;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onEditStart?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onEditEnd?.();
          }}
          className={`w-full rounded-xl py-3 pl-4 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400 ${
            showBorder
              ? isFocused
                ? "border border-blue-500 bg-white ring-2 ring-blue-100"
                : "border border-slate-200 bg-white"
              : "border border-transparent bg-slate-50"
          }`}
        />
        {!disabled && (
          <ChevronRightIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
      </div>
      {helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}

function useEditableSection(initial: {
  fullName: string;
  phone: string;
  address: string;
}) {
  const [saved, setSaved] = useState(() => ({ ...initial }));
  const [values, setValues] = useState(() => ({ ...initial }));
  const [editing, setEditing] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasChanges = (Object.keys(saved) as (keyof typeof saved)[]).some(
    (key) => values[key] !== saved[key],
  );
  const showSave = editing || hasChanges;

  function handleFocus() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setEditing(true);
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => {
      setEditing(false);
    }, 120);
  }

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function commit() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setSaved(values);
    setEditing(false);
  }

  return { saved, values, showSave, handleFocus, handleBlur, update, commit };
}

function PersonalInformationForm({
  student,
  onSaved,
}: Readonly<{ student: StudentData; onSaved: () => void }>) {
  const fullName =
    student.name ||
    [student.user?.firstName, student.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "";

  const email = student.email || student.user?.email || "";
  const phone = student.phone || student.user?.phoneNumber || "";
  const address = student.user?.address || "";

  const section = useEditableSection({ fullName, phone, address });
  const { mutate: savePersonalInfo, isPending } =
    useUpdateStudentPersonalInfo();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    savePersonalInfo(
      {
        fullName: section.values.fullName,
        phone: section.values.phone || null,
        address: section.values.address || null,
      },
      {
        onSuccess: () => {
          section.commit();
          onSaved();
        },
        onError: () =>
          setError("Couldn't save your changes. Please try again."),
      },
    );
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        <EditableField
          label="Full name"
          value={section.values.fullName}
          initialValue={section.saved.fullName}
          onChange={(value) => section.update("fullName", value)}
          onEditStart={section.handleFocus}
          onEditEnd={section.handleBlur}
        />
        <EditableField
          label="Email"
          type="email"
          value={email}
          initialValue={email}
          onChange={() => {}}
          disabled
          helperText="Managed through your sign-in settings"
        />
        <EditableField
          label="Phone"
          type="tel"
          value={section.values.phone}
          initialValue={section.saved.phone}
          onChange={(value) => section.update("phone", value)}
          onEditStart={section.handleFocus}
          onEditEnd={section.handleBlur}
        />
        <EditableField
          label="Address"
          value={section.values.address}
          initialValue={section.saved.address}
          onChange={(value) => section.update("address", value)}
          onEditStart={section.handleFocus}
          onEditEnd={section.handleBlur}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {section.showSave ? (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleSave}
          disabled={isPending}
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      ) : null}
    </>
  );
}

export function PersonalInformationFlow() {
  const router = useRouter();
  const { student, loading, error } = useStudent();
  const [isSaved, setIsSaved] = useState(false);

  function goBack() {
    router.push("/dashboard/account");
  }

  if (isSaved) {
    return (
      <FlowPageContent className="text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Details updated
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your personal information has been saved successfully.
          </p>
          <button
            type="button"
            onClick={goBack}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Account
          </button>
        </div>
      </FlowPageContent>
    );
  }

  return (
    <>
      <FlowPageHeader title="Personal information" onBack={goBack} />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          Update your contact details used for lessons and account access.
        </p>

        {loading ? (
          <div className="mt-8 py-8 text-center text-sm text-slate-500">
            Loading information...
          </div>
        ) : error ? (
          <div className="mt-8 py-8 text-center text-sm text-red-500">
            Error: {error}
          </div>
        ) : student ? (
          <PersonalInformationForm
            student={student}
            onSaved={() => setIsSaved(true)}
          />
        ) : null}
      </FlowPageContent>
    </>
  );
}
