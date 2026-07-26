import { prepareImageUpload } from "./imageUpload";

export class RetailerApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type RetailerProfile = {
  _id: string;
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
    verified?: string;
    verfied?: string;
    subscriptionExpiry?: string;
  };
  storeName: string;
  address: string;
  phoneNumber: string;
  city: string;
  description?: string;
  storeSlug?: string;
  logo?: string;
  banner?: string;
  qrCodeUrl?: string;
  status?: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  subscriptionPlan?: "none" | "monthly" | "yearly";
  subscriptionStatus?: "inactive" | "active" | "overdue" | "cancelled";
};

export type RetailerProfileInput = Pick<
  RetailerProfile,
  "storeName" | "address" | "phoneNumber" | "city" | "description"
>;

type ApiResponse<T> = {
  data?: T;
  message?: string;
  errorSources?: { path?: string; message?: string }[];
};

async function retailerRequest<T>(
  path: string,
  token: string,
  init?: RequestInit,
  signal?: AbortSignal,
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    signal,
  });
  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;
  if (!response.ok) {
    throw new RetailerApiError(
      result?.errorSources?.[0]?.message ||
        result?.message ||
        "Retailer request failed",
      response.status,
    );
  }
  if (!result?.data) {
    throw new RetailerApiError("Retailer profile was not found", 404);
  }
  return result.data;
}

export function getMyRetailer(token: string, signal?: AbortSignal) {
  return retailerRequest<RetailerProfile>(
    "/retailer/me",
    token,
    undefined,
    signal,
  );
}

export async function updateRetailerProfile(
  token: string,
  id: string,
  input: RetailerProfileInput,
  files?: { logo?: File; banner?: File },
) {
  const body = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) body.append(key, value);
  });
  if (files?.logo) body.append("logo", await prepareImageUpload(files.logo));
  if (files?.banner)
    body.append("banner", await prepareImageUpload(files.banner));

  return retailerRequest<RetailerProfile>(`/retailer/${id}`, token, {
    method: "PUT",
    body,
  });
}
