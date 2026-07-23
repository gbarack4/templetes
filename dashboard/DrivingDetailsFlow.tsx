"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mockStudentAccount } from "./mock-data";
import type { StudentAccount } from "./types";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { ChevronRightIcon } from "./components/icons";

type DrivingDetailsFlowProps = Readonly<{
  account?: StudentAccount;
}>;

function EditableField({
  label,
  value,
  initialValue,
  onChange,
  onEditStart,
  onEditEnd,
}: Readonly<{
  label: string;
  value: string;
  initialValue: string;
  onChange: (value: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}>) {
  const [isFocused, setIsFocused] = useState(false);
  const isEdited = value !== initialValue;
  const showBorder = isFocused || isEdited;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onEditStart?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onEditEnd?.();
          }}
          className={`w-full rounded-xl py-3 pl-4 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            showBorder
              ? isFocused
                ? "border border-blue-500 bg-white ring-2 ring-blue-100"
                : "border border-slate-200 bg-white"
              : "border border-transparent bg-slate-50"
          }`}
        />
        <ChevronRightIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function useEditableSection(initial: {
  learnerPermitNumber: string;
  dateOfBirth: string;
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

  function save() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setSaved(values);
    setEditing(false);
  }

  return { saved, values, showSave, handleFocus, handleBlur, update, save };
}

export function DrivingDetailsFlow({
  account = mockStudentAccount,
}: DrivingDetailsFlowProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const section = useEditableSection({
    learnerPermitNumber: account.learnerPermitNumber,
    dateOfBirth: account.dateOfBirth,
  });

  function goBack() {
    router.push("/dashboard/account");
  }

  function handleSave() {
    section.save();
    setIsSaved(true);
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
            Your driving details have been saved successfully.
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
      <FlowPageHeader title="Driving details" onBack={goBack} />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          Keep your learner permit and date of birth up to date.
        </p>

        <div className="mt-6 space-y-4">
          <EditableField
            label="Learner permit"
            value={section.values.learnerPermitNumber}
            initialValue={section.saved.learnerPermitNumber}
            onChange={(value) => section.update("learnerPermitNumber", value)}
            onEditStart={section.handleFocus}
            onEditEnd={section.handleBlur}
          />
          <EditableField
            label="Date of birth"
            value={section.values.dateOfBirth}
            initialValue={section.saved.dateOfBirth}
            onChange={(value) => section.update("dateOfBirth", value)}
            onEditStart={section.handleFocus}
            onEditEnd={section.handleBlur}
          />
        </div>

        {section.showSave ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleSave}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Save
          </button>
        ) : null}
      </FlowPageContent>
    </>
  );
}
