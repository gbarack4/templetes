export type FormEmbedSearchPayload = Readonly<{
  suburb: string;
  transmission: string;
  testDate?: string;
}>;

export type FormEmbedSearchResult = Readonly<{
  success: boolean;
}>;

export async function submitFormEmbedSearch(
  payload: FormEmbedSearchPayload,
): Promise<FormEmbedSearchResult> {
  // TODO: replace with backend API call
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.info("[form-embed] search payload", payload);
  return { success: true };
}
