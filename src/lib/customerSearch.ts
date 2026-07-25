export type CustomerSearchItem = {
  _id: string;
  name?: string;
  brand?: string;
  strength?: string;
  wrapper?: string;
  size?: string;
  image?: string;
  price?: number;
  pairingSuggestions?: string[];
  quantity: number;
  inStock: boolean;
  shelfName?: string;
  humidorName?: string;
};

export type CustomerSearchDetail = CustomerSearchItem & {
  description?: string;
  flavorNotes?: string | string[];
  smokingTime?: string;
  displayPrice?: number;
  isOnDiscount?: boolean;
  isFeaturedToday?: boolean;
  recommendationNote?: string;
  location?: { humidorName?: string; shelfName?: string };
};

export type CustomerSearchFilters = {
  searchTerm?: string;
  strength?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: boolean;
  page?: number;
};

export type SearchResult = {
  data: CustomerSearchItem[];
  meta: { page: number; limit: number; total: number };
};

async function inventoryRequest<T>(path: string, token: string, signal?: AbortSignal) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message || "Customer search request failed");
  return result as T;
}

export async function searchCustomerInventory(token: string, filters: CustomerSearchFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: "10", page: String(filters.page || 1) });
  if (filters.searchTerm?.trim()) params.set("searchTerm", filters.searchTerm.trim());
  if (filters.strength) params.set("strength", filters.strength);
  if (filters.size?.trim()) params.set("size", filters.size.trim());
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.inStockOnly) params.set("inStockOnly", "true");
  const result = await inventoryRequest<{ data: CustomerSearchItem[]; meta: SearchResult["meta"] }>(`/inventory/customer-search/quick?${params}`, token, signal);
  return { data: result.data, meta: result.meta };
}

export async function getCustomerSearchDetail(token: string, id: string, signal?: AbortSignal) {
  const result = await inventoryRequest<{ data: CustomerSearchDetail }>(`/inventory/${id}/customer-view`, token, signal);
  return result.data;
}
