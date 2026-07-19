export type SuburbSuggestion = Readonly<{
  suburb: string;
  postcode: string;
  state: string;
}>;

/** Mock pickup suburbs aligned with onboarding instructor coverage. */
export const suburbSuggestions: readonly SuburbSuggestion[] = [
  { suburb: "Downtown", postcode: "98101", state: "WA" },
  { suburb: "Belltown", postcode: "98121", state: "WA" },
  { suburb: "Capitol Hill", postcode: "98102", state: "WA" },
  { suburb: "Queen Anne", postcode: "98109", state: "WA" },
  { suburb: "Westside", postcode: "98109", state: "WA" },
  { suburb: "Eastside", postcode: "98112", state: "WA" },
  { suburb: "Ballard", postcode: "98107", state: "WA" },
  { suburb: "Fremont", postcode: "98103", state: "WA" },
  { suburb: "Wallingford", postcode: "98103", state: "WA" },
  { suburb: "Green Lake", postcode: "98115", state: "WA" },
  { suburb: "University District", postcode: "98105", state: "WA" },
  { suburb: "Northgate", postcode: "98125", state: "WA" },
  { suburb: "Beacon Hill", postcode: "98144", state: "WA" },
  { suburb: "Rainier Valley", postcode: "98118", state: "WA" },
  { suburb: "Georgetown", postcode: "98108", state: "WA" },
  { suburb: "SoDo", postcode: "98134", state: "WA" },
];

const MAX_RESULTS = 6;

export function filterSuburbSuggestions(query: string): SuburbSuggestion[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const normalizedPostcode = trimmed.replace(/\s/g, "");

  return suburbSuggestions
    .filter((item) => {
      const suburb = item.suburb.toLowerCase();
      const postcode = item.postcode.toLowerCase();
      return (
        suburb.includes(trimmed) ||
        postcode.includes(normalizedPostcode) ||
        `${suburb} ${postcode}`.includes(trimmed)
      );
    })
    .slice(0, MAX_RESULTS);
}
