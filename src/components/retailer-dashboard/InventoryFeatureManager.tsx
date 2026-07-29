"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CigarImage from "@/components/common/cigar-image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearTodayFeatured, getActiveFeatureItems, getFeatureInventory, removeFeature, saveFeature, type DailyFeaturedInput, type FeatureInput, type FeatureInventoryItem, type FeatureKind, type NewArrivalInput, type StaffPickInput } from "@/lib/inventoryFeatures";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, PackageOpen, Pencil, TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import DashboardState from "./DashboardState";
import FeatureManagementSkeleton from "./FeatureManagementSkeleton";

type Modal = { type: "add" | "edit" | "remove"; item: FeatureInventoryItem } | { type: "clear" } | null;
type Config = { heading: string; activeLabel: string };

const configs: Record<FeatureKind, Config> = {
  "staff-picks": { heading: "Staff Picks", activeLabel: "Staff Pick" },
  "new-arrivals": { heading: "New Arrivals", activeLabel: "New Arrival" },
  "daily-featured": { heading: "Daily Featured", activeLabel: "Featured" },
};
const inputClass = "h-10 w-full rounded border border-[#9c7b49] bg-[#68462f] px-3 text-xs text-[#eadcb9] outline-none placeholder:text-[#bca37b] focus:border-[#d1a23f]";

export default function InventoryFeatureManager({ kind }: { kind: FeatureKind }) {
  const { data: session, status } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Modal>(null);
  const queryClient = useQueryClient();
  const inventoryQuery = useQuery({ queryKey: ["feature-inventory", page], queryFn: ({ signal }) => getFeatureInventory(token!, page, signal), enabled: Boolean(token) });
  const activeQuery = useQuery({ queryKey: ["inventory-feature", kind], queryFn: ({ signal }) => getActiveFeatureItems(token!, kind, signal), enabled: Boolean(token) });
  const activeById = useMemo(() => new Map((activeQuery.data || []).map(item => [item._id, item])), [activeQuery.data]);
  const refresh = async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["inventory-feature", kind] }), queryClient.invalidateQueries({ queryKey: ["feature-inventory"] })]); setModal(null); };
  const saveMutation = useMutation({ mutationFn: ({ item, payload, editing }: { item: FeatureInventoryItem; payload: FeatureInput; editing: boolean }) => saveFeature(token!, kind, item._id, payload, editing), onSuccess: async () => { toast.success(`${configs[kind].activeLabel} saved successfully`); await refresh(); }, onError: showError });
  const removeMutation = useMutation({ mutationFn: (item: FeatureInventoryItem) => removeFeature(token!, kind, item._id), onSuccess: async () => { toast.success(`${configs[kind].activeLabel} deactivated successfully`); await refresh(); }, onError: showError });
  const clearMutation = useMutation({ mutationFn: () => clearTodayFeatured(token!), onSuccess: async result => { toast.success(`${result.data.cleared} featured item${result.data.cleared === 1 ? "" : "s"} cleared`); await refresh(); }, onError: showError });
  const pending = saveMutation.isPending || removeMutation.isPending || clearMutation.isPending;

  if (status === "loading" || inventoryQuery.isLoading || activeQuery.isLoading || (status === "authenticated" && !token)) return <FeatureManagementSkeleton/>;
  if (!token) return <DashboardState type="error" title={`Couldn’t load ${configs[kind].heading}`} message="Your session token is missing. Please log in again."/>;
  if (inventoryQuery.isError || activeQuery.isError) {
    const error = inventoryQuery.error || activeQuery.error;
    return <DashboardState type="error" title={`Couldn’t load ${configs[kind].heading}`} message={error instanceof Error ? error.message : "Something went wrong while loading inventory."} onRetry={() => { inventoryQuery.refetch(); activeQuery.refetch(); }}/>
  }

  const inventory = inventoryQuery.data?.data || [];
  const totalPages = Math.max(1, Math.ceil((inventoryQuery.data?.meta.total || 0) / (inventoryQuery.data?.meta.limit || 10)));
  const todayCount = kind === "daily-featured" ? (activeQuery.data || []).filter(item => isToday(item.featuredDate)).length : 0;

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
    {kind === "daily-featured" && todayCount > 0 && <div className="mb-3 flex justify-end"><button type="button" onClick={() => setModal({ type: "clear" })} className="h-9 rounded border border-red-400/50 px-4 text-[10px] text-red-300 transition hover:bg-red-500/10">Clear today ({todayCount})</button></div>}

    {inventory.length ? <section className="space-y-2.5" aria-label={configs[kind].heading}>{inventory.map(item => {
      const activeItem = activeById.get(item._id) || (isFeatureActive(item, kind) ? item : undefined);
      return <FeatureRow key={item._id} item={{ ...item, ...activeItem }} kind={kind} active={Boolean(activeItem)} activate={() => setModal({ type: "add", item })} edit={() => setModal({ type: "edit", item: { ...item, ...activeItem } })} remove={() => setModal({ type: "remove", item: { ...item, ...activeItem } })}/>;
    })}</section> : <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-[#76552b] bg-[#2d1a08] px-5 text-center"><PackageOpen size={28} className="text-[#d5a744]"/><h2 className="mt-3 font-playfair text-lg">No inventory found</h2><p className="mt-1 max-w-sm text-xs text-[#a98b5c]">Add inventory first, then manage its {configs[kind].activeLabel.toLowerCase()} status here.</p></div>}

    {inventory.length > 0 && totalPages > 1 && <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Inventory pagination"><button type="button" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="h-9 rounded border border-[#76552b] px-4 text-[10px] disabled:opacity-40">Previous</button><span className="text-[10px] text-[#a98b5c]">Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))} className="h-9 rounded border border-[#76552b] px-4 text-[10px] disabled:opacity-40">Next</button></nav>}

    <Dialog open={Boolean(modal)} onOpenChange={open => { if (!open && !pending) setModal(null); }}><DialogContent className="dashboard-copy dashboard-scrollbar max-h-[90vh] max-w-[500px] overflow-y-auto border-[#76552b] bg-[#573621] text-[#f4dfa8]">
      {(modal?.type === "add" || modal?.type === "edit") && <FeatureForm key={`${modal.type}-${modal.item._id}`} kind={kind} item={modal.item} editing={modal.type === "edit"} pending={pending} close={() => setModal(null)} submit={payload => saveMutation.mutate({ item: modal.item, payload, editing: modal.type === "edit" })}/>} 
      {modal?.type === "remove" && <RemoveDialog item={modal.item} label={configs[kind].activeLabel} pending={pending} close={() => setModal(null)} confirm={() => removeMutation.mutate(modal.item)}/>} 
      {modal?.type === "clear" && <ClearDialog count={todayCount} pending={pending} close={() => setModal(null)} confirm={() => clearMutation.mutate()}/>} 
    </DialogContent></Dialog>
  </div>;
}

function FeatureRow({ item, kind, active, activate, edit, remove }: { item: FeatureInventoryItem; kind: FeatureKind; active: boolean; activate: () => void; edit: () => void; remove: () => void }) {
  const price = kind === "daily-featured" && active && item.featuredPrice !== undefined ? item.featuredPrice : item.price;
  return <article className="flex min-h-[102px] items-center gap-3 rounded-lg border border-[#76552b] bg-[#2d1a08] p-3 transition hover:border-[#977039] sm:p-4">
    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-[#513719]"><CigarImage src={item.image} alt={item.name || "Cigar"} fill sizes="56px" className="object-cover"/></span>
    <div className="min-w-0 flex-1"><small className="block truncate text-[9px] uppercase tracking-wider text-[#a98b5c]">{item.brand || "Brand not set"}</small><h3 className="truncate font-playfair text-sm text-[#f1dbac]">{item.name || "Unnamed cigar"}</h3><div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-[#a98b5c]">{item.strength && <span className="rounded-full border border-[#9d6d18] bg-[#5a3d10] px-2 py-0.5 capitalize text-[#efbd43]">{item.strength}</span>}{item.wrapper && <span>{item.wrapper}</span>}{item.size && <><i>·</i><span>{item.size}</span></>}<span>·</span><span>{formatPrice(price)}</span></div>{active && <FeatureMeta kind={kind} item={item}/>}</div>
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">{active ? <><button type="button" onClick={edit} aria-label={`Edit ${item.name || "item"}`} className="grid h-9 w-9 place-items-center rounded border border-[#76552b] text-[#d5a744] transition hover:bg-[#513719]"><Pencil size={14}/></button><span className="flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded border border-[#9d7631] px-3 text-[10px] text-[#e5b64e]"><Check size={13}/>Active</span><button type="button" onClick={remove} className="h-9 rounded border border-red-400/40 px-3 text-[10px] text-red-300 transition hover:bg-red-500/10">Deactivate</button></> : <button type="button" onClick={activate} className="flex h-9 min-w-[92px] items-center justify-center gap-1.5 rounded border border-transparent bg-[#513719] px-3 text-[10px] text-[#a98b5c] transition hover:text-[#e5b64e]"><Check size={13}/>Activate</button>}</div>
  </article>;
}

function FeatureMeta({ kind, item }: { kind: FeatureKind; item: FeatureInventoryItem }) {
  const value = kind === "staff-picks" ? [item.staffPickBy, item.staffPickNote].filter(Boolean).join(" · ") : kind === "new-arrivals" ? [dateLabel(item.arrivalDate), item.autoRemoveDays ? `${item.autoRemoveDays}-day display` : undefined, item.newArrivalNote].filter(Boolean).join(" · ") : [isToday(item.featuredDate) ? "Today" : "Tomorrow", item.featuredNote].filter(Boolean).join(" · ");
  return value ? <p className="mt-1 line-clamp-1 text-[9px] text-[#806944]">{value}</p> : null;
}

function FeatureForm({ kind, item, editing, pending, close, submit }: { kind: FeatureKind; item: FeatureInventoryItem; editing: boolean; pending: boolean; close: () => void; submit: (payload: FeatureInput) => void }) {
  const [staff, setStaff] = useState<StaffPickInput>({ staffPickBy: item.staffPickBy || "", staffPickNote: item.staffPickNote || "" });
  const [arrival, setArrival] = useState<NewArrivalInput>({ arrivalDate: dateInput(item.arrivalDate) || localDate(), note: item.newArrivalNote || "", autoRemoveDays: item.autoRemoveDays || 30 });
  const [daily, setDaily] = useState<{ featuredDate: string; note: string; featuredPrice: string }>({ featuredDate: dateInput(item.featuredDate) || localDate(), note: item.featuredNote || "", featuredPrice: item.featuredPrice !== undefined ? String(item.featuredPrice) : "" });
  const [error, setError] = useState("");
  const onSubmit = (event: FormEvent) => { event.preventDefault(); setError(""); if (kind === "staff-picks") { const payload = { staffPickBy: staff.staffPickBy.trim(), staffPickNote: staff.staffPickNote.trim() }; if (!payload.staffPickBy || !payload.staffPickNote) return setError("Staff name and recommendation note are required."); submit(payload); } else if (kind === "new-arrivals") submit({ ...arrival, note: arrival.note?.trim() || undefined }); else { const price = daily.featuredPrice === "" ? undefined : Number(daily.featuredPrice); if (price !== undefined && (!Number.isFinite(price) || price < 0)) return setError("Featured price must be zero or greater."); submit({ featuredDate: daily.featuredDate, note: daily.note.trim() || undefined, featuredPrice: price } as DailyFeaturedInput); } };
  return <><DialogHeader><DialogTitle className="font-playfair text-lg text-[#d5a744]">{editing ? "Edit" : "Activate"} {configs[kind].activeLabel}</DialogTitle><DialogDescription className="text-[10px] text-[#bca37b]">Set the backend-supported details for <strong className="text-[#ead8ae]">{item.name || "this cigar"}</strong>.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-3">
    {kind === "staff-picks" && <><Field label="Staff Pick By" value={staff.staffPickBy} onChange={staffPickBy => setStaff(current => ({ ...current, staffPickBy }))} placeholder="Staff member name" required/><TextArea label="Recommendation Note" value={staff.staffPickNote} onChange={staffPickNote => setStaff(current => ({ ...current, staffPickNote }))} placeholder="Why your team recommends this cigar" required/></>}
    {kind === "new-arrivals" && <><Field label="Arrival Date" type="date" value={arrival.arrivalDate || ""} onChange={arrivalDate => setArrival(current => ({ ...current, arrivalDate }))} required/><TextArea label="Note" value={arrival.note || ""} onChange={note => setArrival(current => ({ ...current, note }))} placeholder="Optional customer-facing arrival note"/><div className="flex flex-col gap-1.5 text-[11px]"><span>Auto-remove After</span><Select value={String(arrival.autoRemoveDays)} onValueChange={value => setArrival(current => ({ ...current, autoRemoveDays: Number(value) as 7 | 14 | 30 }))}><SelectTrigger aria-label="Auto-remove after" className={`${inputClass} shadow-none`}><SelectValue /></SelectTrigger><SelectContent className="border-[#9c7b49] bg-[#573621] text-[#eadcb9]">{[7, 14, 30].map(days => <SelectItem className="focus:bg-[#68462f] focus:text-[#f3dda4]" key={days} value={String(days)}>{days} days</SelectItem>)}</SelectContent></Select></div></>}
    {kind === "daily-featured" && <><Field label="Featured Date" type="date" value={daily.featuredDate} onChange={featuredDate => setDaily(current => ({ ...current, featuredDate }))} required/><TextArea label="Featured Note" value={daily.note} onChange={note => setDaily(current => ({ ...current, note }))} placeholder="Optional customer-facing feature note"/><Field label="Featured Price" type="number" value={daily.featuredPrice} onChange={featuredPrice => setDaily(current => ({ ...current, featuredPrice }))} placeholder="Optional special price"/></>}
    {error && <p role="alert" className="rounded border border-red-400/30 bg-red-500/10 p-2 text-[10px] text-red-200">{error}</p>}<Actions pending={pending} close={close} action={editing ? "Save Changes" : "Activate"}/>
  </form></>;
}

function RemoveDialog({ item, label, pending, close, confirm }: { item: FeatureInventoryItem; label: string; pending: boolean; close: () => void; confirm: () => void }) { return <><DialogHeader><span className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-400"><TriangleAlert size={18}/></span><DialogTitle className="font-playfair text-lg text-[#d5a744]">Deactivate {label}</DialogTitle><DialogDescription className="text-xs text-[#c6ad7e]">Stop showing <strong className="text-[#f1dbac]">{item.name || "this cigar"}</strong> as {label}? The inventory item and its stock will remain unchanged.</DialogDescription></DialogHeader><DialogFooter className="mt-3 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} type="button" onClick={confirm} className="h-9 flex-1 rounded bg-red-500 text-[10px] font-semibold text-white disabled:opacity-60">{pending ? "Deactivating..." : "Deactivate"}</button></DialogFooter></>; }
function ClearDialog({ count, pending, close, confirm }: { count: number; pending: boolean; close: () => void; confirm: () => void }) { return <><DialogHeader><span className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-400"><TriangleAlert size={18}/></span><DialogTitle className="font-playfair text-lg text-[#d5a744]">Clear Today’s Features</DialogTitle><DialogDescription className="text-xs text-[#c6ad7e]">Remove all {count} item{count === 1 ? "" : "s"} featured today? Tomorrow’s scheduled items will remain unchanged.</DialogDescription></DialogHeader><DialogFooter className="mt-3 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} type="button" onClick={confirm} className="h-9 flex-1 rounded bg-red-500 text-[10px] font-semibold text-white disabled:opacity-60">{pending ? "Clearing..." : "Clear Today"}</button></DialogFooter></>; }
function Actions({ pending, close, action }: { pending: boolean; close: () => void; action: string }) { return <DialogFooter className="mt-5 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded bg-[#d1a23f] text-[10px] font-semibold text-[#2e1a09] disabled:opacity-60">{pending && <LoaderCircle size={13} className="animate-spin"/>}{pending ? "Saving..." : action}</button></DialogFooter>; }
function Field({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required={required} type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={event => onChange(event.target.value)} className={inputClass} placeholder={placeholder}/></label>; }
function TextArea({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><textarea required={required} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} h-24 resize-none py-3`}/></label>; }
function formatPrice(price?: number) { return typeof price === "number" ? `$${price.toFixed(2)}` : "Price not set"; }
function dateInput(value?: string) { return value ? value.slice(0, 10) : ""; }
function dateLabel(value?: string) { return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : undefined; }
function localDate() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
function isToday(value?: string) { return dateInput(value) === localDate(); }
function isFeatureActive(item: FeatureInventoryItem, kind: FeatureKind) { return kind === "staff-picks" ? item.isStaffPick : kind === "new-arrivals" ? item.isNewArrival : item.isDailyFeatured; }
function showError(error: unknown) { toast.error(error instanceof Error ? error.message : "Inventory feature request failed"); }
