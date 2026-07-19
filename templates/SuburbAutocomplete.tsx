"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  filterSuburbSuggestions,
  type SuburbSuggestion,
} from "./suburb-suggestions";

type SuburbAutocompleteProps = Readonly<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}>;

export function SuburbAutocomplete({
  id,
  value,
  onChange,
  placeholder = "Enter your suburb",
  className = "relative",
  inputClassName,
  icon,
  trailing,
}: SuburbAutocompleteProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const suggestions = useMemo(() => filterSuburbSuggestions(value), [value]);
  const showOverlay = open && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectSuburb(suggestion: SuburbSuggestion) {
    onChange(suggestion.suburb);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={className}>
      {icon}
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showOverlay}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showOverlay ? `${listId}-option-${highlightIndex}` : undefined
        }
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlightIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showOverlay) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightIndex((index) =>
              Math.min(index + 1, suggestions.length - 1),
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightIndex((index) => Math.max(index - 1, 0));
            return;
          }

          if (event.key === "Enter") {
            const selected = suggestions[highlightIndex];
            if (!selected) return;
            event.preventDefault();
            selectSuburb(selected);
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className={inputClassName}
      />
      {trailing}

      {showOverlay ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
        >
          {suggestions.map((suggestion, index) => {
            const isActive = index === highlightIndex;

            return (
              <li
                key={`${suggestion.suburb}-${suggestion.postcode}`}
                role="presentation"
              >
                <button
                  type="button"
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuburb(suggestion)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                    isActive ? "bg-slate-100" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {suggestion.suburb}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {suggestion.postcode}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
