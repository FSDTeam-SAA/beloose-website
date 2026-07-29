export type FeatureKind = "staff-picks" | "new-arrivals" | "daily-featured";

export type FeatureInventoryItem = {
  _id: string;
  name?: string;
  brand?: string;
  strength?: string;
  wrapper?: string;
  size?: string;
  smokingTime?: string;
  image?: string;
  pairingSuggestions?: string[];
  price?: number;
  quantity?: number;
  status?: string;
  shelfName?: string;
  shelfRow?: number;
  shelfColumn?: number;
  humidorName?: string;
  isStaffPick?: boolean;
  isNewArrival?: boolean;
  isDailyFeatured?: boolean;
  staffPickBy?: string;
  staffPickNote?: string;
  staffPickAddedAt?: string;
  arrivalDate?: string;
  newArrivalNote?: string;
  autoRemoveDays?: 7 | 14 | 30;
  newArrivalExpiresAt?: string;
  daysShowing?: number;
  featuredDate?: string;
  featuredNote?: string;
  featuredPrice?: number;
  saving?: number;
};

export type InventoryPage = {
  data: FeatureInventoryItem[];
  meta: { page: number; limit: number; total: number };
};

export type StaffPickInput = { staffPickBy: string; staffPickNote: string };
export type NewArrivalInput = { arrivalDate?: string; note?: string; autoRemoveDays?: 7 | 14 | 30 };
export type DailyFeaturedInput = { featuredDate?: string; note?: string; featuredPrice?: number };
export type FeatureInput = StaffPickInput | NewArrivalInput | DailyFeaturedInput;
const itemFeaturePath: Record<FeatureKind, string> = {
  "staff-picks": "staff-pick",
  "new-arrivals": "new-arrival",
  "daily-featured": "daily-featured",
};

async function request<T>(path: string, token: string, init?: RequestInit, signal?: AbortSignal) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "Inventory feature request failed");
  return result as T;
}

export async function getFeatureInventory(token: string, page: number, signal?: AbortSignal): Promise<InventoryPage> {
  const params = new URLSearchParams({ page: String(page), limit: "10", sortBy: "name", sortOrder: "asc" });
  const result = await request<{ data: FeatureInventoryItem[]; meta: InventoryPage["meta"] }>(`/inventory/my-inventory?${params}`, token, undefined, signal);
  return { data: result.data || [], meta: result.meta };
}

export async function getActiveFeatureItems(token: string, kind: FeatureKind, signal?: AbortSignal) {
  if (kind === "daily-featured") {
    const result = await request<{ data: { today?: FeatureInventoryItem[]; tomorrow?: FeatureInventoryItem[] } }>(`/inventory/${kind}/my`, token, undefined, signal);
    return [...(result.data?.today || []), ...(result.data?.tomorrow || [])];
  }
  const result = await request<{ data: { data?: FeatureInventoryItem[] } }>(`/inventory/${kind}/my`, token, undefined, signal);
  return result.data?.data || [];
}

export async function saveFeature(token: string, kind: FeatureKind, id: string, payload: FeatureInput, editing: boolean) {
  return request(`/inventory/${id}/${itemFeaturePath[kind]}`, token, {
    method: editing ? "PATCH" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeFeature(token: string, kind: FeatureKind, id: string) {
  return request(`/inventory/${id}/${itemFeaturePath[kind]}`, token, { method: "DELETE" });
}

export async function clearTodayFeatured(token: string) {
  return request<{ data: { cleared: number } }>("/inventory/daily-featured/my/clear", token, { method: "DELETE" });
}
