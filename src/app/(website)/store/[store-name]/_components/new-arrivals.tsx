"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/common/product-card";
import { getNewArrivals } from "@/lib/newArrivals";

function toProductCard(item: {
  _id: string;
  name: string;
  brand: string;
  price: number;
  strength: string;
  size: string;
  image?: string;
  humidorName?: string;
  shelfName?: string;
}): ProductCardData {
  return {
    id: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    strength: item.strength,
    image: item.image,
    origin: item.humidorName,
    description: [item.size, item.shelfName].filter(Boolean).join(" · "),
    badges: [{ label: "New Arrival", variant: "blue" }],
  };
}

const NewArrivals = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const query = useQuery({
    queryKey: ["store", storeName, "new-arrivals"],
    queryFn: ({ signal }) => getNewArrivals(storeName, signal),
    enabled: Boolean(storeName),
    staleTime: 60_000,
  });

  if (!query.isLoading && !query.isError && !query.data?.data.length) return null;

  return (
    <section className="bg-[#0F0E0D] py-14 text-white sm:py-20" id="collection">
      <div className="container">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#CBA24A]/25 bg-[#CBA24A]/10 text-[#CBA24A]">
              <PackageOpen className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-2xl text-[#F5E7D0] sm:text-3xl">
                  New Arrivals
                </h2>
                <Sparkles className="hidden h-4 w-4 text-[#CBA24A] sm:block" />
              </div>
              <p className="mt-1 text-xs text-[#9D958B] sm:text-sm">
                Fresh additions to the collection
              </p>
            </div>
          </div>

          <Link
            href={`/store/${encodeURIComponent(storeName)}/new-arrivals`}
            className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#CBA24A] transition hover:text-[#E0B44F] sm:text-sm"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {query.isError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-10 text-center">
            <p className="text-sm text-[#D9CFC1]">
              {query.error instanceof Error
                ? query.error.message
                : "We couldn’t load the new arrivals."}
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
            {query.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              : query.data?.data
                  .slice(0, 4)
                  .map((item) => (
                    <ProductCard
                      key={item._id}
                      product={toProductCard(item)}
                      href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(item._id)}`}
                    />
                  ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
