"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

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
  className?: string;
  inputClassName?: string;
  biasSuburb?: string;
  biasPostcode?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  mode?: "address" | "suburb";
}>;

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

declare global {
  interface Window {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<unknown>;
        Geocoder?: new () => {
          geocode: (
            request: {
              componentRestrictions?: {
                country?: string;
                postalCode?: string;
              };
            },
            callback: (
              results: Array<{
                place_id: string;
                formatted_address: string;
                postcode_localities?: string[];
                address_components: Array<{
                  long_name: string;
                  short_name: string;
                  types: string[];
                }>;
              }> | null,
              status: string,
            ) => void,
          ) => void;
        };
        GeocoderStatus?: {
          OK: string;
          ZERO_RESULTS: string;
        };
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

async function fetchAustralianPostcodeSuggestions(
  postcode: string,
): Promise<AddressSuggestion[]> {
  if (!GOOGLE_MAPS_API_KEY) return [];

  await loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY);

  const maps = window.google?.maps;

  if (!maps?.importLibrary) {
    return [];
  }

  const { Geocoder } = (await maps.importLibrary("geocoding")) as {
    Geocoder: new () => {
      geocode: (request: {
        componentRestrictions: {
          country: string;
          postalCode: string;
        };
      }) => Promise<{
        results: Array<{
          place_id: string;
          postcode_localities?: string[];
          address_components: Array<{
            long_name: string;
            short_name: string;
            types: string[];
          }>;
        }>;
      }>;
    };
  };

  const geocoder = new Geocoder();

  const { results } = await geocoder.geocode({
    componentRestrictions: {
      country: "AU",
      postalCode: postcode,
    },
  });

  const postcodeResult = results.find(
    (result) => (result.postcode_localities?.length ?? 0) > 0,
  );

  if (!postcodeResult?.postcode_localities?.length) {
    return [];
  }

  const state =
    postcodeResult.address_components.find((component) =>
      component.types.includes("administrative_area_level_1"),
    )?.short_name ?? "";

  return postcodeResult.postcode_localities.map((locality) => ({
    id: `${postcode}-${locality}`,
    mainText: locality,
    secondaryText: `${state} ${postcode}, Australia`,
    description: `${locality}, ${state} ${postcode}, Australia`,
  }));
}

async function fetchGoogleSuggestions(
  query: string,
  mode: "address" | "suburb",
): Promise<AddressSuggestion[]> {
  if (!GOOGLE_MAPS_API_KEY) return [];

  const normalizedQuery = query.trim();

  if (mode === "suburb" && /^\d{4}$/.test(normalizedQuery)) {
    return fetchAustralianPostcodeSuggestions(normalizedQuery);
  }

  await loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY);

  const places = window.google?.maps?.places;
  if (!places) return [];

  const service = new places.AutocompleteService();

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input: query,
        types: mode === "suburb" ? ["(regions)"] : ["address"],
        componentRestrictions: { country: "au" },
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
  className = "relative",
  inputClassName,
  icon,
  trailing,
  mode = "address",
}: GoogleAddressAutocompleteProps) {
  const listId = useId();
  const inputId = id ?? listId;
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const showOverlay = open && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    if (!open || value.trim().length === 0 || !GOOGLE_MAPS_API_KEY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      void fetchGoogleSuggestions(value.trim(), mode)
        .then((results) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(results);
          setHighlightIndex(0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setHighlightIndex(0);
        });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [mode, open, value]);

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
    const selectedValue =
      mode === "suburb" ? suggestion.mainText : suggestion.description;

    onChange(selectedValue);
    onSelect?.(selectedValue);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={className}>
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
      {trailing}

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
          <li className="border-t border-slate-100 px-3 py-2">
            <p className="flex items-center justify-end gap-1 text-[10px] font-medium tracking-wide text-slate-400">
              <GoogleMark />
              powered by Google
            </p>
          </li>
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
