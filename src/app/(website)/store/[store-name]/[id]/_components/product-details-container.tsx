"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ImageOff,
  MapPin,
  Package,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  getInventoryDetails,
  InventoryDetailsError,
} from "@/lib/inventoryDetails";
import MoreExclusive from "./more-exclusive";
import PerfectPairings from "./perfect-pairings";

const titleCase = (value: string) =>
  value
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

const ProductDetailsContainer = () => {
  const params = useParams<{ "store-name": string; id: string }>();
  const storeName = params["store-name"];
  const id = params.id;
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const query = useQuery({
    queryKey: ["inventory-details", id],
    queryFn: ({ signal }) => getInventoryDetails(id, signal),
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: (count, error) =>
      !(error instanceof InventoryDetailsError && error.status === 404) &&
      count < 2,
  });

  const shareProduct = async () => {
    const shareData = {
      title: query.data?.name || "Cigar",
      text: query.data
        ? `Take a look at ${query.data.name} from ${query.data.brand}.`
        : undefined,
      url: window.location.href,
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share this product");
    }
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

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Strength", titleCase(product.strength)],
                ["Size", product.size],
                ["Wrapper", product.wrapper],
                ["Status", titleCase(product.status)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.09] bg-[#191715] p-3">
                  <dt className="text-[10px] text-[#837C74]">{label}</dt>
                  <dd className="mt-1 text-xs text-[#E2DCD5]">{value || "Not specified"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <p className="mr-2 font-playfair text-3xl text-[#D7AA46]">
                ${Number(product.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${product.quantity > 0 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-red-500/25 bg-red-500/10 text-red-300"}`}>
                {product.quantity > 0 && <Check className="h-3.5 w-3.5" />}
                {stockLabel}
              </span>
              <button type="button" onClick={() => void shareProduct()} aria-label={`Share ${product.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.09] bg-[#2C2927] text-[#A9A095] transition hover:border-[#CBA24A]/35 hover:text-[#D7AA46]">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {product.featuredNote && (
          <section className="mt-9 rounded-2xl border border-white/[0.09] bg-[#191715] p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#CBA24A]" />
              <div>
                <h2 className="font-playfair text-lg text-[#F5E7D0]">Why You’ll Like This Cigar</h2>
                <p className="mt-2 text-sm leading-6 text-[#9D958B]">{product.featuredNote}</p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-9">
          <h2 className="flex items-center gap-2 font-playfair text-xl text-[#F5E7D0]">
            <MapPin className="h-5 w-5 text-[#CBA24A]" /> Find It on the Shelf
          </h2>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-[#191715] p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#CBA24A]/25 text-[#CBA24A]">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-[#E2DCD5]">{product.shelfName || "Ask store staff for shelf location"}</p>
              <p className="mt-1 text-xs text-[#8F8983]">Ask the tobacconist for help locating this cigar.</p>
            </div>
          </div>
        </section>

        <PerfectPairings />
        <MoreExclusive />
      </div>
    </main>
  );
};

export default ProductDetailsContainer;
