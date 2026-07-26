"use client";

import { useQuery } from "@tanstack/react-query";
import { Gem } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getExclusivePicks } from "@/lib/exclusivePicks";

const MoreExclusive = () => {
  const params = useParams<{ "store-name": string; id: string }>();
  const storeName = params["store-name"];
  const currentId = params.id;
  const query = useQuery({
    queryKey: ["store", storeName, currentId, "exclusive-picks"],
    queryFn: ({ signal }) =>
      getExclusivePicks(storeName, currentId, signal),
    enabled: Boolean(storeName && currentId),
    staleTime: 60_000,
  });

  const products = query.data
    ?.filter(
      (product) =>
        product._id !== currentId &&
        product.quantity > 0 &&
        product.status === "active",
    )
    .slice(0, 3);

  if (query.isError || (!query.isLoading && !products?.length)) return null;

  return (
    <section className="store-section-gap border-t border-white/[0.07] pt-8">
      <h2 className="flex items-center gap-2 font-playfair text-lg text-[#F5E7D0] sm:text-xl">
        <Gem className="h-5 w-5 text-[#D7AA46]" strokeWidth={1.8} />
        Looking for Something More Exclusive?
      </h2>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {query.isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex h-20 animate-pulse items-center gap-3 rounded-lg border border-white/[0.09] bg-[#191715] p-3"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-1/3 rounded bg-white/[0.07]" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.07]" />
                  <div className="h-2 w-10 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))
          : products?.map((product) => (
              <Link
                key={product._id}
                href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(product._id)}`}
                className="group flex min-h-20 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#191715] p-3 transition hover:-translate-y-0.5 hover:border-[#CBA24A]/40 hover:bg-[#211E1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#321D3B] text-[#D77BFF] transition group-hover:bg-[#3A2146]">
                  <Gem className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] text-[#8F8983]">
                    {product.brand}
                  </span>
                  <span className="mt-0.5 block truncate font-playfair text-sm text-[#E8E1D8] transition group-hover:text-[#F5E7D0]">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#D7AA46]">
                    ${Number(product.price).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
};

export default MoreExclusive;
