export type RelatedCigar = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  wrapper: string;
  size: string;
  smokingTime?: string;
  image?: string;
  pairingSuggestions?: string[];
  quantity: number;
  price: number;
  status: string;
};

export type RelatedCigarsData = {
  youMightAlsoEnjoy: RelatedCigar[];
  moreExclusive: RelatedCigar[];
  similarCigars: RelatedCigar[];
};

type RelatedCigarsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: RelatedCigarsData;
};

export async function getRelatedCigars(
  storeName: string,
  inventoryId: string,
  signal?: AbortSignal,
): Promise<RelatedCigarsData> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8087/api/v1";
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/${encodeURIComponent(inventoryId)}/related`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | RelatedCigarsResponse
    | { message?: string }
    | null;

  if (
    !response.ok ||
    !payload ||
    !("success" in payload) ||
    !payload.success ||
    !("data" in payload) ||
    !Array.isArray(payload.data.similarCigars)
  ) {
    throw new Error(
      payload?.message || "We couldn’t load similar cigars right now.",
    );
  }

  return payload.data;
}
