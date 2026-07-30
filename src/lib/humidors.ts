export type HumidorShelf = {
  _id: string;
  name: string;
  description?: string;
  cigarCount: number;
};

export type HumidorWall = {
  _id: string;
  name: string;
  description?: string;
  columns: number;
  shelves: HumidorShelf[];
};

export type Humidor = {
  _id: string;
  name: string;
  location?: string;
  description?: string;
  walls: HumidorWall[];
  /** Legacy data returned for rooms created before wall management. */
  shelfes?: (HumidorShelf & { rows: number; columns: number })[];
  isActive: boolean;
};

export type HumidorInput = {
  name: string;
  location?: string;
  description?: string;
  isActive?: boolean;
};

type ApiResponse<T> = { message?: string; data: T };

async function humidorRequest<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error(result.message || "Humidor request failed");
  return result.data;
}

export function getHumidors(token: string, signal?: AbortSignal) {
  return humidorRequest<Humidor[]>("/humidor/my-humidor?limit=100", token, { signal });
}

export function createHumidor(token: string, payload: HumidorInput) {
  return humidorRequest<Humidor>("/humidor", token, { method: "POST", body: JSON.stringify(payload) });
}

export function updateHumidor(token: string, id: string, payload: HumidorInput) {
  return humidorRequest<Humidor>(`/humidor/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteHumidor(token: string, id: string) {
  return humidorRequest<Humidor>(`/humidor/${id}`, token, { method: "DELETE" });
}

export type HumidorShelfInput = {
  name: string;
  description?: string;
};

export type HumidorWallInput = {
  name: string;
  description?: string;
  columns: number;
  shelves?: HumidorShelfInput[];
};

export function addHumidorWall(token: string, id: string, payload: HumidorWallInput) {
  return humidorRequest<Humidor>(`/humidor/${id}/wall`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function updateHumidorWall(token: string, id: string, wallId: string, payload: Partial<HumidorWallInput>) {
  return humidorRequest<Humidor>(`/humidor/${id}/wall/${wallId}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteHumidorWall(token: string, id: string, wallId: string) {
  return humidorRequest<Humidor>(`/humidor/${id}/wall/${wallId}`, token, { method: "DELETE" });
}

export function addHumidorShelf(token: string, id: string, wallId: string, payload: HumidorShelfInput) {
  return humidorRequest<Humidor>(`/humidor/${id}/wall/${wallId}/shelf`, token, { method: "POST", body: JSON.stringify(payload) });
}
