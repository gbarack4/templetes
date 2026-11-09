"use client";

import { formatAddressWithoutCountry } from "@/shared/utils/address";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export type AddressSuggestion = Readonly<{
  id: string;
  mainText: string;
  secondaryText: string;
  description: string;
  postcode?: string;
  suburb?: string;
  latitude?: number;
  longitude?: number;
}>;

export type AddressSelectionDetails = Readonly<{
  formattedAddress?: string;
  suburb?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
}>;

type GoogleAddressAutocompleteProps = Readonly<{
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string, details: AddressSelectionDetails) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  biasSuburb?: string;
  biasPostcode?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  mode?: "address" | "suburb";
  suggestionLayout?: "overlay" | "sheet";
}>;

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GoogleGeocoderResult = {
  place_id: string;
  formatted_address?: string;
  postcode_localities?: string[];
  types: string[];
  partial_match?: boolean;
  address_components: GoogleAddressComponent[];
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GoogleGeocoderRequest =
  | {
      componentRestrictions: {
        country: string;
        postalCode: string;
      };
    }
  | {
      placeId: string;
    }
  | {
      address: string;
      componentRestrictions: {
        postalCode?: string;
        administrativeArea?: string;
        country: string;
      };
    };

type GoogleGeocoder = {
  geocode: (request: GoogleGeocoderRequest) => Promise<{
    results: GoogleGeocoderResult[];
  }>;
};

type GoogleGeocodingLibrary = {
  Geocoder: new () => GoogleGeocoder;
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

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
                componentRestrictions?: {
                  country: string | string[];
                };
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
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
          };
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
    script.src =
      `https://maps.googleapis.com/maps/api/js?` +
      `key=${encodeURIComponent(apiKey)}` +
      "&libraries=places&v=weekly";

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));

    document.head.appendChild(script);
  });

  return window.__googleMapsPlacesPromise;
}

async function getGeocodingLibrary(): Promise<GoogleGeocodingLibrary | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  await loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY);

  const importLibrary = window.google?.maps?.importLibrary;

  if (!importLibrary) {
    return null;
  }

  return (await importLibrary("geocoding")) as GoogleGeocodingLibrary;
}

function getAddressComponent(
  components: readonly GoogleAddressComponent[],
  type: string,
): GoogleAddressComponent | undefined {
  return components.find((component) => component.types.includes(type));
}

function getPostcode(
  components: readonly GoogleAddressComponent[],
): string | undefined {
  return getAddressComponent(components, "postal_code")?.long_name;
}

function getSuburb(
  components: readonly GoogleAddressComponent[],
): string | undefined {
  const preferredTypes = ["locality", "postal_town", "sublocality_level_1"];

  for (const type of preferredTypes) {
    const component = getAddressComponent(components, type);

    if (component?.long_name) {
      return component.long_name;
    }
  }

  return undefined;
}

async function fetchAddressDetailsForPlace(
  placeId: string,
): Promise<AddressSelectionDetails> {
  try {
    const library = await getGeocodingLibrary();

    if (!library) {
      return {
        googlePlaceId: placeId,
      };
    }

    const geocoder = new library.Geocoder();

    const { results } = await geocoder.geocode({
      placeId,
    });

    const result = results[0];

    if (!result) {
      return {
        googlePlaceId: placeId,
      };
    }

    return {
      formattedAddress: result.formatted_address,
      suburb: getSuburb(result.address_components),
      postcode: getPostcode(result.address_components),
      latitude: result.geometry?.location.lat(),
      longitude: result.geometry?.location.lng(),
      googlePlaceId: result.place_id || placeId,
    };
  } catch {
    return {
      googlePlaceId: placeId,
    };
  }
}

const SUBURB_TYPES = ["locality", "postal_town", "sublocality", "sublocality_level_1"];

function isSuburbResult(result: GoogleGeocoderResult): boolean {
  return result.types.some((type) => SUBURB_TYPES.includes(type));
}

function toSuburbSuggestion(
  result: GoogleGeocoderResult,
  expectedPostcode?: string,
  allowPostalResult = false,
): AddressSuggestion | null {
  const isAllowedPostalResult =
    allowPostalResult &&
    result.types.includes("postal_code") &&
    !result.postcode_localities?.length;

  if (
    (!isSuburbResult(result) && !isAllowedPostalResult) ||
    result.partial_match
  ) {
    return null;
  }

  const components = result.address_components;
  const country = getAddressComponent(components, "country")?.short_name;
  if (country !== "AU") return null;

  const postcode = getPostcode(components);
  if (expectedPostcode && postcode && postcode !== expectedPostcode) return null;

  const locality = SUBURB_TYPES
    .map((type) => getAddressComponent(components, type))
    .find((component) => component !== undefined);
  const name = locality?.short_name?.trim() || locality?.long_name?.trim();
  if (!name || /^\d+$/.test(name)) return null;

  const state = getAddressComponent(components, "administrative_area_level_1")?.short_name;
  const resolvedPostcode = postcode ?? expectedPostcode;
  const secondaryText = [state, resolvedPostcode].filter(Boolean).join(" ");

  return {
    id: result.place_id,
    mainText: name,
    secondaryText,
    description: [name, secondaryText].filter(Boolean).join(", "),
    suburb: name,
    postcode: resolvedPostcode,
    latitude: result.geometry?.location.lat(),
    longitude: result.geometry?.location.lng(),
  };
}

// Share lookups during typing; keep only a bounded, short-lived memory cache.
const suburbLookups = new Map<
  string,
  { expiresAt: number; promise: Promise<AddressSuggestion | null> }
>();

async function resolveSuburbSuggestion(
  placeId: string,
): Promise<AddressSuggestion | null> {
  const cached = suburbLookups.get(placeId);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = (async () => {
    try {
      const library = await getGeocodingLibrary();
      if (!library) return null;
      const { results } = await new library.Geocoder().geocode({ placeId });
      const result = results.find((item) => item.place_id === placeId);
      return result ? toSuburbSuggestion(result) : null;
    } catch {
      return null;
    }
  })();

  if (suburbLookups.size >= 100) {
    const oldestKey = suburbLookups.keys().next().value;
    if (oldestKey !== undefined) suburbLookups.delete(oldestKey);
  }
  suburbLookups.set(placeId, { expiresAt: Date.now() + 60_000, promise });
  const result = await promise;
  if (!result && suburbLookups.get(placeId)?.promise === promise) {
    suburbLookups.delete(placeId);
  }
  return result;
}

async function resolvePostcodeLocality(
  geocoder: GoogleGeocoder,
  locality: string,
  postcode: string,
  state: string,
): Promise<AddressSuggestion | null> {
  try {
    const { results } = await geocoder.geocode({
      address: locality,
      componentRestrictions: {
        country: "AU",
        postalCode: postcode,
        ...(state ? { administrativeArea: state } : {}),
      },
    });
    const candidates = results.filter((result) => toSuburbSuggestion(result, postcode));
    const ids = [...new Set(candidates.map((result) => result.place_id))];
    // Never silently choose one locality from an ambiguous response.
    if (ids.length !== 1) return null;

    const suggestion = await resolveSuburbSuggestion(ids[0]);
    if (!suggestion || (suggestion.postcode && suggestion.postcode !== postcode)) return null;
    return {
      ...suggestion,
      postcode,
      secondaryText: [state, postcode].filter(Boolean).join(" "),
    };
  } catch {
    return null;
  }
}

async function fetchAustralianPostcodeSuggestions(
  postcode: string,
): Promise<AddressSuggestion[]> {
  const library = await getGeocodingLibrary();

  if (!library) {
    return [];
  }

  const geocoder = new library.Geocoder();

  const { results } = await geocoder.geocode({
    componentRestrictions: {
      country: "AU",
      postalCode: postcode,
    },
  });

  const postcodeResult = results.find(
    (result) => getPostcode(result.address_components) === postcode,
  );

  if (!postcodeResult) {
    return [];
  }

  if (!postcodeResult.postcode_localities?.length) {
    const suggestion = toSuburbSuggestion(postcodeResult, postcode, true);
    return suggestion ? [suggestion] : [];
  }

  const state =
    getAddressComponent(
      postcodeResult.address_components,
      "administrative_area_level_1",
    )?.short_name ?? "";

  const suburb = getSuburb(postcodeResult.address_components);
  let localityNames = postcodeResult.postcode_localities ?? [];

  if (localityNames.length === 0 && suburb) {
    localityNames = [suburb];
  }

  const localities = [...new Set(localityNames)];

  const suggestions = await Promise.all(
    localities.map((locality) =>
      resolvePostcodeLocality(geocoder, locality, postcode, state),
    ),
  );

  const unique = new Map<string, AddressSuggestion>();
  for (const suggestion of suggestions) {
    if (suggestion) unique.set(suggestion.id, suggestion);
  }
  return [...unique.values()];
}

async function expandPostcodeSuggestions(
  suggestions: readonly AddressSuggestion[],
): Promise<AddressSuggestion[]> {
  const postcodeRequests = new Map<string, Promise<AddressSuggestion[]>>();

  const groups = await Promise.all(
    suggestions.map((suggestion) => {
      const postcode = suggestion.mainText.trim();

      if (!/^\d{4}$/.test(postcode)) {
        return resolveSuburbSuggestion(suggestion.id).then((resolved) =>
          resolved ? [resolved] : [],
        );
      }

      let request = postcodeRequests.get(postcode);

      if (!request) {
        // A postcode can contain several suburbs. Never select one arbitrarily
        // or pass the postcode itself to the suburb availability search.
        request = fetchAustralianPostcodeSuggestions(postcode).catch(() => []);
        postcodeRequests.set(postcode, request);
      }

      return request;
    }),
  );

  const unique = new Map<string, AddressSuggestion>();

  for (const suggestion of groups.flat()) {
    const key = suggestion.id;

    if (!unique.has(key)) {
      unique.set(key, suggestion);
    }
  }

  return [...unique.values()];
}

async function fetchGoogleSuggestions(
  query: string,
  mode: "address" | "suburb",
): Promise<AddressSuggestion[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    return [];
  }

  const normalizedQuery = query.trim();

  if (mode === "suburb" && /^\d{4}$/.test(normalizedQuery)) {
    return fetchAustralianPostcodeSuggestions(normalizedQuery);
  }

  await loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY);

  const places = window.google?.maps?.places;

  if (!places) {
    return [];
  }

  const service = new places.AutocompleteService();

  const suggestions = await new Promise<AddressSuggestion[]>((resolve) => {
    service.getPlacePredictions(
      {
        input: normalizedQuery,
        types: mode === "suburb" ? ["(regions)"] : ["address"],
        componentRestrictions: {
          country: "au",
        },
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
            secondaryText: formatAddressWithoutCountry(
              prediction.structured_formatting.secondary_text,
            ),
            description: formatAddressWithoutCountry(prediction.description),
          })),
        );
      },
    );
  });

  if (mode === "suburb") {
    return expandPostcodeSuggestions(suggestions);
  }

  return suggestions;
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
  suggestionLayout = "overlay",
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
          if (requestId !== requestIdRef.current) {
            return;
          }

          setSuggestions(results);
          setHighlightIndex(0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setSuggestions([]);
          setHighlightIndex(0);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      if (requestId === requestIdRef.current) requestIdRef.current += 1;
    };
  }, [mode, open, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  async function selectAddress(suggestion: AddressSuggestion) {
    setOpen(false);

    if (mode === "address") {
      const details = await fetchAddressDetailsForPlace(suggestion.id);

      const selectedValue = formatAddressWithoutCountry(
        details.formattedAddress?.trim() || suggestion.description,
      );

      onChange(selectedValue);
      onSelect?.(selectedValue, details);

      return;
    }

    const selectedValue = suggestion.mainText;

    const details: AddressSelectionDetails = {
      postcode: suggestion.postcode,
      suburb: selectedValue,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      googlePlaceId: suggestion.id,
    };

    onChange(selectedValue);
    onSelect?.(selectedValue, details);
  }

  const isSheet = suggestionLayout === "sheet";

  return (
    <div
      ref={containerRef}
      className={
        isSheet ? `${className} flex min-h-0 flex-1 flex-col` : className
      }
    >
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
          if (!showOverlay) {
            return;
          }

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

            if (!selected) {
              return;
            }

            event.preventDefault();

            void selectAddress(selected);

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

      {!showOverlay && isSheet ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-start pt-6 text-center">
          <PinIcon className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            Start typing to see address suggestions
          </p>
        </div>
      ) : null}

      {showOverlay ? (
        <ul
          id={listId}
          role="listbox"
          className={
            isSheet
              ? "mt-3 min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-2xl bg-[#f9f9f9] py-1"
              : "absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
          }
        >
          {suggestions.map((suggestion, index) => {
            const isActive = index === highlightIndex;
            let backgroundClass: string;

            if (isSheet) {
              backgroundClass = isActive
                ? "bg-white"
                : "bg-transparent hover:bg-white";
            } else {
              backgroundClass = isActive
                ? "bg-slate-100"
                : "bg-white hover:bg-slate-50";
            }

            return (
              <li key={suggestion.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectAddress(suggestion)}
                  className={`flex w-full items-start gap-3 px-3 py-3 text-left transition ${backgroundClass}`}
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
