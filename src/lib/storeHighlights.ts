export type StoreHighlight = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  size?: string;
  wrapper?: string;
  image?: string;
  price: number;
  quantity: number;
  description?: string;
  shelfName?: string;
  humidorName?: string;
};

export type StaffPick = StoreHighlight & {
  staffPickNote?: string;
  staffPickBy?: string;
  staffPickAddedAt?: string;
};

export type StaffPicksData = {
  count: number;
  data: StaffPick[];
  groupedByStaff: Record<string, StaffPick[]>;
};

export type DailyFeatured = StoreHighlight & {
  featuredNote?: string;
  featuredDate?: string;
  featuredPrice?: number;
  saving?: number;
};

export type DailyFeaturedData = {
  count: number;
  data: DailyFeatured[];
};

type FeatureResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
};

async function getStoreFeature<T>(
  storeName: string,
  feature: "staff-picks" | "daily-featured",
  fallbackMessage: string,
  signal?: AbortSignal,
) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/${feature}`,
    { headers: { Accept: "*/*" }, signal },
  );
  const payload = (await response.json().catch(() => null)) as
    | FeatureResponse<T>
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("data" in payload)) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload.data;
}

export function getStaffPicks(storeName: string, signal?: AbortSignal) {
  return getStoreFeature<StaffPicksData>(
    storeName,
    "staff-picks",
    "We couldn’t load the staff picks right now.",
    signal,
  );
}

export function getDailyFeatured(storeName: string, signal?: AbortSignal) {
  return getStoreFeature<DailyFeaturedData>(
    storeName,
    "daily-featured",
    "We couldn’t load today’s featured cigars right now.",
    signal,
  );
}
