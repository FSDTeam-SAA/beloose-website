"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/common/product-card";
import { getDailyFeatured } from "@/lib/storeHighlights";

export default function DailyFeaturedContainer() {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const query = useQuery({
    queryKey: ["store", storeName, "daily-featured"],
    queryFn: ({ signal }) => getDailyFeatured(storeName, signal),
    enabled: Boolean(storeName),
    staleTime: 60_000,
  });

  return (
    <main className="min-h-screen bg-[#0F0E0D] text-white">
      <div className="border-b border-white/[0.07] bg-[radial-gradient(circle_at_top_left,rgba(203,162,74,0.14),transparent_38%)]">
        <div className="store-page-section container">
          <Link
            href={`/store/${encodeURIComponent(storeName)}`}
            className="inline-flex items-center gap-2 text-xs text-[#A9A095] transition hover:text-[#D7AA46]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#CBA24A]/30 bg-[#CBA24A]/10 text-[#CBA24A]">
                <CalendarDays className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#CBA24A]">
                  Selected for today <Sparkles className="h-3 w-3" />
                </p>
                <h1 className="font-playfair text-3xl text-[#F5E7D0] sm:text-4xl">
                  Daily Featured
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#9D958B]">
                  Discover today’s standout cigars, selected from the store’s
                  available collection.
                </p>
              </div>
            </div>
            {!query.isLoading && !query.isError && (
              <p className="text-xs text-[#9D958B]">
                <span className="font-semibold text-[#D7AA46]">
                  {query.data?.count || 0}
                </span>{" "}
                {query.data?.count === 1
                  ? "featured cigar"
                  : "featured cigars"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="store-page-section container">
        {query.isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {query.isError && (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-white/[0.09] bg-[#191715] px-6 py-14 text-center">
            <RefreshCw className="h-8 w-8 text-[#CBA24A]" />
            <h2 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              Couldn’t load today’s featured cigars
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#9D958B]">
              {query.error instanceof Error
                ? query.error.message
                : "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-5 rounded-lg bg-[#CBA24A] px-5 py-2.5 text-xs font-semibold text-[#171109] transition hover:bg-[#E0B44F]"
            >
              Try again
            </button>
          </div>
        )}

        {!query.isLoading && !query.isError && !query.data?.data.length && (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] px-6 py-16 text-center">
            <CalendarDays className="h-9 w-9 text-[#CBA24A]" />
            <h2 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              Today’s feature is coming soon
            </h2>
            <p className="mt-2 text-sm text-[#9D958B]">
              Check back shortly for today’s hand-selected cigars.
            </p>
          </div>
        )}

        {!query.isLoading && !query.isError && !!query.data?.data.length && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-playfair text-xl text-[#F5E7D0] sm:text-2xl">
                Today&apos;s Selection
              </h2>
              <span className="rounded-full border border-[#CBA24A]/20 bg-[#CBA24A]/10 px-2.5 py-0.5 text-[10px] text-[#D7AA46]">
                {query.data.data.length}
              </span>
              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {query.data.data.map((item) => {
                const product: ProductCardData = {
                  id: item._id,
                  name: item.name,
                  brand: item.brand,
                  price: item.featuredPrice ?? item.price,
                  strength: item.strength,
                  image: item.image,
                  origin: item.humidorName,
                  description:
                    item.featuredNote ||
                    [item.wrapper, item.size, item.wallName, item.shelfName, item.shelfColumn ? `C${item.shelfColumn}` : undefined]
                      .filter(Boolean)
                      .join(" · "),
                  badges: [{ label: "Daily Featured", variant: "gold" }],
                };
                return (
                  <ProductCard
                    key={item._id}
                    product={product}
                    href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(item._id)}`}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
