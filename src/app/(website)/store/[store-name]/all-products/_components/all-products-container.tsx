"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
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
import { CIGAR_STRENGTH_OPTIONS, CIGAR_WRAPPER_OPTIONS } from "@/lib/cigarOptions";

const PAGE_SIZE = 8;
const FACET_LIMIT = 500;

type FilterKey = "strength" | "brand" | "wrapper" | "size";

const STRENGTH_OPTIONS = CIGAR_STRENGTH_OPTIONS.map(option => option.value);
const STRENGTH_LABELS = Object.fromEntries(CIGAR_STRENGTH_OPTIONS.map(option => [option.value, option.title]));
const WRAPPER_OPTIONS = CIGAR_WRAPPER_OPTIONS.map(option => option.value);

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
      [item.size, item.wallName, item.shelfName, item.shelfColumn ? `C${item.shelfColumn}` : undefined].filter(Boolean).join(" · ") ||
      item.description,
    badges: productBadges(item),
  };
}

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2) items.push("start-ellipsis");
  for (let pageNumber = rangeStart; pageNumber <= rangeEnd; pageNumber += 1) {
    items.push(pageNumber);
  }
  if (rangeEnd < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);

  return items;
}

const AllProductsContainer = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StoreInventoryFilters>({});
  const deferredSearch = useDeferredValue(search.trim());
  const deferredFilters = useDeferredValue(filters);
  const appliedFilters = { ...deferredFilters, searchTerm: deferredSearch };
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
    () => {
      const options = (["brand", "size"] as FilterKey[]).reduce(
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
      );
      options.strength = STRENGTH_OPTIONS;
      options.wrapper = WRAPPER_OPTIONS;
      return options;
    },
    [facetsQuery.data?.items],
  );
  const priceBounds = useMemo(() => {
    const prices = (facetsQuery.data?.items || [])
      .map((item) => Number(item.price))
      .filter((price) => Number.isFinite(price) && price >= 0);
    if (!prices.length) return { min: 0, max: 100 };
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max: Math.max(min + 1, max) };
  }, [facetsQuery.data?.items]);
  const selectedMinPrice = filters.minPrice ?? priceBounds.min;
  const selectedMaxPrice = filters.maxPrice ?? priceBounds.max;
  const priceFilterActive =
    filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const activeFilterCount =
    (deferredSearch ? 1 : 0) +
    (["strength", "brand", "wrapper", "size"] as FilterKey[]).filter(
      (key) => filters[key],
    ).length +
    (priceFilterActive ? 1 : 0);
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
      [key]: value || undefined,
    }));
  };

  const updatePrice = (key: "minPrice" | "maxPrice", value: number) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]:
        (key === "minPrice" && value <= priceBounds.min) ||
        (key === "maxPrice" && value >= priceBounds.max)
          ? undefined
          : value,
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

      <div className="store-page-section container">
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
              className={`group inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-medium transition-all duration-300 ${
                showFilters || activeFilterCount
                  ? "border-[#CBA24A]/55 bg-[#CBA24A]/10 text-[#E1B957] shadow-[0_8px_24px_rgba(203,162,74,0.1)]"
                  : "border-white/[0.1] bg-[#191715] text-[#AAA299] hover:border-[#CBA24A]/35 hover:text-[#D7AA46]"
              }`}
            >
              <Filter
                className={`h-4 w-4 transition-transform duration-300 ${
                  showFilters ? "rotate-[-12deg] scale-110" : ""
                }`}
              />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#CBA24A] px-1 text-[10px] font-bold text-[#171109] shadow-[0_0_14px_rgba(203,162,74,0.35)]">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div
            aria-hidden={!showFilters}
            inert={showFilters ? undefined : true}
            className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out motion-reduce:transition-none ${
              showFilters
                ? "mt-3 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
            <div
              id="product-filters"
              className={`relative overflow-hidden rounded-xl border border-white/[0.1] bg-[radial-gradient(circle_at_top_right,rgba(203,162,74,0.08),transparent_34%),#191715] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-transform duration-300 before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#CBA24A]/55 before:to-transparent sm:p-5 ${
                showFilters ? "translate-y-0" : "-translate-y-2"
              }`}
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
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
                    const options = filterOptions[key];
                    if (!options.length) return null;
                    return (
                      <label key={key} className="block">
                        <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#8F877E]">
                          {filterLabels[key]}
                        </span>
                        <span className="relative block">
                          <select
                            value={filters[key] || ""}
                            onChange={(event) =>
                              updateFilter(key, event.target.value)
                            }
                            className="h-11 w-full appearance-none rounded-lg border border-white/[0.1] bg-[#211E1B] px-3 pr-9 text-xs text-[#E8DED2] outline-none transition hover:border-[#CBA24A]/30 focus:border-[#CBA24A]/60 focus:ring-2 focus:ring-[#CBA24A]/10"
                          >
                            <option value="">All {filterLabels[key]}</option>
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {key === "strength"
                                  ? STRENGTH_LABELS[option] || option
                                  : option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#817970]"
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>

                <fieldset className="rounded-xl border border-white/[0.08] bg-[#211E1B]/70 p-4">
                  <legend className="px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8F877E]">
                    Price range
                  </legend>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="inline-flex items-center text-sm font-semibold text-[#F5E7D0]">
                      <DollarSign className="h-3.5 w-3.5 text-[#CBA24A]" />
                      {selectedMinPrice.toLocaleString()}
                    </p>
                    <span className="h-px flex-1 bg-white/[0.1]" />
                    <p className="inline-flex items-center text-sm font-semibold text-[#F5E7D0]">
                      <DollarSign className="h-3.5 w-3.5 text-[#CBA24A]" />
                      {selectedMaxPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="relative mt-5 h-5">
                    <div className="absolute left-0 right-0 top-2 h-1 rounded-full bg-white/[0.12]" />
                    <div
                      className="absolute top-2 h-1 rounded-full bg-[#CBA24A]"
                      style={{
                        left: `${
                          ((selectedMinPrice - priceBounds.min) /
                            (priceBounds.max - priceBounds.min)) *
                          100
                        }%`,
                        right: `${
                          100 -
                          ((selectedMaxPrice - priceBounds.min) /
                            (priceBounds.max - priceBounds.min)) *
                            100
                        }%`,
                      }}
                    />
                    <input
                      type="range"
                      aria-label="Minimum price"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={selectedMinPrice}
                      onChange={(event) =>
                        updatePrice(
                          "minPrice",
                          Math.min(
                            Number(event.target.value),
                            selectedMaxPrice - 1,
                          ),
                        )
                      }
                      className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171411] [&::-moz-range-thumb]:bg-[#D7AA46] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171411] [&::-webkit-slider-thumb]:bg-[#D7AA46]"
                    />
                    <input
                      type="range"
                      aria-label="Maximum price"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={selectedMaxPrice}
                      onChange={(event) =>
                        updatePrice(
                          "maxPrice",
                          Math.max(
                            Number(event.target.value),
                            selectedMinPrice + 1,
                          ),
                        )
                      }
                      className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171411] [&::-moz-range-thumb]:bg-[#D7AA46] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171411] [&::-webkit-slider-thumb]:bg-[#D7AA46]"
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-[#746E67]">
                    <span>${priceBounds.min.toLocaleString()}</span>
                    <span>${priceBounds.max.toLocaleString()}</span>
                  </div>
                </fieldset>
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
            </div>
          </div>
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

            {total > PAGE_SIZE && (
            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-xl border border-white/[0.08] bg-[#191715]/70 px-4 py-4 sm:flex-row sm:px-5">
              <div className="text-center sm:text-left">
                <p className="text-xs text-[#918A82]">
                  Showing{" "}
                  <span className="font-medium text-[#D0C6B9]">
                    {startItem}–{endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#D0C6B9]">{total}</span>{" "}
                  products
                </p>
                {totalPages > 1 && (
                  <p className="mt-1 text-[10px] text-[#746E67]">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <nav
                  className="flex max-w-full items-center gap-1.5"
                  aria-label="Product pages"
                >
                  <button
                    type="button"
                    disabled={currentPage === 1 || query.isFetching}
                    onClick={() => changePage(currentPage - 1)}
                    aria-label="Go to previous page"
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/[0.1] px-3 text-xs text-[#B2AAA0] transition hover:border-[#CBA24A]/40 hover:bg-[#CBA24A]/[0.06] hover:text-[#D7AA46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]/50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="hidden items-center gap-1.5 sm:flex">
                    {getPaginationItems(currentPage, totalPages).map((item) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          type="button"
                          disabled={query.isFetching || item === currentPage}
                          aria-current={
                            item === currentPage ? "page" : undefined
                          }
                          aria-label={`Go to page ${item}`}
                          onClick={() => changePage(item)}
                          className={`h-10 min-w-10 rounded-lg px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]/50 ${
                            item === currentPage
                              ? "bg-[#CBA24A] text-[#171109] shadow-[0_5px_16px_rgba(203,162,74,0.18)]"
                              : "border border-white/[0.1] text-[#B2AAA0] hover:border-[#CBA24A]/40 hover:bg-[#CBA24A]/[0.06] hover:text-[#D7AA46]"
                          } disabled:cursor-not-allowed`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span
                          key={item}
                          aria-hidden="true"
                          className="grid h-10 min-w-6 place-items-center text-xs text-[#746E67]"
                        >
                          …
                        </span>
                      ),
                    )}
                  </div>

                  <span className="min-w-16 text-center text-xs font-medium text-[#D0C6B9] sm:hidden">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages || query.isFetching
                    }
                    onClick={() => changePage(currentPage + 1)}
                    aria-label="Go to next page"
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/[0.1] px-3 text-xs text-[#B2AAA0] transition hover:border-[#CBA24A]/40 hover:bg-[#CBA24A]/[0.06] hover:text-[#D7AA46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]/50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AllProductsContainer;
