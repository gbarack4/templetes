"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AddressSuggestion = Readonly<{
  id: string;
  mainText: string;
  secondaryText: string;
  description: string;
}>;

type GoogleAddressAutocompleteProps = Readonly<{
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (address: string) => void;
  placeholder?: string;
  inputClassName?: string;
  biasSuburb?: string;
  biasPostcode?: string;
  icon?: ReactNode;
}>;

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const MOCK_ADDRESSES: readonly AddressSuggestion[] = [
  {
    id: "mock-1",
    mainText: "1201 Pike St",
    secondaryText: "Seattle, WA 98101, USA",
    description: "1201 Pike St, Seattle, WA 98101, USA",
  },
  {
    id: "mock-2",
    mainText: "400 Broad St",
    secondaryText: "Seattle, WA 98109, USA",
    description: "400 Broad St, Seattle, WA 98109, USA",
  },
  {
    id: "mock-3",
    mainText: "15 Broadway E",
    secondaryText: "Seattle, WA 98102, USA",
    description: "15 Broadway E, Seattle, WA 98102, USA",
  },
  {
    id: "mock-4",
    mainText: "5300 Ballard Ave NW",
    secondaryText: "Seattle, WA 98107, USA",
    description: "5300 Ballard Ave NW, Seattle, WA 98107, USA",
  },
  {
    id: "mock-5",
    mainText: "220 Northgate Way",
    secondaryText: "Seattle, WA 98125, USA",
    description: "220 Northgate Way, Seattle, WA 98125, USA",
  },
  {
    id: "mock-6",
    mainText: "800 Queen Anne Ave N",
    secondaryText: "Seattle, WA 98109, USA",
    description: "800 Queen Anne Ave N, Seattle, WA 98109, USA",
  },
  {
    id: "mock-7",
    mainText: "9800 Rainier Ave S",
    secondaryText: "Seattle, WA 98118, USA",
    description: "9800 Rainier Ave S, Seattle, WA 98118, USA",
  },
  {
    id: "mock-8",
    mainText: "4507 University Way NE",
    secondaryText: "Seattle, WA 98105, USA",
    description: "4507 University Way NE, Seattle, WA 98105, USA",
  },
  {
    id: "mock-9",
    mainText: "3417 Fremont Ave N",
    secondaryText: "Seattle, WA 98103, USA",
    description: "3417 Fremont Ave N, Seattle, WA 98103, USA",
  },
  {
    id: "mock-10",
    mainText: "1500 E Madison St",
    secondaryText: "Seattle, WA 98122, USA",
    description: "1500 E Madison St, Seattle, WA 98122, USA",
  },
  {
    id: "mock-11",
    mainText: "88 Yesler Way",
    secondaryText: "Seattle, WA 98104, USA",
    description: "88 Yesler Way, Seattle, WA 98104, USA",
  },
  {
    id: "mock-12",
    mainText: "5600 15th Ave NE",
    secondaryText: "Seattle, WA 98105, USA",
    description: "5600 15th Ave NE, Seattle, WA 98105, USA",
  },
];

declare global {
  interface Window {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<unknown>;
        places?: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types?: string[];
                componentRestrictions?: { country: string | string[] };
              },
              callback: (
                predictions: Array<{
                  place_id: string;
                  description: string;
                  structured_formatting: {
                    main_text: string;
                    secondary_text: string;
                  };
                }> | null,
                status: string,
              ) => void,
            ) => void;
          };
          PlacesServiceStatus: { OK: string; ZERO_RESULTS: string };
        };
      };
    };
    __googleMapsPlacesPromise?: Promise<void>;
  }
}

function PinIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function loadGoogleMapsPlaces(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps requires a browser"));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (window.__googleMapsPlacesPromise) {
    return window.__googleMapsPlacesPromise;
  }

  window.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-google-maps-places]",
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.dataset.googleMapsPlaces = "true";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return window.__googleMapsPlacesPromise;
}

function filterMockAddresses(
  query: string,
  biasSuburb?: string,
  biasPostcode?: string,
): AddressSuggestion[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const scored = MOCK_ADDRESSES.map((address) => {
    const haystack = address.description.toLowerCase();
    let score = 0;

    if (haystack.includes(trimmed)) score += 10;
    if (address.mainText.toLowerCase().startsWith(trimmed)) score += 8;
    if (address.mainText.toLowerCase().includes(trimmed)) score += 5;
    if (address.secondaryText.toLowerCase().includes(trimmed)) score += 3;

    if (biasSuburb && haystack.includes(biasSuburb.toLowerCase())) score += 4;
    if (biasPostcode && haystack.includes(biasPostcode.toLowerCase())) score += 4;

    return { address, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.address);

  if (scored.length > 0) return scored;

  // Synthesize Google-style completions when the typed query is an address fragment.
  const suburb = biasSuburb?.trim() || "Seattle";
  const postcode = biasPostcode?.trim() || "98101";
  const streets = ["Pike St", "Pine St", "1st Ave", "Madison St", "Broadway"];

  return streets.slice(0, 4).map((street, index) => {
    const mainText = /^\d/.test(trimmed)
      ? `${query.trim()} ${street}`
      : `${1200 + index} ${query.trim()}`;
    const secondaryText = `${suburb}, WA ${postcode}, USA`;

    return {
      id: `synthetic-${index}-${mainText}`,
      mainText,
      secondaryText,
      description: `${mainText}, ${secondaryText}`,
    };
  });
}

async function fetchGoogleSuggestions(query: string): Promise<AddressSuggestion[]> {
  await loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY);

  const places = window.google?.maps?.places;
  if (!places) return [];

  const service = new places.AutocompleteService();

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input: query,
        types: ["address"],
        componentRestrictions: { country: "us" },
      },
      (predictions, status) => {
        if (
          !predictions ||
          (status !== places.PlacesServiceStatus.OK &&
            status !== places.PlacesServiceStatus.ZERO_RESULTS)
        ) {
          resolve([]);
          return;
        }

        resolve(
          predictions.map((prediction) => ({
            id: prediction.place_id,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
            description: prediction.description,
          })),
        );
      },
    );
  });
}

export function GoogleAddressAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "Enter pick up address",
  inputClassName,
  biasSuburb,
  biasPostcode,
  icon,
}: GoogleAddressAutocompleteProps) {
  const listId = useId();
  const inputId = id ?? listId;
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const showOverlay = open && value.trim().length > 0 && suggestions.length > 0;
  const useGoogle = Boolean(GOOGLE_MAPS_API_KEY);

  const mockSuggestions = useMemo(
    () => filterMockAddresses(value, biasSuburb, biasPostcode),
    [value, biasSuburb, biasPostcode],
  );

  useEffect(() => {
    if (!open || value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    if (!useGoogle) {
      setSuggestions(mockSuggestions);
      setHighlightIndex(0);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      void fetchGoogleSuggestions(value.trim())
        .then((results) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(results);
          setHighlightIndex(0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(mockSuggestions);
          setHighlightIndex(0);
        });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [open, value, useGoogle, mockSuggestions]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectAddress(suggestion: AddressSuggestion) {
    onChange(suggestion.description);
    onSelect?.(suggestion.description);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {icon}
      <input
        id={inputId}
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
            selectAddress(selected);
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className={inputClassName}
      />

      {showOverlay ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
        >
          {suggestions.map((suggestion, index) => {
            const isActive = index === highlightIndex;

            return (
              <li key={suggestion.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectAddress(suggestion)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition ${
                    isActive ? "bg-slate-100" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {suggestion.mainText}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {suggestion.secondaryText}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {useGoogle ? (
            <li className="border-t border-slate-100 px-3 py-2">
              <p className="flex items-center justify-end gap-1 text-[10px] font-medium tracking-wide text-slate-400">
                <GoogleMark />
                powered by Google
              </p>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function GoogleMark(): ReactNode {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
