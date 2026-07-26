import type { StoreInventoryItem } from "@/lib/storeInventory";

export type GuidedDiscoveryAnswers = {
  strength?: string;
  budget?: string;
  smokingTime?: string;
  profile?: string;
  wrapper?: string;
  pairingSuggestions?: string;
};

export type GuidedDiscoveryResults = {
  items: StoreInventoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

type GuidedDiscoveryResponse = {
  success: boolean;
  message?: string;
  meta: GuidedDiscoveryResults["meta"];
  data: StoreInventoryItem[];
};

function budgetRange(budget?: string) {
  if (budget === "5-15") return { minPrice: "5", maxPrice: "15" };
  if (budget === "15-25") return { minPrice: "15", maxPrice: "25" };
  if (budget === "25+") return { minPrice: "25" };
  return {};
}

export async function getGuidedDiscoveryResults(
  storeName: string,
  answers: GuidedDiscoveryAnswers,
  signal?: AbortSignal,
  limit = 5,
): Promise<GuidedDiscoveryResults> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8087/api/v1";
  const query = new URLSearchParams({
    page: "1",
    limit: String(limit),
    sortOrder: "asc",
  });
  Object.entries(budgetRange(answers.budget)).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  (["strength", "smokingTime", "wrapper", "pairingSuggestions"] as const).forEach(
    (key) => {
      const value = answers[key]?.trim();
      if (value) query.set(key, value);
    },
  );

  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/inventory-list?${query}`,
    { headers: { Accept: "*/*" }, signal },
  );
  const payload = (await response.json().catch(() => null)) as
    | GuidedDiscoveryResponse
    | { message?: string }
    | null;

  if (
    !response.ok ||
    !payload ||
    !("success" in payload) ||
    !payload.success ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("meta" in payload)
  ) {
    throw new Error(
      payload?.message || "We couldn’t load your guided matches right now.",
    );
  }

  return { items: payload.data, meta: payload.meta };
}
