"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites";
import CigarImage from "./cigar-image";

export type ProductBadge = {
  label: string;
  variant?: "blue" | "gold";
};

export type ProductCardData = {
  id: string;
  name: string;
  brand: string;
  price: number;
  strength?: string;
  image?: string;
  origin?: string;
  description?: string;
  badges?: ProductBadge[];
};

type ProductCardProps = {
  product: ProductCardData;
  isFavorite?: boolean;
  onFavoriteChange?: (product: ProductCardData, favorite: boolean) => void;
  favoriteDisabled?: boolean;
  className?: string;
  href?: string;
};

const strengthStyles: Record<string, string> = {
  mild: "border-emerald-600/60 bg-emerald-950/70 text-emerald-400",
  medium: "border-amber-600/55 bg-amber-950/60 text-amber-400",
  "medium-full": "border-orange-600/60 bg-orange-950/60 text-orange-400",
  full: "border-red-600/55 bg-red-950/60 text-red-400",
};

const badgeStyles = {
  blue: "bg-[#2872E7] text-white",
  gold: "bg-[#D3A94F] text-[#17120A]",
};

function titleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

export default function ProductCard({
  product,
  isFavorite: controlledIsFavorite,
  onFavoriteChange,
  favoriteDisabled = false,
  className = "",
  href,
}: ProductCardProps) {
  const params = useParams<{ "store-name"?: string }>();
  const storeName = params["store-name"] || "";
  const favorites = useFavorites(storeName);
  const isFavorite =
    controlledIsFavorite ?? favorites.isFavorite(product.id);
  const favoriteHandler =
    onFavoriteChange ||
    ((favoriteProduct: ProductCardData, favorite: boolean) =>
      favorites.setFavorite(favoriteProduct, favorite));
  const strength = product.strength?.toLowerCase() || "medium";
  const disabled = favoriteDisabled || !storeName;

  return (
    <article
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#393532] bg-[#211F1D] transition duration-300 hover:-translate-y-1 hover:border-[#CBA24A]/45 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="relative flex aspect-[4/5] max-h-[250px] items-center justify-center overflow-hidden bg-[#242220]">
        {href && (
          <Link
            href={href}
            aria-label={`View details for ${product.name}`}
            className="absolute inset-0 z-[5]"
          />
        )}
        <CigarImage
          src={product.image}
          alt={product.name}
          width={1000}
          height={1000}
          className="h-[250px] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242220]/35 via-transparent to-black/5" />

        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
          {product.badges?.map((badge) => (
            <span
              key={`${badge.label}-${badge.variant}`}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${
                badgeStyles[badge.variant || "blue"]
              }`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {product.origin && (
          <span className="absolute bottom-3 left-1/2 max-w-[85%] -translate-x-1/2 truncate rounded-full bg-black/55 px-3 py-1 text-[10px] text-[#C8C1B8] backdrop-blur-sm">
            {product.origin}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-black/15 bg-[#191715] p-4">
        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[#99938A]">
          {product.brand || "Premium selection"}
        </p>
        {href ? (
          <Link href={href} className="mt-1 truncate font-playfair text-base text-[#E8E3DD] transition hover:text-[#D7AA46]">
            {product.name}
          </Link>
        ) : (
          <h3 className="mt-1 truncate font-playfair text-base text-[#E8E3DD]">
            {product.name}
          </h3>
        )}
        <p className="mt-1 min-h-4 truncate text-xs text-[#8F8983]">
          {product.description || "\u00A0"}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] leading-none ${
              strengthStyles[strength] || strengthStyles.medium
            }`}
          >
            {titleCase(product.strength || "Medium")}
          </span>
          <p className="text-base font-semibold text-[#D4A94A]">
            ${Number(product.price).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          aria-label={
            isFavorite
              ? `Remove ${product.name} from favorites`
              : `Add ${product.name} to favorites`
          }
          onClick={() => favoriteHandler(product, !isFavorite)}
          className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition ${
            isFavorite
              ? "border-[#D5AB48] bg-[#D5AB48] text-[#241A0C] shadow-[0_6px_18px_rgba(213,171,72,0.16)]"
              : "border-white/[0.04] bg-[#2C2927] text-[#96908A]"
          } ${
            disabled
              ? "cursor-not-allowed opacity-70"
              : isFavorite
                ? "hover:border-[#E2BA5A] hover:bg-[#E2BA5A]"
                : "hover:border-[#CBA24A]/35 hover:text-[#D4A94A]"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Saved" : "Favorite"}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#393532] bg-[#211F1D] ${className}`}
    >
      <div className="aspect-[4/5] min-h-[260px] animate-pulse bg-white/[0.04]" />
      <div className="space-y-3 bg-[#191715] p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-9 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
