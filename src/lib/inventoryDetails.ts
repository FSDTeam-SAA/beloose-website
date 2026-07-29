export type InventoryDetails = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  wrapper: string;
  size: string;
  smokingTime?: string;
  image?: string;
  description?: string;
  flavorNotes?: string[];
  pairingSuggestions?: string[];
  shelfName?: string;
  shelfRow?: number;
  shelfColumn?: number;
  humidorName?: string;
  quantity: number;
  price: number;
  pricePerBox?: number;
  displayPrice?: number;
  discountPrice?: number;
  featuredPrice?: number;
  isStaffPick: boolean;
  staffPickNote?: string;
  isNewArrival: boolean;
  newArrivalNote?: string;
  isDailyFeatured: boolean;
  featuredNote?: string;
  recommendationNote?: string;
  status: string;
  lowStockThreshold: number;
  isOnDiscount: boolean;
};

type InventoryDetailsResponse = {
  success: boolean;
  message?: string;
  data?: InventoryDetails;
};

export class InventoryDetailsError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function getInventoryDetails(
  id: string,
  signal?: AbortSignal,
): Promise<InventoryDetails> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api/v1";
  const response = await fetch(`${apiUrl}/inventory/${encodeURIComponent(id)}`, {
    headers: { Accept: "*/*" },
    signal,
  });
  const payload = (await response.json().catch(() => null)) as
    | InventoryDetailsResponse
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new InventoryDetailsError(
      payload?.message || "We couldn’t load this product right now.",
      response.status,
    );
  }

  return payload.data;
}
