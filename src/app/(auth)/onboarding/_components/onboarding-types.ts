import type { ChangeEvent } from "react";

export type OnboardingData = {
  storeName: string;
  address: string;
  city: string;
  phoneNumber: string;
  description: string;
  retailerId: string;
  humidorName: string;
  humidorLocation: string;
  humidorDescription: string;
  shelfes: Array<{ name: string; description: string; rows: string; columns: string }>;
  humidorId: string;
  inventoryName: string;
  inventoryBrand: string;
  inventoryStrength: string;
  inventoryWrapper: string;
  inventorySize: string;
  inventoryDescription: string;
  inventoryPairingSuggestions: string[];
  inventoryShelfName: string;
  inventoryShelfRow: string;
  inventoryShelfColumn: string;
  inventoryQuantity: string;
  inventoryPrice: string;
  lowStockThreshold: string;
  isStaffPick: boolean;
  staffPickNote: string;
  staffPickBy: string;
  isNewArrival: boolean;
  arrivalDate: string;
  isDailyFeatured: boolean;
  featuredNote: string;
  inventoryId: string;
  qrStyle: string;
  qrPlacement: string;
};

export type OnboardingStepProps = {
  data: OnboardingData;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
};

export type BusinessInformationData = Pick<
  OnboardingData,
  "storeName" | "address" | "city" | "phoneNumber" | "description"
>;

export type BusinessInformationField = keyof BusinessInformationData;

export type InventoryData = Pick<
  OnboardingData,
  | "inventoryName"
  | "inventoryBrand"
  | "inventoryStrength"
  | "inventoryWrapper"
  | "inventorySize"
  | "inventoryDescription"
  | "inventoryPairingSuggestions"
  | "inventoryShelfName"
  | "inventoryShelfRow"
  | "inventoryShelfColumn"
  | "inventoryQuantity"
  | "inventoryPrice"
  | "lowStockThreshold"
  | "isStaffPick"
  | "staffPickNote"
  | "staffPickBy"
  | "isNewArrival"
  | "arrivalDate"
  | "isDailyFeatured"
  | "featuredNote"
  | "shelfes"
>;

export type InventoryField = Exclude<keyof InventoryData, "shelfes">;

export const inputClassName =
  "h-11 w-full rounded-[7px] border border-[#6f5528] bg-[#3B2D16]/65 px-3.5 text-sm text-white outline-none transition placeholder:text-[#9E9277] hover:border-[#8B6A32] focus:border-[#CBA24A] focus:ring-2 focus:ring-[#CBA24A]/20";

export const labelClassName =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#D6C9A7]";

export const textareaClassName =
  "min-h-[104px] w-full resize-y rounded-[7px] border border-[#6f5528] bg-[#3B2D16]/65 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#9E9277] hover:border-[#8B6A32] focus:border-[#CBA24A] focus:ring-2 focus:ring-[#CBA24A]/20";
