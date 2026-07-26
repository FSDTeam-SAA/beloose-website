"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageOpen, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/common/product-card";
import {
  getRelatedCigars,
  type RelatedCigar,
} from "@/lib/relatedCigars";

const toProductCard = (item: RelatedCigar): ProductCardData => ({
  id: item._id,
  name: item.name,
  brand: item.brand,
  price: item.price,
  strength: item.strength,
  image: item.image,
  description: [item.size, item.wrapper].filter(Boolean).join(" · "),
});

const SimilarCigars = () => {
  const params = useParams<{ "store-name": string; id: string }>();
  const storeName = params["store-name"];
  const inventoryId = params.id;
  const query = useQuery({
    queryKey: ["store", storeName, inventoryId, "related-cigars"],
    queryFn: ({ signal }) =>
      getRelatedCigars(storeName, inventoryId, signal),
    enabled: Boolean(storeName && inventoryId),
    staleTime: 60_000,
  });

  const cigars =
    query.data?.similarCigars.filter(
      (item) =>
        item._id !== inventoryId &&
        item.quantity > 0 &&
        item.status === "active",
    ) || [];

  return (
    <section className="store-section-gap" aria-labelledby="similar-cigars-title">
      <div className="mb-5">
        <h2
          id="similar-cigars-title"
          className="font-playfair text-xl text-[#F5E7D0] sm:text-2xl"
        >
          Similar Cigars
        </h2>
        <p className="mt-1 text-sm text-[#9D958B]">
          More cigars selected to match this one.
        </p>
      </div>

      {query.isLoading ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Loading similar cigars"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-10 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-red-300/80" />
          <h3 className="mt-3 font-playfair text-lg text-[#F5E7D0]">
            Couldn’t load similar cigars
          </h3>
          <p className="mt-2 text-sm text-[#B8AEA3]">
            {query.error instanceof Error
              ? query.error.message
              : "Something went wrong. Please try again."}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-4 rounded-lg border border-[#CBA24A]/40 px-4 py-2 text-xs text-[#D7AA46] transition hover:bg-[#CBA24A]/10"
          >
            Try again
          </button>
        </div>
      ) : cigars.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cigars.map((cigar) => (
            <ProductCard
              key={cigar._id}
              product={toProductCard(cigar)}
              href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(cigar._id)}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] px-6 py-10 text-center">
          <PackageOpen className="h-9 w-9 text-[#CBA24A]" />
          <h3 className="mt-3 font-playfair text-lg text-[#F5E7D0]">
            No similar cigars found
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#9D958B]">
            We don’t have a close match for this cigar right now. Check back
            again as the store’s collection changes.
          </p>
        </div>
      )}
    </section>
  );
};

export default SimilarCigars;
