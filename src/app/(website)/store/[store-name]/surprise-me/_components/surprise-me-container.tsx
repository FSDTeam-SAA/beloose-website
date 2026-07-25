"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Dices,
  MapPin,
  Package,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/common/product-card";
import { getSurprisePick } from "@/lib/surpriseMe";

const SurpriseMeContainer = () => {
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

  const limitReached = Boolean(query.data?.limitReached);

  return (
    <main className="min-h-screen bg-[#0F0E0D] text-white">
      <div className="border-b border-white/[0.07] bg-[radial-gradient(circle_at_top_left,rgba(203,162,74,0.14),transparent_38%)]">
        <div className="container py-10 sm:py-14">
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
                <Dices className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#CBA24A]">
                  Your humidor discovery <Sparkles className="h-3 w-3" />
                </p>
                <h1 className="font-playfair text-3xl text-[#F5E7D0] sm:text-4xl">
                  Surprise Me
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#9D958B]">
                  Try something unexpected. We&apos;ll reveal a hand-picked
                  cigar and tell you exactly where to find it.
                </p>
              </div>
            </div>

            {!query.isLoading && !query.isError && query.data && (
              <p className="shrink-0 text-xs text-[#9D958B]">
                <span className="font-semibold text-[#D7AA46]">
                  {query.data.triesRemaining}
                </span>{" "}
                of {query.data.maxTries} picks remaining
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container py-10 sm:py-14">
        {query.isLoading && (
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[300px_1fr]">
            <ProductCardSkeleton />
            <div className="space-y-4">
              <div className="h-7 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
              <div className="h-11 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
            </div>
          </div>
        )}

        {query.isError && (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-white/[0.09] bg-[#191715] px-6 py-14 text-center">
            <RefreshCw className="h-8 w-8 text-[#CBA24A]" />
            <h2 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              Couldn’t reveal your surprise
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#9D958B]">
              {query.error instanceof Error
                ? query.error.message
                : "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => query.refetch()}
              className="mt-5 rounded-lg bg-[#CBA24A] px-5 py-2.5 text-xs font-semibold text-[#171109] transition hover:bg-[#E0B44F]"
            >
              Try again
            </button>
          </div>
        )}

        {!query.isLoading && !query.isError && product && item && (
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[300px_1fr] md:gap-12">
            <ProductCard
              product={product}
              href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(product.id)}`}
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CBA24A]">
                Why this cigar?
              </p>
              <h2 className="mt-2 font-playfair text-2xl text-[#F5E7D0] sm:text-3xl">
                A pick worth discovering
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#B1A89D]">
                {item.whyThisCigar}
              </p>

              <div className="mt-6 grid gap-3 text-xs text-[#A49C92] sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#191715] p-4">
                  <MapPin className="h-4 w-4 shrink-0 text-[#CBA24A]" />
                  <span>
                    {[item.location.humidorName, item.location.shelfName]
                      .filter(Boolean)
                      .join(" · ") || "Ask staff for location"}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#191715] p-4">
                  <Package className="h-4 w-4 shrink-0 text-[#CBA24A]" />
                  <span>
                    {item.quantity > 0
                      ? `${item.quantity} currently available`
                      : "Currently unavailable"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => query.refetch()}
                  disabled={limitReached || query.isFetching}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#CBA24A] px-5 text-xs font-semibold text-[#171109] transition hover:bg-[#E0B44F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Dices
                    className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
                  />
                  {query.isFetching ? "Choosing..." : "Surprise me again"}
                </button>
                <p className="text-xs text-[#918A82]">
                  {query.data?.triesRemaining} of {query.data?.maxTries} picks
                  remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {!query.isLoading && !query.isError && !item && (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] px-6 py-16 text-center">
            <Dices className="h-9 w-9 text-[#CBA24A]" />
            <h2 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              {limitReached
                ? "That’s all your picks for today"
                : "No surprise available right now"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#9D958B]">
              {limitReached
                ? `You’ve used all ${query.data?.maxTries || 5} surprise picks. Come back again later.`
                : "The humidor doesn’t have an eligible surprise pick at the moment."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SurpriseMeContainer;
