"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Dices, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/common/product-card";
import { getSurprisePick } from "@/lib/surpriseMe";

const SurpriseMe = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const query = useQuery({
    queryKey: ["store", storeName, "surprise-me"],
    queryFn: ({ signal }) => getSurprisePick(storeName, signal),
    enabled: Boolean(storeName),
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const item = query.data?.item;
  const product: ProductCardData | null = item
    ? {
        id: item._id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        strength: item.strength,
        image: item.image,
        origin: item.location.humidorName,
        description:
          item.flavorNotes?.join(", ") ||
          [item.wrapper, item.size].filter(Boolean).join(" · "),
        badges: [{ label: "Surprise Pick", variant: "gold" }],
      }
    : null;
  const products = product ? [product] : [];

  return (
    <section
      id="surprise-me"
      className="store-section scroll-mt-20 bg-[#0F0E0D] text-white"
    >
      <div className="container">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#CBA24A]/25 bg-[#CBA24A]/10 text-[#CBA24A]">
              <Dices className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-2xl text-[#F5E7D0] sm:text-3xl">
                  Surprise Me
                </h2>
                <Sparkles className="hidden h-4 w-4 text-[#CBA24A] sm:block" />
              </div>
              <p className="mt-1 text-xs text-[#9D958B] sm:text-sm">
                A hand-picked cigar chosen just for you
              </p>
            </div>
          </div>

          {products.length > 4 && (
            <Link
              href={`/store/${encodeURIComponent(storeName)}/surprise-me`}
              className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#CBA24A] transition hover:text-[#E0B44F] sm:text-sm"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {query.isError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-10 text-center">
            <RefreshCw className="mx-auto h-7 w-7 text-red-300/80" />
            <h3 className="mt-3 font-playfair text-lg text-[#F5E7D0]">
              We couldn’t choose your surprise
            </h3>
            <p className="mt-2 text-sm text-[#D9CFC1]">
              {query.error instanceof Error
                ? query.error.message
                : "We couldn’t choose a surprise cigar."}
            </p>
            <button
              onClick={() => query.refetch()}
              className="mt-4 rounded-lg border border-[#CBA24A]/40 px-4 py-2 text-xs text-[#D7AA46] transition hover:bg-[#CBA24A]/10"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {query.isLoading && <ProductCardSkeleton />}
            {products.slice(0, 4).map((card) => (
              <ProductCard
                key={card.id}
                product={card}
                href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(card.id)}`}
              />
            ))}
            {!query.isLoading && !item && (
              <div className="col-span-full flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] p-6 text-center">
                <Dices className="h-8 w-8 text-[#CBA24A]" />
                <h3 className="mt-3 font-playfair text-lg text-[#F5E7D0]">
                  {query.data?.limitReached
                    ? "That’s all your picks for today"
                    : "No surprise is available right now"}
                </h3>
                <p className="mt-1 text-xs text-[#9D958B]">
                  {query.data?.limitReached
                    ? "Come back later for another discovery."
                    : "The humidor doesn’t have an eligible surprise pick yet."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SurpriseMe;
