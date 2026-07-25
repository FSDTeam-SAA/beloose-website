"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageOpen,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import ProductCard, {
  ProductCardSkeleton,
  type ProductBadge,
  type ProductCardData,
} from "@/components/common/product-card";
import {
  getStoreInventory,
  type StoreInventoryFilters,
  type StoreInventoryItem,
} from "@/lib/storeInventory";

const PAGE_SIZE = 12;
const FACET_LIMIT = 500;

type FilterKey = "strength" | "brand" | "wrapper" | "size";

const filterLabels: Record<FilterKey, string> = {
  strength: "Strength",
  brand: "Brand",
  wrapper: "Wrapper",
  size: "Size",
};

function productBadges(item: StoreInventoryItem): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (item.isStaffPick) badges.push({ label: "Staff Pick", variant: "gold" });
  if (item.isNewArrival)
    badges.push({ label: "New Arrival", variant: "blue" });
  if (item.isDailyFeatured)
    badges.push({ label: "Daily Featured", variant: "gold" });
  return badges;
}

function toProductCard(item: StoreInventoryItem): ProductCardData {
  return {
    id: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    strength: item.strength,
    image: item.image,
    origin: item.wrapper,
    description:
      [item.size, item.shelfName].filter(Boolean).join(" · ") ||
      item.description,
    badges: productBadges(item),
  };
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const end = Math.min(totalPages, Math.max(currentPage + 1, 3));
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

const AllProductsContainer = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StoreInventoryFilters>({});
  const deferredSearch = useDeferredValue(search.trim());
  const appliedFilters = { ...filters, searchTerm: deferredSearch };
  const query = useQuery({
    queryKey: [
      "store",
      storeName,
      "inventory-list",
      page,
      PAGE_SIZE,
      appliedFilters,
    ],
    queryFn: ({ signal }) =>
      getStoreInventory(
        storeName,
        page,
        PAGE_SIZE,
        signal,
        appliedFilters,
      ),
    enabled: Boolean(storeName),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  const facetsQuery = useQuery({
    queryKey: ["store", storeName, "inventory-filter-options"],
    queryFn: ({ signal }) =>
      getStoreInventory(storeName, 1, FACET_LIMIT, signal),
    enabled: Boolean(storeName),
    staleTime: 5 * 60_000,
  });

  const items = query.data?.items || [];
  const filterOptions = useMemo(
    () =>
      (["strength", "brand", "wrapper", "size"] as FilterKey[]).reduce(
        (options, key) => {
          options[key] = Array.from(
            new Set(
              (facetsQuery.data?.items || [])
                .map((item) => item[key]?.trim())
                .filter(Boolean) as string[],
            ),
          ).sort((a, b) => a.localeCompare(b));
          return options;
        },
        {} as Record<FilterKey, string[]>,
      ),
    [facetsQuery.data?.items],
  );
  const activeFilterCount =
    (deferredSearch ? 1 : 0) +
    (["strength", "brand", "wrapper", "size"] as FilterKey[]).filter(
      (key) => filters[key],
    ).length;
  const meta = query.data?.meta;
  const total = meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / (meta?.limit || PAGE_SIZE)));
  const currentPage = Math.min(page, totalPages);
  const startItem = total ? (currentPage - 1) * (meta?.limit || PAGE_SIZE) + 1 : 0;
  const endItem = Math.min(currentPage * (meta?.limit || PAGE_SIZE), total);

  const changePage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));
    if (safePage === page) return;
    setPage(safePage);
    window.requestAnimationFrame(() =>
      document.getElementById("all-products-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };

  const updateFilter = (key: FilterKey, value: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    setPage(1);
  };

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
                <PackageOpen className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#CBA24A]">
                  Explore the humidor
                </p>
                <h1 className="font-playfair text-3xl text-[#F5E7D0] sm:text-4xl">
                  All Products
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#9D958B]">
                  Browse every cigar currently available in this store&apos;s
                  collection.
                </p>
              </div>
            </div>

            {!query.isLoading && !query.isError && (
              <p className="text-xs text-[#9D958B]">
                <span className="font-semibold text-[#D7AA46]">{total}</span>{" "}
                {total === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container py-10 sm:py-14">
        <section aria-label="Search and filter products" className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">
                Search products by name, brand, or description
              </span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#837B72]" />
              <input
                // type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, brand, or description..."
                className="h-12 w-full rounded-xl border border-white/[0.1] bg-[#191715] pl-11 pr-10 text-sm text-[#F5E7D0] outline-none transition placeholder:text-[#777068] focus:border-[#CBA24A]/60 focus:ring-2 focus:ring-[#CBA24A]/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#837B72] transition hover:bg-white/[0.06] hover:text-[#F5E7D0]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="product-filters"
              onClick={() => setShowFilters((visible) => !visible)}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-medium transition ${
                showFilters || activeFilterCount
                  ? "border-[#CBA24A]/55 bg-[#CBA24A]/10 text-[#E1B957]"
                  : "border-white/[0.1] bg-[#191715] text-[#AAA299] hover:border-[#CBA24A]/35 hover:text-[#D7AA46]"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#CBA24A] px-1 text-[10px] font-bold text-[#171109]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div
              id="product-filters"
              className="mt-3 rounded-xl border border-white/[0.1] bg-[#191715] p-4 sm:p-5"
            >
              {facetsQuery.isLoading && (
                <p className="text-xs text-[#8F877E]">
                  Loading filter options...
                </p>
              )}
              {facetsQuery.isError && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-[#A69D93]">
                    Filter options couldn’t be loaded.
                  </p>
                  <button
                    type="button"
                    onClick={() => facetsQuery.refetch()}
                    className="text-xs font-medium text-[#D7AA46] transition hover:text-[#E7C270]"
                  >
                    Try again
                  </button>
                </div>
              )}
              <div className="space-y-5">
                {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
                  const options = filterOptions[key];
                  if (!options.length) return null;
                  return (
                    <fieldset key={key}>
                      <legend className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#837B72]">
                        {filterLabels[key]}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPage(1);
                            setFilters((current) => ({
                              ...current,
                              [key]: undefined,
                            }));
                          }}
                          className={`rounded-full px-3 py-1.5 text-[10px] transition ${
                            !filters[key]
                              ? "bg-[#CBA24A] font-semibold text-[#171109]"
                              : "bg-white/[0.06] text-[#9D958B] hover:bg-white/[0.1] hover:text-[#E4D8C8]"
                          }`}
                        >
                          All
                        </button>
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={filters[key] === option}
                            onClick={() => updateFilter(key, option)}
                            className={`rounded-full px-3 py-1.5 text-[10px] capitalize transition ${
                              filters[key] === option
                                ? "bg-[#CBA24A] font-semibold text-[#171109]"
                                : "bg-white/[0.06] text-[#9D958B] hover:bg-white/[0.1] hover:text-[#E4D8C8]"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-5 flex justify-end border-t border-white/[0.07] pt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#B7AEA3] transition hover:text-[#E1B957]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

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
              Couldn’t load the collection
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

        {!query.isLoading && !query.isError && !items.length && (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-[#CBA24A]/25 bg-[#CBA24A]/[0.04] px-6 py-16 text-center">
            <PackageOpen className="h-9 w-9 text-[#CBA24A]" />
            <h2 className="mt-4 font-playfair text-xl text-[#F5E7D0]">
              {activeFilterCount
                ? "No matching products"
                : "No products available"}
            </h2>
            <p className="mt-2 text-sm text-[#9D958B]">
              {activeFilterCount
                ? "Try another search term or clear a filter to see more products."
                : "This store’s collection will appear here once inventory is added."}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-[#CBA24A] px-5 py-2.5 text-xs font-semibold text-[#171109] transition hover:bg-[#E0B44F]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!query.isLoading && !query.isError && items.length > 0 && (
          <>
            <div
              id="all-products-grid"
              className={`scroll-mt-6 grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                query.isFetching ? "opacity-55" : "opacity-100"
              }`}
              aria-busy={query.isFetching}
            >
              {items.map((item) => (
                <ProductCard
                  key={item._id}
                  product={toProductCard(item)}
                  href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(item._id)}`}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-white/[0.07] pt-7 sm:flex-row">
              <p className="text-xs text-[#918A82]">
                Showing{" "}
                <span className="text-[#D0C6B9]">
                  {startItem}–{endItem}
                </span>{" "}
                of <span className="text-[#D0C6B9]">{total}</span> products
              </p>

              {totalPages > 1 && (
                <nav
                  className="flex items-center gap-2"
                  aria-label="Product pages"
                >
                  <button
                    type="button"
                    disabled={currentPage === 1 || query.isFetching}
                    onClick={() => changePage(currentPage - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/[0.1] px-3 text-xs text-[#B2AAA0] transition hover:border-[#CBA24A]/40 hover:text-[#D7AA46] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {getPageNumbers(currentPage, totalPages).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      disabled={query.isFetching}
                      aria-current={
                        pageNumber === currentPage ? "page" : undefined
                      }
                      onClick={() => changePage(pageNumber)}
                      className={`h-9 min-w-9 rounded-lg px-2 text-xs font-medium transition ${
                        pageNumber === currentPage
                          ? "bg-[#CBA24A] text-[#171109]"
                          : "border border-white/[0.1] text-[#B2AAA0] hover:border-[#CBA24A]/40 hover:text-[#D7AA46]"
                      } disabled:cursor-not-allowed`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages || query.isFetching
                    }
                    onClick={() => changePage(currentPage + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/[0.1] px-3 text-xs text-[#B2AAA0] transition hover:border-[#CBA24A]/40 hover:text-[#D7AA46] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AllProductsContainer;
