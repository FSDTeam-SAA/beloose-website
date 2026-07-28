import { prepareImageUpload } from "./imageUpload";

export type InventoryItem = {
  _id: string;
  masterCigarId?: string;
  name?: string;
  brand?: string;
  manufacturer?: string;
  country?: string;
  strength?: "mild" | "medium" | "medium-full" | "full";
  wrapper?: string;
  size?: string;
  smokingTime?: "30" | "60" | "90" | "120+";
  image?: string;
  description?: string;
  pairingSuggestions?: string[];
  humidorId: string;
  shelfName: string;
  shelfRow: number;
  shelfColumn: number;
  quantity: number;
  price: number;
  lowStockThreshold?: number;
  status?: "active" | "under_review" | "out_of_stock" | "inactive";
  isStaffPick?: boolean;
  staffPickNote?: string;
  staffPickBy?: string;
  isNewArrival?: boolean;
  arrivalDate?: string;
  isDailyFeatured?: boolean;
  featuredNote?: string;
  totalSearches?: number;
  lastSoldDate?: string;
  daysSinceLastSale?: number | null;
  neverSearched?: boolean;
};

export type InventoryInput = {
  masterCigarId: string;
  name: string;
  brand: string;
  manufacturer: string;
  country: string;
  strength: "" | "mild" | "medium" | "medium-full" | "full";
  wrapper: string;
  size: string;
  smokingTime: "" | "30" | "60" | "90" | "120+";
  description: string;
  pairingSuggestions: string[];
  humidorId: string;
  shelfName: string;
  shelfRow: string;
  shelfColumn: string;
  quantity: string;
  price: string;
  lowStockThreshold: string;
  isStaffPick: boolean;
  staffPickNote: string;
  staffPickBy: string;
  isNewArrival: boolean;
  arrivalDate: string;
  isDailyFeatured: boolean;
  featuredNote: string;
  image?: File;
};

export type MasterCigar = {
  _id: string;
  name: string;
  brand: string;
  manufacturer?: string;
  country?: string;
  price?: number;
  strength?: "mild" | "medium" | "medium-full" | "full";
  wrapper?: string;
  size?: string;
  smokingTime?: string;
  image?: string;
  description?: string;
};

export type InventoryPage = { data: InventoryItem[]; meta: { page: number; limit: number; total: number } };
export type OpportunityResult = { days: number; count: number; data: InventoryItem[] };
export type RecordSaleResult = {
  inventory: InventoryItem;
  sale: { quantitySold: number; previousQuantity: number; quantity: number; soldAt: string };
  notification: { type: "low_stock" | "out_of_stock"; message: string } | null;
};

async function request<T>(path: string, token: string, init?: RequestInit, signal?: AbortSignal) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers }, signal });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "Inventory request failed");
  return result as T;
}

export async function getInventory(token: string, page: number, searchTerm: string, signal?: AbortSignal): Promise<InventoryPage> {
  const params = new URLSearchParams({ page: String(page), limit: "12", sortBy: "createdAt", sortOrder: "desc" });
  if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
  const result = await request<{ data: InventoryItem[]; meta: InventoryPage["meta"] }>(`/inventory/my-inventory?${params}`, token, undefined, signal);
  return { data: result.data || [], meta: result.meta };
}

export async function getShelfInventory(token: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: "1", limit: "500", sortBy: "createdAt", sortOrder: "desc" });
  const result = await request<{ data: InventoryItem[] }>(`/inventory/my-inventory?${params}`, token, undefined, signal);
  return result.data || [];
}

export async function getMasterCigars(token: string, searchTerm: string, signal?: AbortSignal): Promise<MasterCigar[]> {
  const params = new URLSearchParams({ status: "active", searchTerm: searchTerm.trim(), limit: "10", page: "1", sortBy: "name", sortOrder: "asc" });
  const result = await request<{ data: MasterCigar[] }>(`/master-database?${params}`, token, undefined, signal);
  return result.data || [];
}

export async function getInventoryOpportunities(token: string, days: number, signal?: AbortSignal) {
  const result = await request<{ data: OpportunityResult }>(`/inventory/opportunities/my?days=${days}`, token, undefined, signal);
  return result.data;
}

async function toFormData(input: InventoryInput) {
  const body = new FormData();
  const values: Record<string, string | string[] | boolean | File | undefined> = { ...input };
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
    body.append(key, value instanceof File ? await prepareImageUpload(value) : Array.isArray(value) ? value.join(",") : String(value));
  }
  return body;
}

export async function createInventory(token: string, input: InventoryInput) {
  const result = await request<{ data: InventoryItem }>("/inventory", token, { method: "POST", body: await toFormData(input) });
  return result.data;
}

export async function updateInventory(token: string, id: string, input: InventoryInput) {
  const result = await request<{ data: InventoryItem }>(`/inventory/${id}`, token, { method: "PUT", body: await toFormData(input) });
  return result.data;
}

export async function deleteInventory(token: string, id: string) {
  const result = await request<{ data: InventoryItem }>(`/inventory/${id}`, token, { method: "DELETE" });
  return result.data;
}

export async function recordInventorySale(token: string, id: string, quantitySold: number) {
  const result = await request<{ data: RecordSaleResult }>(`/inventory/${id}/record-sale`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantitySold }),
  });
  return result.data;
}
