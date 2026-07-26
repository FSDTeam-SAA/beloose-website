"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Beer,
  Check,
  Coffee,
  GlassWater,
  Grape,
  Heart,
  ImageOff,
  Martini,
  MapPin,
  Package,
  RefreshCw,
  Sparkles,
  Wine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites";
import SocialShareContent from "@/components/ui/social-share-content";
import {
  getInventoryDetails,
  InventoryDetailsError,
} from "@/lib/inventoryDetails";
import MoreExclusive from "./more-exclusive";
import SimilarCigars from "./similar-cigars";

const titleCase = (value: string) =>
  value
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

const getPairingIcon = (pairing: string) => {
  const value = pairing.toLowerCase();

  if (value.includes("whisky")) return GlassWater;
  if (value.includes("aged rum")) return Martini;
  if (value.includes("cognac") || value.includes("brandy")) return Wine;
  if (value.includes("port")) return Grape;
  if (value.includes("coffee") || value.includes("espresso")) return Coffee;
  if (value.includes("dark beer") || value.includes("stout")) return Beer;

  return Wine;
};

const ProductDetailsContainer = () => {
  const params = useParams<{ "store-name": string; id: string }>();
  const storeName = params["store-name"];
  const id = params.id;
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const favorites = useFavorites(storeName);
  const isFavorite = favorites.isFavorite(id);
  const query = useQuery({
    queryKey: ["inventory-details", id],
    queryFn: ({ signal }) => getInventoryDetails(id, signal),
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: (count, error) =>
      !(error instanceof InventoryDetailsError && error.status === 404) &&
      count < 2,
  });

  const toggleFavorite = () => {
    if (!query.data) return;
    favorites.setFavorite(
      {
        id,
        name: query.data.name,
        brand: query.data.brand,
        price:
          query.data.displayPrice ??
          query.data.featuredPrice ??
          query.data.discountPrice ??
          query.data.price,
        strength: query.data.strength,
        image: query.data.image,
        origin: query.data.humidorName,
        description: query.data.description,
      },
      !isFavorite,
    );
  };

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-[#0F0E0D] px-4 pb-16 pt-28 text-white sm:pt-32">
        <div className="container animate-pulse">
          <div className="h-4 w-24 rounded bg-white/[0.07]" />
          <div className="mt-7 grid gap-8 md:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-white/[0.05]" />
            <div className="space-y-4 py-8">
              <div className="h-3 w-28 rounded bg-white/[0.07]" />
              <div className="h-10 w-3/4 rounded bg-white/[0.07]" />
              <div className="h-20 rounded bg-white/[0.05]" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-white/[0.05]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (query.isError) {
    const missing =
      query.error instanceof InventoryDetailsError &&
      query.error.status === 404;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F0E0D] px-4 pt-20 text-white">
        <div className="w-full container rounded-2xl border border-white/[0.09] bg-[#191715] px-6 py-12 text-center">
          <Package className="mx-auto h-9 w-9 text-[#CBA24A]" />
          <h1 className="mt-4 font-playfair text-2xl text-[#F5E7D0]">
            {missing ? "Product not found" : "Couldn’t load this product"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#9D958B]">
            {missing
              ? "This product may have been removed or is no longer available."
              : query.error instanceof Error
                ? query.error.message
                : "Something went wrong. Please try again."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={storePath} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs text-[#C8BFB4] hover:border-[#CBA24A]/40">
              Back to store
            </Link>
            {!missing && (
              <button onClick={() => query.refetch()} className="inline-flex items-center gap-2 rounded-lg bg-[#CBA24A] px-4 py-2.5 text-xs font-semibold text-[#171109] hover:bg-[#E0B44F]">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const product = query.data!;
  const displayPrice =
    product.displayPrice ??
    product.featuredPrice ??
    product.discountPrice ??
    product.price;
  const recommendationNote =
    product.recommendationNote ||
    product.staffPickNote ||
    product.featuredNote ||
    product.newArrivalNote;
  const stockLabel =
    product.quantity > 0
      ? `${product.quantity} ${product.quantity === 1 ? "item" : "items"} available`
      : "Currently unavailable";

  return (
    <main className="min-h-screen bg-[#0F0E0D] px-4 py-16 text-white sm:px-6">
      <div className="container">
        <Link href={storePath} className="inline-flex items-center gap-2 text-xs text-[#A9A095] transition hover:text-[#D7AA46]">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>

        <section className="mt-7 grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/[0.09] bg-[#211F1D]">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[#8F8983]">
                <ImageOff className="h-14 w-14" />
                <p className="mt-3 text-xs">Image unavailable</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#CBA24A]">{product.brand}</p>
            <h1 className="mt-2 font-playfair text-4xl text-[#F5E7D0] sm:text-5xl">{product.name}</h1>
            {product.description && <p className="mt-4 text-sm leading-7 text-[#A9A095]">{product.description}</p>}

            {(product.isStaffPick ||
              product.isNewArrival ||
              product.isDailyFeatured ||
              product.isOnDiscount) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.isStaffPick && (
                  <span className="rounded-full bg-[#CBA24A] px-2.5 py-1 text-[10px] font-semibold text-[#171109]">
                    Staff Pick
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="rounded-full bg-[#2872E7] px-2.5 py-1 text-[10px] font-semibold text-white">
                    New Arrival
                  </span>
                )}
                {product.isDailyFeatured && (
                  <span className="rounded-full border border-[#CBA24A]/35 bg-[#CBA24A]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D7AA46]">
                    Daily Featured
                  </span>
                )}
                {product.isOnDiscount && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                    Special Price
                  </span>
                )}
              </div>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Strength", titleCase(product.strength)],
                ["Size", product.size],
                ["Wrapper", product.wrapper],
                ["Location", product.humidorName || product.shelfName],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.09] bg-[#191715] p-3">
                  <dt className="text-[10px] text-[#837C74]">{label}</dt>
                  <dd className="mt-1 text-xs text-[#E2DCD5]">{value || "Not specified"}</dd>
                </div>
              ))}
            </dl>

            {!!product.flavorNotes?.length && (
              <div className="mt-5">
                <p className="text-[10px] text-[#837C74]">Flavor Notes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="rounded-full border border-white/[0.09] bg-[#191715] px-3 py-1.5 text-[11px] text-[#D9D1C8]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <p className="mr-2 font-playfair text-3xl text-[#D7AA46]">
                ${Number(displayPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              {displayPrice < product.price && (
                <p className="text-sm text-[#817A72] line-through">
                  ${Number(product.price).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${product.quantity > 0 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-red-500/25 bg-red-500/10 text-red-300"}`}>
                {product.quantity > 0 && <Check className="h-3.5 w-3.5" />}
                {stockLabel}
              </span>
              <button
                type="button"
                onClick={toggleFavorite}
                aria-pressed={isFavorite}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-medium transition ${
                  isFavorite
                    ? "border-[#D5AB48] bg-[#D5AB48] text-[#241A0C] shadow-[0_6px_18px_rgba(213,171,72,0.16)] hover:border-[#E2BA5A] hover:bg-[#E2BA5A]"
                    : "border-white/[0.09] bg-[#2C2927] text-[#A9A095] hover:border-[#CBA24A]/35 hover:text-[#D7AA46]"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Saved" : "Favorite"}
              </button>
              <SocialShareContent
                storeName={storeName}
                productId={id}
                title={product.name}
              />
            </div>
          </div>
        </section>

         <section className="mt-9 rounded-2xl border border-white/[0.09] bg-[#191715] p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#CBA24A]" />
              <div>
                <h2 className="font-playfair text-lg text-[#F5E7D0]">Why You’ll Like This Cigar</h2>
                <p className="mt-2 text-sm leading-6 text-[#9D958B]">{recommendationNote || "N/A"}</p>
              </div>
            </div>
          </section>

        {/* {recommendationNote && (
          <section className="mt-9 rounded-2xl border border-white/[0.09] bg-[#191715] p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#CBA24A]" />
              <div>
                <h2 className="font-playfair text-lg text-[#F5E7D0]">Why You’ll Like This Cigar</h2>
                <p className="mt-2 text-sm leading-6 text-[#9D958B]">{recommendationNote}</p>
              </div>
            </div>
          </section>
        )} */}

        <section className="mt-9">
          <h2 className="flex items-center gap-2 font-playfair text-xl text-[#F5E7D0]">
            <MapPin className="h-5 w-5 text-[#CBA24A]" /> Find It on the Shelf
          </h2>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-[#191715] p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#CBA24A]/25 text-[#CBA24A]">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-[#E2DCD5]">
                {[product.humidorName, product.shelfName]
                  .filter(Boolean)
                  .join(" · ") || "Ask store staff for shelf location"}
              </p>
              <p className="mt-1 text-xs text-[#8F8983]">Ask the tobacconist for help locating this cigar.</p>
            </div>
          </div>
        </section>

        {!!product.pairingSuggestions?.length && (
          <section
            className="mt-10"
            aria-labelledby="perfect-pairings-title"
          >
            <h2
              id="perfect-pairings-title"
              className="flex items-center gap-2 font-playfair text-lg text-[#F5E7D0] sm:text-xl"
            >
              <Wine
                className="h-5 w-5 text-[#D7AA46]"
                strokeWidth={1.8}
              />
              Perfect Pairings
            </h2>

            <div className="mt-4 rounded-xl border border-white/[0.1] bg-[#191715] p-4 sm:p-5">
              <p className="text-sm italic leading-6 text-[#9D958B]">
                {product?.description ||
                  "Rich, thoughtfully selected companions can complement the character of a premium cigar."}
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {product?.pairingSuggestions?.map((pairing) => {
                  const PairingIcon = getPairingIcon(pairing);

                  return (
                    <div
                      key={pairing}
                      className="flex min-h-[68px] flex-col items-center justify-center rounded-lg bg-[#2A2725] px-3 py-3 text-center transition hover:bg-[#302D2A]"
                    >
                      <PairingIcon
                        className="h-5 w-5 text-[#F0EBE5]"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <p className="mt-1.5 text-xs text-[#F0EBE5]">
                        {pairing}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        <MoreExclusive />
        <SimilarCigars/>
      </div>
    </main>
  );
};

export default ProductDetailsContainer;
