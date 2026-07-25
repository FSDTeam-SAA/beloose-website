export type StoreInventoryItem = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  wrapper: string;
  size: string;
  smokingTime?: string;
  image?: string;
  description?: string;
  pairingSuggestions?: string[];
  shelfName?: string;
  quantity: number;
  price: number;
  isStaffPick: boolean;
  isNewArrival: boolean;
  isDailyFeatured: boolean;
  isOnDiscount: boolean;
  status: string;
};

export type StoreInventoryData = {
  items: StoreInventoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

type StoreInventoryResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: StoreInventoryData["meta"];
  data: StoreInventoryItem[];
};

export async function getStoreInventory(
  storeName: string,
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<StoreInventoryData> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/inventory-list?${query}`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | StoreInventoryResponse
    | { message?: string }
    | null;

  if (
    !response.ok ||
    !payload ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("meta" in payload)
  ) {
    throw new Error(
      payload?.message || "We couldn’t load the store inventory right now.",
    );
  }

  return { items: payload.data, meta: payload.meta };
}
