"use client";

import {
  Check,
  ImagePlus,
  Package,
  Sparkles,
  Trash2,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  inputClassName,
  labelClassName,
  textareaClassName,
  type InventoryData,
  type InventoryField,
} from "./onboarding-types";

type InventoryStepProps = {
  data: InventoryData;
  image: File | null;
  onFieldChange: (
    field: InventoryField,
    value: string | boolean | string[],
  ) => void;
  onImageChange: (file: File | null) => void;
};

const pairingOptions = [
  "Cigar + Whisky",
  "Cigar + Aged Rum",
  "Cigar + Cognac / Brandy",
  "Cigar + Port",
  "Cigar + Coffee / Espresso",
  "Cigar + Dark Beer / Stout",
];

const wrapperOptions = [
  "Connecticut",
  "Connecticut Broadleaf",
  "Natural",
  "Maduro",
  "Habano",
  "Corojo",
  "Cameroon",
  "Sumatra",
  "Oscuro",
  "Candela",
  "Colorado",
  "Criollo",
  "San Andrés",
];

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#6f5528] bg-[#3B2D16]/35 p-4 transition hover:border-[#8B6A32]">
    <span>
      <span className="block text-sm font-medium text-[#e5e1dc]">{label}</span>
      <span className="mt-0.5 block text-xs text-[#8f8a85]">{description}</span>
    </span>
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#D5AB48]" : "bg-[#6f5528]"}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
    </span>
  </label>
);

const InventoryStep = ({
  data,
  image,
  onFieldChange,
  onImageChange,
}: InventoryStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedShelf = data.shelfes.find(
    (shelf) => shelf.name.trim() === data.inventoryShelfName,
  );

  return (
  <div className="space-y-7">
    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]"><Package className="h-4 w-4" /></span>
        <div><h2 className="text-sm font-semibold text-[#F5E7C2]">Cigar details</h2><p className="mt-0.5 text-xs text-[#B7A887]">Add the key product information customers will see.</p></div>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className={labelClassName}>Cigar name</span>
          <input className={inputClassName} value={data.inventoryName} onChange={(e) => onFieldChange("inventoryName", e.target.value)} placeholder="Padron 1964 Natural Toro" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={labelClassName}>Brand</span><input className={inputClassName} value={data.inventoryBrand} onChange={(e) => onFieldChange("inventoryBrand", e.target.value)} placeholder="Padron" /></label>
          <label className="block"><span className={labelClassName}>Size</span><input className={inputClassName} value={data.inventorySize} onChange={(e) => onFieldChange("inventorySize", e.target.value)} placeholder="Toro" /></label>
          <div>
            <span className={labelClassName}>Wrapper</span>
            <Select
              value={data.inventoryWrapper || undefined}
              onValueChange={(value) =>
                onFieldChange("inventoryWrapper", value)
              }
            >
              <SelectTrigger
                aria-label="Wrapper"
                className={`${inputClassName} shadow-none`}
              >
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent className="border-[#6f5528] bg-[#2b2112] text-[#e5e1dc]">
                {wrapperOptions.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="focus:bg-[#4b391b] focus:text-[#f1d993]"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><span className={labelClassName}>Strength</span><Select value={data.inventoryStrength} onValueChange={(value) => onFieldChange("inventoryStrength", value)}><SelectTrigger aria-label="Strength" className={`${inputClassName} shadow-none`}><SelectValue placeholder="Select strength" /></SelectTrigger><SelectContent className="border-[#6f5528] bg-[#2b2112] text-[#e5e1dc]"><SelectItem className="focus:bg-[#4b391b] focus:text-[#f1d993]" value="mild">Mild</SelectItem><SelectItem className="focus:bg-[#4b391b] focus:text-[#f1d993]" value="medium">Medium</SelectItem><SelectItem className="focus:bg-[#4b391b] focus:text-[#f1d993]" value="medium-full">Medium-Full</SelectItem><SelectItem className="focus:bg-[#4b391b] focus:text-[#f1d993]" value="full">Full</SelectItem></SelectContent></Select></div>
        </div>
        <label className="block"><span className={labelClassName}>Description</span><textarea className={textareaClassName} value={data.inventoryDescription} onChange={(e) => onFieldChange("inventoryDescription", e.target.value)} placeholder="A premium handmade Nicaraguan cigar." /></label>
        <div>
          <span className={labelClassName}>Pairing suggestions</span>
          <p className="mb-3 text-xs text-[#8f8a85]">
            Choose any pairings that complement this cigar.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {pairingOptions.map((option) => {
              const selected =
                data.inventoryPairingSuggestions.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onFieldChange(
                      "inventoryPairingSuggestions",
                      selected
                        ? data.inventoryPairingSuggestions.filter(
                            (value) => value !== option,
                          )
                        : [...data.inventoryPairingSuggestions, option],
                    )
                  }
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-xs transition ${
                    selected
                      ? "border-[#D5AB48] bg-[#D5AB48]/10 text-[#F5E7C2]"
                      : "border-[#6f5528] bg-[#3B2D16]/35 text-[#B7A887] hover:border-[#8B6A32]"
                  }`}
                >
                  <span>{option}</span>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                      selected
                        ? "border-[#D5AB48] bg-[#D5AB48] text-[#2b2112]"
                        : "border-[#6f5528]"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>

    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]"><Warehouse className="h-4 w-4" /></span>
        <div><h2 className="text-sm font-semibold text-[#F5E7C2]">Placement & stock</h2><p className="mt-0.5 text-xs text-[#B7A887]">Choose where it is stored and set stock tracking values.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className={labelClassName}>Shelf</span><Select value={data.inventoryShelfName || undefined} onValueChange={(value) => { onFieldChange("inventoryShelfName", value); onFieldChange("inventoryShelfRow", "1"); onFieldChange("inventoryShelfColumn", "1"); }}><SelectTrigger aria-label="Shelf" className={`${inputClassName} shadow-none`}><SelectValue placeholder="Select a shelf" /></SelectTrigger><SelectContent className="border-[#6f5528] bg-[#2b2112] text-[#e5e1dc]">{data.shelfes.filter((shelf) => shelf.name.trim()).map((shelf) => <SelectItem className="focus:bg-[#4b391b] focus:text-[#f1d993]" key={shelf.name} value={shelf.name.trim()}>{shelf.name} — {shelf.rows} × {shelf.columns} grid</SelectItem>)}</SelectContent></Select></div>
        <label className="block"><span className={labelClassName}>Shelf row</span><input className={inputClassName} type="number" min="1" max={selectedShelf ? Number(selectedShelf.rows) : undefined} value={data.inventoryShelfRow} onChange={(e) => onFieldChange("inventoryShelfRow", e.target.value)} placeholder="1" /></label>
        <label className="block"><span className={labelClassName}>Shelf column</span><input className={inputClassName} type="number" min="1" max={selectedShelf ? Number(selectedShelf.columns) : undefined} value={data.inventoryShelfColumn} onChange={(e) => onFieldChange("inventoryShelfColumn", e.target.value)} placeholder="1" /></label>
        <label className="block"><span className={labelClassName}>Quantity</span><input className={inputClassName} type="number" min="0" value={data.inventoryQuantity} onChange={(e) => onFieldChange("inventoryQuantity", e.target.value)} placeholder="10" /></label>
        <label className="block"><span className={labelClassName}>Price ($)</span><input className={inputClassName} type="number" min="0" step="0.01" value={data.inventoryPrice} onChange={(e) => onFieldChange("inventoryPrice", e.target.value)} placeholder="25.99" /></label>
        <label className="block"><span className={labelClassName}>Low stock alert</span><input className={inputClassName} type="number" min="0" value={data.lowStockThreshold} onChange={(e) => onFieldChange("lowStockThreshold", e.target.value)} placeholder="5" /></label>
      </div>
    </section>

    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <span className={labelClassName}>Product image</span>
      {image && previewUrl ? (
        <div className="overflow-hidden rounded-lg border border-[#8B6A32] bg-[#3B2D16]/35">
          <div className="relative h-[120px] w-full bg-black/30">
            <Image
              src={previewUrl}
              alt={`Preview of ${image.name}`}
              fill
              unoptimized
              className="object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label={`Remove ${image.name}`}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-300/30 bg-black/75 text-red-300 shadow-lg backdrop-blur-sm transition hover:bg-red-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#6f5528] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[#F5E7C2]">{image.name}</p>
              <p className="mt-0.5 text-[10px] text-[#B7A887]">
                {(image.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-md border border-[#D5AB48]/60 px-3 py-2 text-[11px] font-medium text-[#D5AB48] transition hover:bg-[#D5AB48]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5AB48]"
            >
              Replace image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#8B6A32] bg-[#3B2D16]/35 p-4 text-center transition hover:border-[#D5AB48] hover:bg-[#D5AB48]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5AB48]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D5AB48]/15">
            <ImagePlus className="h-5 w-5 text-[#D5AB48]" />
          </span>
          <span>
            <span className="block text-sm text-[#F5E7C2]">Click to upload a cigar image</span>
            <span className="text-xs text-[#B7A887]">PNG, JPG or WEBP</span>
          </span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onImageChange(event.target.files?.[0] || null)
        }
      />
    </section>

    <section className="space-y-3 rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]"><Sparkles className="h-4 w-4" /></span>
        <div><h2 className="text-sm font-semibold text-[#F5E7C2]">Optional highlights</h2><p className="mt-0.5 text-xs text-[#B7A887]">Promote this product in special customer-facing sections.</p></div>
      </div>
      <Toggle label="Staff Pick" description="Feature this cigar as a staff recommendation" checked={data.isStaffPick} onChange={(value) => onFieldChange("isStaffPick", value)} />
      {data.isStaffPick ? <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className={labelClassName}>Picked by</span><input className={inputClassName} value={data.staffPickBy} onChange={(e) => onFieldChange("staffPickBy", e.target.value)} placeholder="Mike" /></label><label className="block"><span className={labelClassName}>Staff note</span><input className={inputClassName} value={data.staffPickNote} onChange={(e) => onFieldChange("staffPickNote", e.target.value)} placeholder="A customer favorite" /></label></div> : null}
      <Toggle label="New Arrival" description="Mark this cigar as recently added" checked={data.isNewArrival} onChange={(value) => onFieldChange("isNewArrival", value)} />
      {data.isNewArrival ? <label className="block"><span className={labelClassName}>Arrival date</span><input className={inputClassName} type="date" value={data.arrivalDate} onChange={(e) => onFieldChange("arrivalDate", e.target.value)} /></label> : null}
      <Toggle label="Daily Featured" description="Show this cigar in today's featured selection" checked={data.isDailyFeatured} onChange={(value) => onFieldChange("isDailyFeatured", value)} />
      {data.isDailyFeatured ? <label className="block"><span className={labelClassName}>Featured note</span><input className={inputClassName} value={data.featuredNote} onChange={(e) => onFieldChange("featuredNote", e.target.value)} placeholder="Try this with our new bourbon pairing" /></label> : null}
    </section>
  </div>
  );
};

export default InventoryStep;
