export type NewArrival = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  size: string;
  smokingTime?: string;
  image?: string;
  pairingSuggestions?: string[];
  price: number;
  quantity: number;
  arrivalDate: string;
  daysShowing: number;
  autoRemoveDays: number;
  newArrivalExpiresAt: string;
  shelfName?: string;
  wallName?: string;
  shelfRow?: number;
  shelfColumn?: number;
  humidorName?: string;
};

export type NewArrivalsData = {
  count: number;
  data: NewArrival[];
  groupedByRecency: {
    today: NewArrival[];
    thisWeek: NewArrival[];
    thisMonth: NewArrival[];
  };
};

type NewArrivalsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: NewArrivalsData;
};

export async function getNewArrivals(storeName: string, signal?: AbortSignal) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/new-arrivals`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | NewArrivalsResponse
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("data" in payload)) {
    throw new Error(
      payload?.message || "We couldn’t load the new arrivals right now.",
    );
  }

  return payload.data;
}
