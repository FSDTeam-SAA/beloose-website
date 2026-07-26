export type RetailerBanner = {
  _id: string;
  banner?: string;
  title?: string;
  mainTitle?: string;
  discription?: string;
};

export type RetailerAbout = {
  _id: string;
  image?: string;
  title?: string;
  description?: string;
  features?: string[];
};

export type RetailerPlatformFeature = {
  icon?: string;
  title?: string;
  description?: string;
};

export type RetailerPlatform = {
  _id: string;
  image?: string;
  platformLabel?: string;
  title?: string;
  highlightedTitle?: string;
  description?: string;
  imageLabel?: string;
  imageTitle?: string;
  features?: RetailerPlatformFeature[];
};

export type RetailerHowItWork = {
  _id: string;
  image?: string;
  title?: string;
  description?: string;
};

export type RetailerBenefits = {
  _id: string;
  images?: string[];
  title?: string;
  subTitle?: string;
  features?: string[];
};

type CollectionResponse<T> = {
  data?: T[];
  message?: string;
};

async function getCollection<T>(
  path: string,
  limit: number,
  signal?: AbortSignal,
  sortOrder: "asc" | "desc" = "desc",
) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const query = new URLSearchParams({
    page: "1",
    limit: String(limit),
    sortBy: "createdAt",
    sortOrder,
  });
  const response = await fetch(`${apiUrl}${path}?${query}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = (await response.json().catch(() => null)) as
    | CollectionResponse<T>
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || "Live landing content is unavailable.");
  }
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("The landing content response is invalid.");
  }

  return payload.data;
}

const getLatest = async <T>(path: string, signal?: AbortSignal) =>
  (await getCollection<T>(path, 1, signal))[0] ?? null;

export const getRetailerBanner = (signal?: AbortSignal) =>
  getLatest<RetailerBanner>("/retailer-banner", signal);

export const getRetailerAbout = (signal?: AbortSignal) =>
  getLatest<RetailerAbout>("/retailer-about", signal);

export const getRetailerPlatform = (signal?: AbortSignal) =>
  getLatest<RetailerPlatform>("/retailer-platform", signal);

export const getRetailerHowItWorks = (signal?: AbortSignal) =>
  getCollection<RetailerHowItWork>("/retailer-howitwork", 3, signal, "asc");

export const getRetailerBenefits = (signal?: AbortSignal) =>
  getLatest<RetailerBenefits>("/retailer-benefits", signal);
