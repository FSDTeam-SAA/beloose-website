"use client";

import { Skeleton } from "@/components/ui/skeleton";
import CigarImage from "@/components/common/cigar-image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchCustomerInventory, type CustomerSearchFilters, type CustomerSearchItem } from "@/lib/customerSearch";
import { CIGAR_STRENGTH_OPTIONS } from "@/lib/cigarOptions";
import { getMyRetailer } from "@/lib/retailer";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Compass, Filter, PackageSearch, Search, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDeferredValue, useState } from "react";
import DashboardState from "./DashboardState";

const inputClass = "h-10 w-full rounded border border-[#76552b] bg-[#2d1a08] px-3 text-xs text-[#eadcb9] outline-none placeholder:text-[#806944] focus:border-[#d2a13d]";

export default function CustomerSearch() {
  const { data: session, status } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const [filters, setFilters] = useState<CustomerSearchFilters>({ page: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const deferredSearch = useDeferredValue(filters.searchTerm || "");
  const appliedFilters = { ...filters, searchTerm: deferredSearch };
  const query = useQuery({ queryKey: ["customer-search", appliedFilters], queryFn: ({ signal }) => searchCustomerInventory(token!, appliedFilters, signal), enabled: Boolean(token), placeholderData: previous => previous });
  const retailerQuery = useQuery({ queryKey: ["retailer", "me"], queryFn: ({ signal }) => getMyRetailer(token!, signal), enabled: Boolean(token), staleTime: 5 * 60 * 1000 });

  if (status === "loading" || query.isLoading || retailerQuery.isLoading || (status === "authenticated" && !token)) return <SearchSkeleton/>;
  if (!token) return <DashboardState type="error" title="Couldn’t search inventory" message="Your session token is missing. Please log in again."/>;
  if (query.isError) return <DashboardState type="error" title="Couldn’t search inventory" message={query.error instanceof Error ? query.error.message : "Something went wrong while searching inventory."} onRetry={() => query.refetch()}/>;
  if (retailerQuery.isError || !retailerQuery.data) return <DashboardState type="error" title="Couldn’t open store products" message={retailerQuery.error instanceof Error ? retailerQuery.error.message : "Your store details could not be loaded."} onRetry={() => retailerQuery.refetch()}/>;
  const result = query.data;
  const storeName = retailerQuery.data.storeSlug || retailerQuery.data.storeName;
  const pageCount = Math.max(1, Math.ceil((result?.meta.total || 0) / (result?.meta.limit || 10)));
  const update = (field: keyof CustomerSearchFilters, value: string | boolean) => setFilters(current => ({ ...current, [field]: value, page: 1 }));
  const clearFilters = () => setFilters({ searchTerm: filters.searchTerm, page: 1 });

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
    <div className="flex items-start gap-3 rounded-lg border border-[#76552b] bg-[#34200e] p-4"><Compass size={19} className="mt-0.5 shrink-0 text-[#d5a744]"/><p className="text-[11px] leading-relaxed text-[#a98b5c]">Search by product name or brand. Use API-supported filters for strength, size, price, and current stock availability. Results include the exact humidor and shelf location.</p></div>

    <div className="mt-4 flex gap-2"><label className="relative flex-1"><span className="sr-only">Search inventory by name or brand</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a98b5c]" size={18}/><input value={filters.searchTerm || ""} onChange={event => update("searchTerm", event.target.value)} className="h-14 w-full rounded-lg border border-[#76552b] bg-[#2d1a08] pl-12 pr-4 text-sm text-[#eadcb9] outline-none placeholder:text-[#8d7651] focus:border-[#d2a13d]" placeholder="Search by product name or brand..."/></label><button type="button" aria-expanded={showFilters} onClick={() => setShowFilters(value => !value)} className={`flex h-14 items-center gap-2 rounded-lg border px-4 text-xs transition ${showFilters ? "border-[#d2a13d] bg-[#513719] text-[#f3dda4]" : "border-[#76552b] bg-[#2d1a08] text-[#a98b5c] hover:text-[#f3dda4]"}`}><Filter size={17}/>Filters</button></div>

    {showFilters && <section className="mt-3 rounded-lg border border-[#76552b] bg-[#34200e] p-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><div className="text-[11px]"><span className="mb-1.5 block">Strength</span><Select value={filters.strength || "any"} onValueChange={value => update("strength", value === "any" ? "" : value)}><SelectTrigger aria-label="Strength" className={`${inputClass} shadow-none`}><SelectValue /></SelectTrigger><SelectContent className="border-[#76552b] bg-[#2d1a08] text-[#eadcb9]"><SelectItem className="focus:bg-[#513719] focus:text-[#f3dda4]" value="any">Any strength</SelectItem>{CIGAR_STRENGTH_OPTIONS.map(option => <SelectItem key={option.value} className="focus:bg-[#513719] focus:text-[#f3dda4]" value={option.value}>{option.title}</SelectItem>)}</SelectContent></Select></div><Field label="Size" value={filters.size || ""} onChange={value => update("size", value)} placeholder="e.g. Toro"/><Field label="Minimum Price" value={filters.minPrice || ""} onChange={value => update("minPrice", value)} placeholder="0" type="number"/><Field label="Maximum Price" value={filters.maxPrice || ""} onChange={value => update("maxPrice", value)} placeholder="100" type="number"/><label className="flex h-[62px] items-end"><span className="flex h-10 w-full items-center gap-2 rounded border border-[#76552b] bg-[#2d1a08] px-3 text-[11px]"><input type="checkbox" checked={Boolean(filters.inStockOnly)} onChange={event => update("inStockOnly", event.target.checked)} className="accent-[#d2a13d]"/>In-stock only</span></label></div><button type="button" onClick={clearFilters} className="mt-3 flex items-center gap-1 text-[10px] text-[#d2a13d]"><X size={13}/>Clear filters</button></section>}

    <div className="mt-5 flex items-center justify-between"><p className="text-[10px] text-[#8d7651]">{result?.meta.total || 0} result{result?.meta.total === 1 ? "" : "s"}</p>{query.isFetching && <span className="text-[10px] text-[#d2a13d]">Updating…</span>}</div>
    {result?.data.length ? <section className="mt-2 space-y-3">{result.data.map(item => <SearchResultCard key={item._id} item={item} storeName={storeName}/>)}</section> : <div className="mt-2 flex min-h-64 flex-col items-center justify-center rounded-lg border border-[#76552b] bg-[#2d1a08] px-5 text-center"><PackageSearch size={28} className="text-[#d5a744]"/><h3 className="mt-3 font-playfair text-lg">No matching cigars</h3><p className="mt-1 text-[11px] text-[#8d7651]">Try a different name, brand, or filter combination.</p></div>}

    {pageCount > 1 && <nav aria-label="Search result pages" className="mt-5 flex items-center justify-center gap-3"><button type="button" disabled={(filters.page || 1) <= 1} onClick={() => setFilters(current => ({ ...current, page: Math.max(1, (current.page || 1) - 1) }))} className="h-9 rounded border border-[#76552b] px-4 text-[10px] disabled:opacity-40">Previous</button><span className="text-[10px] text-[#a98b5c]">Page {filters.page || 1} of {pageCount}</span><button type="button" disabled={(filters.page || 1) >= pageCount} onClick={() => setFilters(current => ({ ...current, page: Math.min(pageCount, (current.page || 1) + 1) }))} className="h-9 rounded border border-[#76552b] px-4 text-[10px] disabled:opacity-40">Next</button></nav>}
  </div>;
}

function SearchResultCard({ item, storeName }: { item: CustomerSearchItem; storeName: string }) { return <Link href={`/store/${encodeURIComponent(storeName)}/${encodeURIComponent(item._id)}`} className="group flex w-full items-center gap-3 rounded-lg border border-[#76552b] bg-[#2d1a08] p-3 text-left no-underline transition hover:border-[#b98c3c] hover:bg-[#34200e] hover:no-underline sm:p-4"><span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-[#513719]"><CigarImage src={item.image} alt={item.name || "Cigar"} fill sizes="56px" className="object-cover"/></span><span className="min-w-0 flex-1"><small className="block truncate text-[9px] uppercase tracking-wider text-[#8d7651]">{item.brand || "Brand not set"}</small><strong className="mt-0.5 block truncate font-playfair text-sm font-medium text-[#ead8ae]">{item.name || "Unnamed cigar"}</strong><span className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-[#8d7651]">{item.strength && <em className="rounded-full border border-[#9d6d18] bg-[#5a3d10] px-2 py-0.5 not-italic capitalize text-[#efbd43]">{item.strength}</em>}{item.wrapper && <span>{item.wrapper}</span>}{item.size && <><i>·</i><span>{item.size}</span></>}</span></span><span className="shrink-0 text-right"><strong className="block text-sm text-[#d5a744]">{formatPrice(item.price)}</strong><span className={`mt-1 block text-[9px] ${item.inStock ? "text-emerald-400" : "text-red-400"}`}>{item.inStock ? `${item.quantity} in stock` : "Out of stock"}</span><span className="mt-0.5 hidden text-[9px] text-[#a98b5c] sm:block">{[item.humidorName, item.wallName, item.shelfName, item.shelfColumn ? `C${item.shelfColumn}` : undefined].filter(Boolean).join(" · ") || "Location not set"}</span></span><ArrowRight size={17} className="shrink-0 text-[#8d7651] transition group-hover:translate-x-1 group-hover:text-[#d5a744]"/></Link>; }
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label className="text-[11px]"><span className="mb-1.5 block">{label}</span><input type={type} min={type === "number" ? 0 : undefined} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={inputClass}/></label>; }
function formatPrice(price?: number) { return typeof price === "number" ? `$${price.toFixed(2)}` : "—"; }
function SearchSkeleton() { return <div className="space-y-4 p-3 sm:p-4" aria-label="Loading customer search"><Skeleton className="h-14 w-80 max-w-full bg-[#513719]"/><Skeleton className="h-20 bg-[#513719]"/><Skeleton className="h-14 bg-[#513719]"/>{[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-24 bg-[#513719]"/>)}</div>; }
