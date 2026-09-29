import { prepareImageUpload } from "./imageUpload";

export type InventoryItem = {
  _id: string;
  masterCigarId?: string | MasterCigar;
  upcCodes?: string[];
  name?: string;
  brand?: string;
  strength?: "mild" | "mild-medium" | "medium" | "medium-full" | "full";
  wrapper?: string;
  size?: string;
  smokingTime?: "30" | "60" | "90" | "120+";
  image?: string;
  description?: string;
  pairingSuggestions?: string[];
  humidorId: string;
  wallId?: string;
  wallName?: string;
  shelfId?: string;
  shelfName: string;
  shelfRow?: number;
  shelfColumn: number;
  quantity: number;
  price: number;
  pricePerBox: number;
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
  strength: "" | "mild" | "mild-medium" | "medium" | "medium-full" | "full";
  wrapper: string;
  size: string;
  smokingTime: "" | "30" | "60" | "90" | "120+";
  description: string;
  pairingSuggestions: string[];
  humidorId: string;
  wallId: string;
  shelfId: string;
  shelfName: string;
  shelfColumn: string;
  quantity: string;
  price: string;
  pricePerBox: string;
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
  productLine: string;
  brand: string;
  name?: string;
  upcCodes?: string[];
  strength?: string;
  wrapper?: string;
  estimatedSmokingTime?: string;
  pairingSuggestions?: string[];
  suggestedRetailPriceEach?: number;
  suggestedRetailPricePerBox?: number;
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
  const params = new URLSearchParams({ status: "active", searchTerm: searchTerm.trim(), limit: "10", page: "1", sortBy: "productLine", sortOrder: "asc" });
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

export type BulkPreviewResult = {
  headers: string[];
  previewRows: Record<string, unknown>[];
  mappedRows: Record<string, unknown>[];
  totalRows: number;
  inferredMapping?: Record<string, string>;
};

export type BulkValidateResult = {
  validCount: number;
  invalidCount: number;
  valid?: number;
  invalid?: number;
  errors: { row: number; field?: string; message: string; reason?: string }[];
};

export type BulkImportResult = {
  importedCount: number;
  totalRows: number;
  imported?: number;
  total?: number;
  skippedCount?: number;
  failed?: number;
  errors?: { row: number; message: string; reason?: string }[];
};

export async function previewBulkInventory(token: string, file: File, mapping?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (mapping) formData.append("mapping", mapping);
  const result = await request<{ data: BulkPreviewResult }>("/inventory/bulk/preview", token, {
    method: "POST",
    body: formData,
  });
  return result.data;
}

type BackendValidateResponse = {
  validCount?: number;
  valid?: number;
  invalidCount?: number;
  invalid?: number;
  errors?: { row: number; field?: string; message?: string; reason?: string }[];
};

type BackendImportResponse = {
  importedCount?: number;
  imported?: number;
  totalRows?: number;
  total?: number;
  skippedCount?: number;
  failed?: number;
  errors?: { row: number; message?: string; reason?: string }[];
};

export async function validateBulkInventory(token: string, rows: Record<string, unknown>[]) {
  const result = await request<{ data: BackendValidateResponse }>("/inventory/bulk/validate", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
  const data = result.data || {};
  const validCount = Number(data.validCount ?? data.valid ?? 0);
  const invalidCount = Number(data.invalidCount ?? data.invalid ?? 0);
  const errors = (data.errors || []).map((err) => ({
    row: Number(err.row),
    field: err.field,
    message: err.message || err.reason || "Validation failed for this row.",
    reason: err.reason || err.message,
  }));
  return {
    validCount,
    invalidCount,
    valid: validCount,
    invalid: invalidCount,
    errors,
  } as BulkValidateResult;
}

export async function importBulkInventory(token: string, payload: { file?: File; rows?: Record<string, unknown>[]; mapping?: string }) {
  let result: { data: BackendImportResponse };
  if (payload.file) {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.mapping) formData.append("mapping", payload.mapping);
    result = await request<{ data: BackendImportResponse }>("/inventory/bulk/import", token, {
      method: "POST",
      body: formData,
    });
  } else {
    result = await request<{ data: BackendImportResponse }>("/inventory/bulk/import", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: payload.rows }),
    });
  }
  const data = result.data || {};
  const importedCount = Number(data.importedCount ?? data.imported ?? 0);
  const totalRows = Number(data.totalRows ?? data.total ?? 0);
  const skippedCount = Number(data.skippedCount ?? data.failed ?? 0);
  return {
    importedCount,
    totalRows,
    imported: importedCount,
    total: totalRows,
    skippedCount,
    failed: skippedCount,
    errors: data.errors,
  } as BulkImportResult;
}
