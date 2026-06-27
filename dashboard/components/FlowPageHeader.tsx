"use client";

import { ChevronLeftIcon } from "./icons";

type FlowPageHeaderProps = Readonly<{
  title: string;
  onBack: () => void;
}>;

export function FlowPageHeader({ title, onBack }: FlowPageHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-50"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
    </header>
  );
}
