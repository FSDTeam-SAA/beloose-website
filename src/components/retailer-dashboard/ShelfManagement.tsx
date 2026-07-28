"use client";

import { getHumidors, type HumidorShelf } from "@/lib/humidors";
import { getShelfInventory, type InventoryItem } from "@/lib/inventory";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, LayoutPanelTop, MapPin, TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardState from "./DashboardState";

export default function ShelfManagement() {
  const { data: session, status } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const humidorQuery = useQuery({ queryKey: ["humidors"], queryFn: ({ signal }) => getHumidors(token!, signal), enabled: Boolean(token) });
  const inventoryQuery = useQuery({ queryKey: ["shelf-inventory"], queryFn: ({ signal }) => getShelfInventory(token!, signal), enabled: Boolean(token) });

  if (status === "loading" || humidorQuery.isLoading || inventoryQuery.isLoading || (status === "authenticated" && !token)) return <ShelfManagementSkeleton />;
  if (!token) return <DashboardState type="error" title="Couldn’t load shelves" message="Your session token is missing. Please log in again." />;
  if (humidorQuery.isError || inventoryQuery.isError) {
    const error = humidorQuery.error || inventoryQuery.error;
    return <DashboardState type="error" title="Couldn’t load shelves" message={error instanceof Error ? error.message : "Something went wrong while loading your shelves."} onRetry={() => { humidorQuery.refetch(); inventoryQuery.refetch(); }} />;
  }

  const humidors = humidorQuery.data || [];
  const inventory = inventoryQuery.data || [];
  const shelves = humidors.flatMap((humidor) => humidor.shelfes || []);
  const totalCells = shelves.reduce((total, shelf) => total + (shelf.rows || 0) * (shelf.columns || 0), 0);
  const occupiedCells = new Set(inventory.filter((item) => item.shelfRow && item.shelfColumn).map((item) => `${item.humidorId}:${item.shelfName}:${item.shelfRow}:${item.shelfColumn}`)).size;

  if (!shelves.length) return <DashboardState type="empty" title="No shelves yet" message="Add a shelf with rows and columns in Humidor Management to build your shelf map." />;

  const stats = [
    [totalCells, "Total Positions", LayoutPanelTop],
    [occupiedCells, "Occupied", CheckCircle2],
    [Math.max(0, totalCells - occupiedCells), "Available", TriangleAlert],
  ] as const;

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-5">
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">{stats.map(([value, label, Icon]) => <article className="flex h-32 items-center justify-between rounded-xl border border-[#e4cf98] bg-[#34200e] p-5" key={label}><div><strong className="block text-3xl">{value.toLocaleString()}</strong><span className="text-[11px] text-[#a48656]">{label}</span></div><Icon size={36} strokeWidth={1.3} className="text-[#f1d89a]" /></article>)}</section>
    <div className="mt-4 space-y-4">{humidors.filter((humidor) => humidor.shelfes?.length).map((humidor) => <section className="rounded-xl border border-[#76552b] bg-[#2d1a08] p-4 sm:p-5" key={humidor._id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-playfair text-lg font-semibold text-[#f2dca5]">{humidor.name}</h2><p className="mt-1 flex items-center gap-1 text-[10px] text-[#a48656]"><MapPin size={12} />{humidor.location || "Location not set"}</p></div><Link href="/retailer-dashboard/humidors" className="rounded border border-[#80602f] px-3 py-2 text-[10px] text-[#d5a744] no-underline transition hover:bg-[#513719] hover:no-underline">Manage shelf grids</Link></div>
      <div className="mt-4 space-y-4">{humidor.shelfes.map((shelf) => <ShelfGrid key={shelf._id} shelf={shelf} inventory={inventory.filter((item) => item.humidorId === humidor._id && item.shelfName === shelf.name)} />)}</div>
    </section>)}</div>
  </div>;
}

function ShelfGrid({ shelf, inventory }: { shelf: HumidorShelf; inventory: InventoryItem[] }) {
  if (!shelf.rows || !shelf.columns) return <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"><h3 className="text-sm text-[#ead8ae]">{shelf.name}</h3><p className="mt-1 text-[10px] text-amber-200">Grid not configured. Set rows and columns in Humidor Management.</p></div>;
  const cells = Array.from({ length: shelf.rows * shelf.columns }, (_, index) => {
    const row = Math.floor(index / shelf.columns) + 1;
    const column = (index % shelf.columns) + 1;
    return { row, column, item: inventory.find((value) => value.shelfRow === row && value.shelfColumn === column) };
  });
  return <article className="rounded-lg border border-[#80602f] bg-[#34200e] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold text-[#ead8ae]">{shelf.name}</h3>{shelf.description && <p className="mt-1 text-[9px] text-[#a48656]">{shelf.description}</p>}</div><span className="rounded bg-[#513719] px-2.5 py-1 text-[9px] text-[#d5a744]">{shelf.rows} rows × {shelf.columns} columns</span></div>
    <div className="dashboard-scrollbar mt-3 overflow-x-auto"><div className="grid min-w-max gap-2" style={{ gridTemplateColumns: `repeat(${shelf.columns}, minmax(76px, 1fr))` }}>{cells.map(({ row, column, item }) => <div key={`${row}-${column}`} title={item?.name || `Row ${row}, Column ${column}`} className={`min-h-16 rounded border p-2 ${item ? "border-emerald-500/40 bg-emerald-500/10" : "border-[#674d2a] bg-[#2d1a08]"}`}><span className="block text-[8px] text-[#a98b5c]">R{row} · C{column}</span><strong className={`mt-1 block line-clamp-2 text-[9px] ${item ? "text-emerald-200" : "text-[#806944]"}`}>{item?.name || "Available"}</strong></div>)}</div></div>
  </article>;
}

function ShelfManagementSkeleton() {
  return <div className="min-h-[calc(100vh-72px)] animate-pulse bg-[#3b2918] p-3 sm:p-5"><div className="grid gap-3 md:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-32 rounded-xl border border-[#76552b] bg-[#34200e]" key={item} />)}</div><div className="mt-4 h-80 rounded-xl border border-[#76552b] bg-[#2d1a08]" /></div>;
}
