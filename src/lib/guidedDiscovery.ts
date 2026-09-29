import type { StoreInventoryItem } from "@/lib/storeInventory";

export type GuidedDiscoveryAnswers = {
  strength?: string;
  budget?: string;
  smokingTime?: string;
  profile?: string;
  wrapper?: string;
  pairingSuggestions?: string;
};

export type GuidedDiscoveryItem = StoreInventoryItem & {
  rank?: number;
  label?: string;
  matchScore?: number;
  matchReason?: string;
  humidorName?: string;
};

export type GuidedDiscoveryResults = {
  items: GuidedDiscoveryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

type GuidedDiscoveryResponse = {
  success?: boolean;
  message?: string;
  meta?: GuidedDiscoveryResults["meta"];
  data: GuidedDiscoveryItem[];
};

function budgetRange(budget?: string) {
  if (budget === "5-15") return { minBudget: "5", maxBudget: "15", minPrice: "5", maxPrice: "15" };
  if (budget === "15-25") return { minBudget: "15", maxBudget: "25", minPrice: "15", maxPrice: "25" };
  if (budget === "25+") return { minBudget: "25", minPrice: "25" };
  return {};
}

export async function getGuidedDiscoveryResults(
  storeName: string,
  answers: GuidedDiscoveryAnswers = {},
  signal?: AbortSignal,
  limit = 6,
): Promise<GuidedDiscoveryResults> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8087/api/v1";

  const budget = budgetRange(answers.budget);
  const query = new URLSearchParams({
    limit: String(limit),
  });

  if (budget.minBudget) query.set("minBudget", budget.minBudget);
  if (budget.maxBudget) query.set("maxBudget", budget.maxBudget);
  if (answers.strength?.trim()) query.set("strength", answers.strength.trim());
  if (answers.smokingTime?.trim()) query.set("smokingTime", answers.smokingTime.trim());
  if (answers.wrapper?.trim()) query.set("wrapper", answers.wrapper.trim());
  if (answers.pairingSuggestions?.trim()) query.set("pairingSuggestions", answers.pairingSuggestions.trim());
  if (answers.profile?.trim()) query.set("profile", answers.profile.trim());

  // Try dedicated guided-discovery endpoint first
  try {
    const response = await fetch(
      `${apiUrl}/inventory/${encodeURIComponent(storeName)}/guided-discovery?${query}`,
      { headers: { Accept: "*/*" }, signal },
    );

    if (response.ok) {
      const payload = (await response.json()) as GuidedDiscoveryResponse;
      if (Array.isArray(payload.data)) {
        return {
          items: payload.data,
          meta: payload.meta || {
            page: 1,
            limit,
            total: payload.data.length,
          },
        };
      }
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
  }

  // Graceful fallback to inventory-list endpoint
  const fallbackQuery = new URLSearchParams({
    page: "1",
    limit: String(limit),
    sortOrder: "asc",
  });
  if (budget.minPrice) fallbackQuery.set("minPrice", budget.minPrice);
  if (budget.maxPrice) fallbackQuery.set("maxPrice", budget.maxPrice);
  if (answers.strength?.trim()) fallbackQuery.set("strength", answers.strength.trim());
  if (answers.wrapper?.trim()) fallbackQuery.set("wrapper", answers.wrapper.trim());

  const response = await fetch(
    `${apiUrl}/inventory/${encodeURIComponent(storeName)}/inventory-list?${fallbackQuery}`,
    { headers: { Accept: "*/*" }, signal },
  );

  const payload = (await response.json().catch(() => null)) as
    | GuidedDiscoveryResponse
    | { message?: string }
    | null;

  if (
    !response.ok ||
    !payload ||
    !("data" in payload) ||
    !Array.isArray(payload.data)
  ) {
    throw new Error(
      (payload && "message" in payload && payload.message) ||
        "We couldn’t load your guided matches right now.",
    );
  }

  const items = (payload.data as GuidedDiscoveryItem[]).map((item, index) => ({
    ...item,
    rank: index + 1,
    label: index === 0 ? "Top Pick" : index === 1 ? "Great Choice" : "Alternative Option",
    matchScore: 92 - index * 3,
    matchReason: item.strength
      ? `Selected for its ${item.strength} profile and quality construction.`
      : "A balanced choice from the humidor.",
  }));

  return {
    items,
    meta: ("meta" in payload && payload.meta) || {
      page: 1,
      limit,
      total: items.length,
    },
  };
}
