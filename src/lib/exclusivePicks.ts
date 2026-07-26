export type ExclusivePick = {
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

type ExclusivePicksResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: ExclusivePick[];
};

export async function getExclusivePicks(
  storeName: string,
  inventoryId: string,
  signal?: AbortSignal,
): Promise<ExclusivePick[]> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8087/api/v1";
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/${encodeURIComponent(inventoryId)}/exclusive-picks`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | ExclusivePicksResponse
    | { message?: string }
    | null;

  if (
    !response.ok ||
    !payload ||
    !("success" in payload) ||
    !payload.success ||
    !("data" in payload) ||
    !Array.isArray(payload.data)
  ) {
    throw new Error(
      payload?.message || "We couldn’t load the exclusive picks right now.",
    );
  }

  return payload.data;
}
