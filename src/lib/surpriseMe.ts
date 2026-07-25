export type SurprisePickItem = {
  _id: string;
  name: string;
  brand: string;
  strength: string;
  wrapper: string;
  size: string;
  image?: string;
  flavorNotes?: string[];
  price: number;
  quantity: number;
  location: {
    humidorName?: string;
    shelfName?: string;
  };
  whyThisCigar: string;
};

export type SurprisePickData = {
  limitReached: boolean;
  triesUsed: number;
  triesRemaining: number;
  maxTries: number;
  item: SurprisePickItem | null;
};

type SurprisePickResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: SurprisePickData;
};

export async function getSurprisePick(
  storeName: string,
  signal?: AbortSignal,
) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/surprise-me`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | SurprisePickResponse
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("data" in payload)) {
    throw new Error(
      payload?.message || "We couldn’t choose a surprise cigar right now.",
    );
  }

  return payload.data;
}
