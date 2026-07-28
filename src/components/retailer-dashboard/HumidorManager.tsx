"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addHumidorShelf, createHumidor, deleteHumidor, getHumidors, updateHumidor, updateHumidorShelfGrid, type Humidor, type HumidorInput, type HumidorShelf, type HumidorShelfInput } from "@/lib/humidors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, LayoutGrid, MapPin, Pencil, Plus, Power, Trash2, TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import DashboardState from "./DashboardState";
import HumidorSkeleton from "./HumidorSkeleton";

type Modal = { type: "add" } | { type: "edit" | "delete" | "shelf"; humidor: Humidor } | { type: "grid"; humidor: Humidor; shelf: HumidorShelf } | null;
const inputClass = "h-10 w-full rounded border border-[#9c7b49] bg-[#68462f] px-3 text-xs text-[#eadcb9] outline-none placeholder:text-[#bca37b] focus:border-[#d1a23f]";

export default function HumidorManager() {
  const { data: session, status } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const [modal, setModal] = useState<Modal>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["humidors"], queryFn: ({ signal }) => getHumidors(token!, signal), enabled: Boolean(token) });
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ["humidors"] }); setModal(null); };
  const createMutation = useMutation({ mutationFn: (payload: HumidorInput) => createHumidor(token!, payload), onSuccess: async () => { toast.success("Humidor created successfully"); await refresh(); }, onError: showError });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: HumidorInput }) => updateHumidor(token!, id, payload), onSuccess: async () => { toast.success("Humidor updated successfully"); await refresh(); }, onError: showError });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteHumidor(token!, id), onSuccess: async () => { toast.success("Humidor deleted successfully"); await refresh(); }, onError: showError });
  const shelfMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: HumidorShelfInput }) => addHumidorShelf(token!, id, payload), onSuccess: async () => { toast.success("Shelf added successfully"); await refresh(); }, onError: showError });
  const gridMutation = useMutation({ mutationFn: ({ id, shelfId, payload }: { id: string; shelfId: string; payload: Pick<HumidorShelfInput, "rows" | "columns"> }) => updateHumidorShelfGrid(token!, id, shelfId, payload), onSuccess: async () => { toast.success("Shelf grid updated successfully"); await refresh(); }, onError: showError });
  const pending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || shelfMutation.isPending || gridMutation.isPending;

  if (status === "loading" || query.isLoading || (status === "authenticated" && !token)) return <HumidorSkeleton/>;
  if (!token) return <DashboardState type="error" title="Couldn’t load humidors" message="Your session token is missing. Please log in again."/>;
  if (query.isError) return <DashboardState type="error" title="Couldn’t load humidors" message={query.error instanceof Error ? query.error.message : "Something went wrong while loading your humidors."} onRetry={() => query.refetch()}/>;
  const humidors = query.data || [];

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
    <div className="flex justify-end"><button type="button" onClick={() => setModal({ type: "add" })} className="flex h-10 min-w-40 items-center justify-center gap-2 rounded bg-[#d3a440] px-5 text-xs font-semibold text-[#291806] transition hover:-translate-y-0.5 hover:bg-[#e0b653]"><Plus size={16}/>Add Humidor</button></div>
    {humidors.length ? <section className="mt-4 space-y-4">{humidors.map(humidor => <HumidorCard key={humidor._id} humidor={humidor} edit={() => setModal({ type: "edit", humidor })} remove={() => setModal({ type: "delete", humidor })} addShelf={() => setModal({ type: "shelf", humidor })} editGrid={shelf => setModal({ type: "grid", humidor, shelf })}/>)}</section> : <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-lg border border-[#76552b] bg-[#2d1a08] px-5 text-center"><Box size={28} className="text-[#d5a744]"/><h2 className="mt-3 font-playfair text-lg">No humidors yet</h2><p className="mt-1 text-xs text-[#a98b5c]">Add your first humidor to organize its location and shelves.</p></div>}

    <Dialog open={Boolean(modal)} onOpenChange={open => { if (!open && !pending) setModal(null); }}>
      <DialogContent className="dashboard-copy dashboard-scrollbar max-h-[90vh] max-w-[500px] overflow-y-auto border-[#76552b] bg-[#573621] text-[#f4dfa8]">
        {modal?.type === "add" && <HumidorForm title="Add New Humidor" description="Create a humidor using the fields supported by your inventory." pending={pending} submitLabel="Add Humidor" close={() => setModal(null)} onSubmit={payload => createMutation.mutate(payload)}/>}
        {modal?.type === "edit" && <HumidorForm title="Edit Humidor" description={`Update ${modal.humidor.name}. Existing shelves remain unchanged.`} initial={modal.humidor} pending={pending} submitLabel="Save Changes" close={() => setModal(null)} onSubmit={payload => updateMutation.mutate({ id: modal.humidor._id, payload })}/>}
        {modal?.type === "shelf" && <ShelfForm humidor={modal.humidor} pending={pending} close={() => setModal(null)} onSubmit={payload => shelfMutation.mutate({ id: modal.humidor._id, payload })}/>}
        {modal?.type === "grid" && <ShelfGridForm shelf={modal.shelf} pending={pending} close={() => setModal(null)} onSubmit={payload => gridMutation.mutate({ id: modal.humidor._id, shelfId: modal.shelf._id, payload })}/>}
        {modal?.type === "delete" && <DeleteDialog humidor={modal.humidor} pending={pending} close={() => setModal(null)} confirm={() => deleteMutation.mutate(modal.humidor._id)}/>}
      </DialogContent>
    </Dialog>
  </div>;
}

function HumidorCard({ humidor, edit, remove, addShelf, editGrid }: { humidor: Humidor; edit: () => void; remove: () => void; addShelf: () => void; editGrid: (shelf: HumidorShelf) => void }) {
  const shelves = humidor.shelfes || [];
  const cigarCount = shelves.reduce((total, shelf) => total + (shelf.cigarCount || 0), 0);
  return <article className="overflow-hidden rounded-lg border border-[#76552b] bg-[#2d1a08]">
    <div className="p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-[#8a652a] bg-[#513719] text-[#d5a744]"><Box size={20}/></span><div className="min-w-0"><h2 className="truncate font-playfair text-lg font-semibold text-[#f2dca5]">{humidor.name}</h2><p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#a88a59]"><MapPin size={11}/>{humidor.location || "Location not set"}</p>{humidor.description && <p className="mt-1 text-[10px] text-[#806944]">{humidor.description}</p>}</div></div><div className="flex shrink-0 gap-2 text-[#efd89b]"><button type="button" aria-label={`Edit ${humidor.name}`} onClick={edit} className="grid h-8 w-8 place-items-center rounded transition hover:bg-[#513719] hover:text-[#d3a440]"><Pencil size={15}/></button><button type="button" aria-label={`Delete ${humidor.name}`} onClick={remove} className="grid h-8 w-8 place-items-center rounded transition hover:bg-red-500/10 hover:text-red-400"><Trash2 size={15}/></button></div></div>
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"><Stat label="Shelves" value={shelves.length.toLocaleString()}/><Stat label="Cigars" value={cigarCount.toLocaleString()}/><Stat label="Status" value={humidor.isActive ? "Active" : "Inactive"}/><Stat label="Location" value={humidor.location || "Not set"}/></div>
    </div>
    <div className="border-t border-[#67461f] bg-[#34200e]/45 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#a98b5c]"><LayoutGrid size={14}/>Shelves ({shelves.length})</h3><button type="button" onClick={addShelf} className="flex h-8 items-center gap-1 rounded border border-[#80602f] px-3 text-[10px] text-[#d5a744] transition hover:bg-[#513719]"><Plus size={13}/>Add Shelf</button></div>{shelves.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{shelves.map(shelf => <div className="rounded-md border border-[#674d2a] bg-[#2d1a08] p-3" key={shelf._id}><div className="flex items-center justify-between gap-2"><strong className="truncate text-xs text-[#e8d4a8]">{shelf.name}</strong><div className="flex shrink-0 items-center gap-1"><span className="text-[9px] text-[#d5a744]">{shelf.cigarCount || 0} cigars</span><button type="button" onClick={() => editGrid(shelf)} aria-label={`Edit ${shelf.name} grid`} className="grid h-7 w-7 place-items-center rounded text-[#efd89b] transition hover:bg-[#513719] hover:text-[#d3a440]"><Pencil size={12}/></button></div></div><p className="mt-1 text-[9px] font-medium text-[#b99658]">{shelf.rows && shelf.columns ? `${shelf.rows} rows × ${shelf.columns} columns` : "Grid not set"}</p>{shelf.description && <p className="mt-1 line-clamp-2 text-[9px] text-[#806944]">{shelf.description}</p>}</div>)}</div> : <p className="mt-4 text-[10px] text-[#806944]">No shelves yet. Add shelves inside this humidor.</p>}</div>
  </article>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-[#513719] px-3 py-2.5 text-center"><span className="block text-[9px] text-[#a98b5c]">{label}</span><strong className="mt-0.5 block truncate text-xs font-medium text-[#f0ddb0]">{value}</strong></div>; }

function HumidorForm({ title, description, initial, pending, submitLabel, close, onSubmit }: { title: string; description: string; initial?: Humidor; pending: boolean; submitLabel: string; close: () => void; onSubmit: (payload: HumidorInput) => void }) {
  const [values, setValues] = useState<HumidorInput>({ name: initial?.name || "", location: initial?.location || "", description: initial?.description || "", isActive: initial?.isActive ?? true });
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit({ ...values, name: values.name.trim(), location: values.location?.trim() || undefined, description: values.description?.trim() || undefined }); };
  return <><DialogHeader><DialogTitle className="font-playfair text-lg text-[#d5a744]">{title}</DialogTitle><DialogDescription className="text-[10px] text-[#bca37b]">{description}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-3"><Field label="Humidor Name" value={values.name} onChange={name => setValues(current => ({ ...current, name }))} placeholder="e.g. Main Humidor" required/><Field label="Location" value={values.location || ""} onChange={location => setValues(current => ({ ...current, location }))} placeholder="e.g. Front of Store"/><label className="flex flex-col gap-1.5 text-[11px]"><span>Description</span><textarea value={values.description || ""} onChange={event => setValues(current => ({ ...current, description: event.target.value }))} placeholder="e.g. Temperature controlled humidor" className={`${inputClass} h-24 resize-none py-3`}/></label><label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={values.isActive} onChange={event => setValues(current => ({ ...current, isActive: event.target.checked }))} className="accent-[#d1a23f]"/><Power size={14}/>Active humidor</label><Actions pending={pending} close={close} action={submitLabel}/></form></>;
}

function ShelfForm({ humidor, pending, close, onSubmit }: { humidor: Humidor; pending: boolean; close: () => void; onSubmit: (payload: HumidorShelfInput) => void }) {
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [rows, setRows] = useState(""); const [columns, setColumns] = useState("");
  return <><DialogHeader><DialogTitle className="font-playfair text-lg text-[#d5a744]">Add Shelf</DialogTitle><DialogDescription className="text-[10px] text-[#bca37b]">Add a shelf and define its internal grid inside {humidor.name}.</DialogDescription></DialogHeader><form onSubmit={event => { event.preventDefault(); onSubmit({ name: name.trim(), description: description.trim() || undefined, rows: Number(rows), columns: Number(columns) }); }} className="space-y-3"><Field label="Shelf Name" value={name} onChange={setName} placeholder="e.g. Top Shelf" required/><Field label="Description" value={description} onChange={setDescription} placeholder="e.g. Premium Cigars"/><div className="grid grid-cols-2 gap-3"><NumberField label="Rows" value={rows} onChange={setRows}/><NumberField label="Columns" value={columns} onChange={setColumns}/></div><Actions pending={pending} close={close} action="Add Shelf"/></form></>;
}

function ShelfGridForm({ shelf, pending, close, onSubmit }: { shelf: HumidorShelf; pending: boolean; close: () => void; onSubmit: (payload: Pick<HumidorShelfInput, "rows" | "columns">) => void }) {
  const [rows, setRows] = useState(shelf.rows ? String(shelf.rows) : ""); const [columns, setColumns] = useState(shelf.columns ? String(shelf.columns) : "");
  return <><DialogHeader><DialogTitle className="font-playfair text-lg text-[#d5a744]">Edit Shelf Grid</DialogTitle><DialogDescription className="text-[10px] text-[#bca37b]">Set how many rows and columns are available inside {shelf.name}.</DialogDescription></DialogHeader><form onSubmit={event => { event.preventDefault(); onSubmit({ rows: Number(rows), columns: Number(columns) }); }} className="space-y-3"><div className="grid grid-cols-2 gap-3"><NumberField label="Rows" value={rows} onChange={setRows}/><NumberField label="Columns" value={columns} onChange={setColumns}/></div><Actions pending={pending} close={close} action="Save Grid"/></form></>;
}

function DeleteDialog({ humidor, pending, close, confirm }: { humidor: Humidor; pending: boolean; close: () => void; confirm: () => void }) { return <><DialogHeader><span className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-400"><TriangleAlert size={18}/></span><DialogTitle className="font-playfair text-lg text-[#d5a744]">Delete Humidor</DialogTitle><DialogDescription className="text-xs text-[#c6ad7e]">Delete <strong className="text-[#f1dbac]">{humidor.name}</strong>? Its shelf structure will also be removed. This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter className="mt-3 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} type="button" onClick={confirm} className="h-9 flex-1 rounded bg-red-500 text-[10px] font-semibold text-white disabled:opacity-60">{pending ? "Deleting..." : "Delete"}</button></DialogFooter></>; }
function Actions({ pending, close, action }: { pending: boolean; close: () => void; action: string }) { return <DialogFooter className="mt-5 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} className="h-9 flex-1 rounded bg-[#d1a23f] text-[10px] font-semibold text-[#2e1a09] disabled:opacity-60">{pending ? "Saving..." : action}</button></DialogFooter>; }
function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required={required} value={value} onChange={event => onChange(event.target.value)} className={inputClass} placeholder={placeholder}/></label>; }
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required type="number" min="1" max="100" step="1" inputMode="numeric" value={value} onChange={event => onChange(event.target.value)} className={inputClass} placeholder="1"/></label>; }
function showError(error: unknown) { toast.error(error instanceof Error ? error.message : "Humidor request failed"); }
