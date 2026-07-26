"use client";

import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/common/product-card";
import { useFavorites } from "@/hooks/use-favorites";

const FavoriteProduct = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const favorites = useFavorites(storeName);

  return (
    <section className="bg-[#0F0E0D] py-14 text-white sm:py-20">
      <div className="container">
        <div className="mb-7 sm:mb-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CBA24A]">
            Your collection
          </p>
          <h2 className="mt-2 font-playfair text-2xl text-[#F5E7D0] sm:text-3xl">
            Saved Cigars
          </h2>
          <p className="mt-1 text-sm text-[#9D958B]">
            Favorites saved on this browser for this store.
          </p>
        </div>

        {!favorites.isReady ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : favorites.favorites.length ? (
          <>
            <p className="mb-5 text-xs text-[#918A82]" aria-live="polite">
              {favorites.favorites.length} saved{" "}
              {favorites.favorites.length === 1 ? "cigar" : "cigars"}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {favorites.favorites.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite
                  onFavoriteChange={(item, favorite) =>
                    favorites.setFavorite(item, favorite)
                  }
                  href={`${storePath}/${encodeURIComponent(product.id)}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#CBA24A]/25 bg-[#CBA24A]/10 text-[#CBA24A]">
              <Heart className="h-7 w-7" strokeWidth={1.7} />
            </span>
            <h3 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              No favorites yet
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#9D958B]">
              Tap the heart on any cigar to save it here for your next visit.
            </p>
            <Link
              href={`${storePath}/all-products`}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D5AB48] px-5 text-xs font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2]"
            >
              Browse cigars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FavoriteProduct;
