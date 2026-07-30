"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addHumidorShelf, addHumidorWall, createHumidor, deleteHumidor, deleteHumidorWall, getHumidors, updateHumidor, updateHumidorWall, type Humidor, type HumidorInput, type HumidorShelfInput, type HumidorWall, type HumidorWallInput } from "@/lib/humidors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, BrickWall, MapPin, Pencil, Plus, Power, Trash2, TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardState from "./DashboardState";
import HumidorSkeleton from "./HumidorSkeleton";

type Modal =
  | { type: "add" }
  | { type: "edit" | "delete" | "wall"; humidor: Humidor }
  | { type: "edit-wall" | "delete-wall" | "shelf"; humidor: Humidor; wall: HumidorWall }
  | null;
const inputClass = "h-10 w-full rounded border border-[#9c7b49] bg-[#68462f] px-3 text-xs text-[#eadcb9] outline-none placeholder:text-[#bca37b] focus:border-[#d1a23f]";

export default function HumidorManager() {
  const { data: session, status } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const [modal, setModal] = useState<Modal>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["humidors"], queryFn: ({ signal }) => getHumidors(token!, signal), enabled: Boolean(token) });
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ["humidors"] }); setModal(null); };
  const mutation = {
    create: useMutation({ mutationFn: (payload: HumidorInput) => createHumidor(token!, payload), onSuccess: async () => { toast.success("Humidor room created"); await refresh(); }, onError: showError }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: HumidorInput }) => updateHumidor(token!, id, payload), onSuccess: async () => { toast.success("Humidor room updated"); await refresh(); }, onError: showError }),
    remove: useMutation({ mutationFn: (id: string) => deleteHumidor(token!, id), onSuccess: async () => { toast.success("Humidor room deleted"); await refresh(); }, onError: showError }),
    addWall: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: HumidorWallInput }) => addHumidorWall(token!, id, payload), onSuccess: async () => { toast.success("Wall added"); await refresh(); }, onError: showError }),
    editWall: useMutation({ mutationFn: ({ id, wallId, payload }: { id: string; wallId: string; payload: Partial<HumidorWallInput> }) => updateHumidorWall(token!, id, wallId, payload), onSuccess: async () => { toast.success("Wall updated"); await refresh(); }, onError: showError }),
    removeWall: useMutation({ mutationFn: ({ id, wallId }: { id: string; wallId: string }) => deleteHumidorWall(token!, id, wallId), onSuccess: async () => { toast.success("Wall deleted"); await refresh(); }, onError: showError }),
    addShelf: useMutation({ mutationFn: ({ id, wallId, payload }: { id: string; wallId: string; payload: HumidorShelfInput }) => addHumidorShelf(token!, id, wallId, payload), onSuccess: async () => { toast.success("Shelf row added"); await refresh(); }, onError: showError }),
  };
  const pending = Object.values(mutation).some(value => value.isPending);

  if (status === "loading" || query.isLoading || (status === "authenticated" && !token)) return <HumidorSkeleton />;
  if (!token) return <DashboardState type="error" title="Couldn’t load humidors" message="Your session token is missing. Please log in again." />;
  if (query.isError) return <DashboardState type="error" title="Couldn’t load humidors" message={query.error instanceof Error ? query.error.message : "Something went wrong while loading your humidors."} onRetry={() => query.refetch()} />;
  const humidors = query.data || [];

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
    <div className="flex justify-end"><button type="button" onClick={() => setModal({ type: "add" })} className="flex h-10 min-w-40 items-center justify-center gap-2 rounded bg-[#d3a440] px-5 text-xs font-semibold text-[#291806] transition hover:-translate-y-0.5 hover:bg-[#e0b653]"><Plus size={16} />Add Humidor Room</button></div>
    {humidors.length ? <section className="mt-4 space-y-4">{humidors.map(humidor => <HumidorCard key={humidor._id} humidor={humidor} open={value => setModal(value)} />)}</section> : <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-lg border border-[#76552b] bg-[#2d1a08] px-5 text-center"><Box size={28} className="text-[#d5a744]" /><h2 className="mt-3 font-playfair text-lg">No humidor rooms yet</h2><p className="mt-1 text-xs text-[#a98b5c]">Add the shop room, then configure its walls, shelf rows, and columns.</p></div>}

    <Dialog open={Boolean(modal)} onOpenChange={open => { if (!open && !pending) setModal(null); }}>
      <DialogContent className="dashboard-copy dashboard-scrollbar max-h-[90vh] max-w-[500px] overflow-y-auto border-[#76552b] bg-[#573621] text-[#f4dfa8]">
        {modal?.type === "add" && <HumidorForm title="Add Humidor Room" description="A humidor represents the complete shop room." pending={pending} action="Add Room" close={() => setModal(null)} submit={payload => mutation.create.mutate(payload)} />}
        {modal?.type === "edit" && <HumidorForm title="Edit Humidor Room" description={`Update ${modal.humidor.name}. Its walls remain unchanged.`} initial={modal.humidor} pending={pending} action="Save Changes" close={() => setModal(null)} submit={payload => mutation.update.mutate({ id: modal.humidor._id, payload })} />}
        {modal?.type === "delete" && <DeleteDialog title="Delete Humidor Room" item={modal.humidor.name} detail="All of its wall and shelf structure will also be removed." pending={pending} close={() => setModal(null)} confirm={() => mutation.remove.mutate(modal.humidor._id)} />}
        {modal?.type === "wall" && <WallForm humidor={modal.humidor} pending={pending} close={() => setModal(null)} submit={payload => mutation.addWall.mutate({ id: modal.humidor._id, payload })} />}
        {modal?.type === "edit-wall" && <WallForm humidor={modal.humidor} wall={modal.wall} pending={pending} close={() => setModal(null)} submit={payload => mutation.editWall.mutate({ id: modal.humidor._id, wallId: modal.wall._id, payload })} />}
        {modal?.type === "delete-wall" && <DeleteDialog title="Delete Wall" item={modal.wall.name} detail="Its shelf rows will also be removed." pending={pending} close={() => setModal(null)} confirm={() => mutation.removeWall.mutate({ id: modal.humidor._id, wallId: modal.wall._id })} />}
        {modal?.type === "shelf" && <ShelfForm humidor={modal.humidor} wall={modal.wall} pending={pending} close={() => setModal(null)} submit={payload => mutation.addShelf.mutate({ id: modal.humidor._id, wallId: modal.wall._id, payload })} />}
      </DialogContent>
    </Dialog>
  </div>;
}

function HumidorCard({ humidor, open }: { humidor: Humidor; open: (modal: Exclude<Modal, null>) => void }) {
  const walls = humidor.walls || [];
  const shelves = walls.flatMap(wall => wall.shelves || []);
  return <article className="overflow-hidden rounded-lg border border-[#76552b] bg-[#2d1a08]">
    <div className="p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-[#8a652a] bg-[#513719] text-[#d5a744]"><Box size={20} /></span><div className="min-w-0"><h2 className="truncate font-playfair text-lg font-semibold text-[#f2dca5]">{humidor.name}</h2><p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#a88a59]"><MapPin size={11} />{humidor.location || "Location not set"}</p>{humidor.description && <p className="mt-1 text-[10px] text-[#806944]">{humidor.description}</p>}</div></div><div className="flex shrink-0 gap-2"><IconButton label={`Edit ${humidor.name}`} onClick={() => open({ type: "edit", humidor })}><Pencil size={15} /></IconButton><IconButton label={`Delete ${humidor.name}`} danger onClick={() => open({ type: "delete", humidor })}><Trash2 size={15} /></IconButton></div></div>
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"><Stat label="Walls" value={walls.length} /><Stat label="Shelf Rows" value={shelves.length} /><Stat label="Columns" value={walls.reduce((sum, wall) => sum + wall.columns, 0)} /><Stat label="Status" value={humidor.isActive ? "Active" : "Inactive"} /></div>
    </div>
    <div className="border-t border-[#67461f] bg-[#34200e]/45 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#a98b5c]"><BrickWall size={14} />Walls ({walls.length})</h3><button type="button" onClick={() => open({ type: "wall", humidor })} className="flex h-8 items-center gap-1 rounded border border-[#80602f] px-3 text-[10px] text-[#d5a744] transition hover:bg-[#513719]"><Plus size={13} />Add Wall</button></div>
      {walls.length ? <div className="mt-3 grid gap-3 xl:grid-cols-2">{walls.map(wall => <WallCard key={wall._id} humidor={humidor} wall={wall} open={open} />)}</div> : <p className="mt-4 text-[10px] text-[#806944]">No walls yet. Add each wall of this room.</p>}
      {!walls.length && humidor.shelfes?.length ? <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-200">Legacy shelf data detected. Create walls and reassign inventory locations to the new structure.</p> : null}
    </div>
  </article>;
}

function WallCard({ humidor, wall, open }: { humidor: Humidor; wall: HumidorWall; open: (modal: Exclude<Modal, null>) => void }) {
  return <section className="rounded-md border border-[#674d2a] bg-[#2d1a08] p-3"><div className="flex items-start justify-between gap-2"><div><strong className="text-xs text-[#e8d4a8]">{wall.name}</strong><p className="mt-1 text-[9px] text-[#b99658]">{wall.shelves?.length || 0} shelf rows × {wall.columns} columns</p></div><div className="flex"><IconButton label={`Edit ${wall.name}`} onClick={() => open({ type: "edit-wall", humidor, wall })}><Pencil size={12} /></IconButton><IconButton label={`Delete ${wall.name}`} danger onClick={() => open({ type: "delete-wall", humidor, wall })}><Trash2 size={12} /></IconButton></div></div>
    {wall.description && <p className="mt-1 text-[9px] text-[#806944]">{wall.description}</p>}
    <div className="mt-3 flex flex-wrap gap-1.5">{wall.shelves?.map((shelf, index) => <span key={shelf._id} className="rounded border border-[#674d2a] bg-[#34200e] px-2 py-1 text-[9px] text-[#d9c08d]">{index + 1}. {shelf.name}</span>)}</div>
    <button type="button" onClick={() => open({ type: "shelf", humidor, wall })} className="mt-3 flex h-7 items-center gap-1 text-[9px] text-[#d5a744]"><Plus size={11} />Add Shelf Row</button>
  </section>;
}

function HumidorForm({ title, description, initial, pending, action, close, submit }: { title: string; description: string; initial?: Humidor; pending: boolean; action: string; close: () => void; submit: (payload: HumidorInput) => void }) {
  const [values, setValues] = useState<HumidorInput>({ name: initial?.name || "", location: initial?.location || "", description: initial?.description || "", isActive: initial?.isActive ?? true });
  return <><ModalTitle title={title} description={description} /><form onSubmit={event => { event.preventDefault(); submit({ ...values, name: values.name.trim(), location: values.location?.trim() || undefined, description: values.description?.trim() || undefined }); }} className="space-y-3"><Field label="Room Name" value={values.name} onChange={name => setValues(current => ({ ...current, name }))} placeholder="e.g. Main Humidor Room" required /><Field label="Shop Location" value={values.location || ""} onChange={location => setValues(current => ({ ...current, location }))} placeholder="e.g. Front of Store" /><Field label="Description" value={values.description || ""} onChange={description => setValues(current => ({ ...current, description }))} placeholder="e.g. Main walk-in room" /><label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={values.isActive} onChange={event => setValues(current => ({ ...current, isActive: event.target.checked }))} className="accent-[#d1a23f]" /><Power size={14} />Active room</label><Actions pending={pending} close={close} action={action} /></form></>;
}

function WallForm({ humidor, wall, pending, close, submit }: { humidor: Humidor; wall?: HumidorWall; pending: boolean; close: () => void; submit: (payload: HumidorWallInput) => void }) {
  const [name, setName] = useState(wall?.name || ""); const [description, setDescription] = useState(wall?.description || ""); const [columns, setColumns] = useState(String(wall?.columns || ""));
  return <><ModalTitle title={wall ? "Edit Wall" : "Add Wall"} description={`${humidor.name}: each wall contains shelf rows and numbered columns.`} /><form onSubmit={event => { event.preventDefault(); submit({ name: name.trim(), description: description.trim() || undefined, columns: Number(columns) }); }} className="space-y-3"><Field label="Wall Name" value={name} onChange={setName} placeholder="e.g. Wall 1" required /><Field label="Description" value={description} onChange={setDescription} placeholder="e.g. Left wall" /><NumberField label="Number of Columns" value={columns} onChange={setColumns} /><Actions pending={pending} close={close} action={wall ? "Save Wall" : "Add Wall"} /></form></>;
}

function ShelfForm({ humidor, wall, pending, close, submit }: { humidor: Humidor; wall: HumidorWall; pending: boolean; close: () => void; submit: (payload: HumidorShelfInput) => void }) {
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  return <><ModalTitle title="Add Shelf Row" description={`${humidor.name} → ${wall.name}. The shelf spans the wall’s ${wall.columns} columns.`} /><form onSubmit={event => { event.preventDefault(); submit({ name: name.trim(), description: description.trim() || undefined }); }} className="space-y-3"><Field label="Shelf Name" value={name} onChange={setName} placeholder="e.g. Shelf 1" required /><Field label="Description" value={description} onChange={setDescription} placeholder="e.g. Premium cigars" /><Actions pending={pending} close={close} action="Add Shelf" /></form></>;
}

function DeleteDialog({ title, item, detail, pending, close, confirm }: { title: string; item: string; detail: string; pending: boolean; close: () => void; confirm: () => void }) { return <><DialogHeader><span className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-400"><TriangleAlert size={18} /></span><DialogTitle className="font-playfair text-lg text-[#d5a744]">{title}</DialogTitle><DialogDescription className="text-xs text-[#c6ad7e]">Delete <strong className="text-[#f1dbac]">{item}</strong>? {detail} This cannot be undone.</DialogDescription></DialogHeader><DialogFooter className="mt-3 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} type="button" onClick={confirm} className="h-9 flex-1 rounded bg-red-500 text-[10px] font-semibold text-white disabled:opacity-60">{pending ? "Deleting..." : "Delete"}</button></DialogFooter></>; }
function ModalTitle({ title, description }: { title: string; description: string }) { return <DialogHeader><DialogTitle className="font-playfair text-lg text-[#d5a744]">{title}</DialogTitle><DialogDescription className="text-[10px] text-[#bca37b]">{description}</DialogDescription></DialogHeader>; }
function IconButton({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-label={label} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded transition ${danger ? "text-[#efd89b] hover:bg-red-500/10 hover:text-red-400" : "text-[#efd89b] hover:bg-[#513719] hover:text-[#d3a440]"}`}>{children}</button>; }
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-md bg-[#513719] px-3 py-2.5 text-center"><span className="block text-[9px] text-[#a98b5c]">{label}</span><strong className="mt-0.5 block truncate text-xs font-medium text-[#f0ddb0]">{typeof value === "number" ? value.toLocaleString() : value}</strong></div>; }
function Actions({ pending, close, action }: { pending: boolean; close: () => void; action: string }) { return <DialogFooter className="mt-5 flex-row gap-2 sm:space-x-0"><button disabled={pending} type="button" onClick={close} className="h-9 flex-1 rounded border border-[#c8983b] text-[10px] disabled:opacity-60">Cancel</button><button disabled={pending} className="h-9 flex-1 rounded bg-[#d1a23f] text-[10px] font-semibold text-[#2e1a09] disabled:opacity-60">{pending ? "Saving..." : action}</button></DialogFooter>; }
function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required={required} value={value} onChange={event => onChange(event.target.value)} className={inputClass} placeholder={placeholder} /></label>; }
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required type="number" min="1" max="100" step="1" inputMode="numeric" value={value} onChange={event => onChange(event.target.value)} className={inputClass} placeholder="1" /></label>; }
function showError(error: unknown) { toast.error(error instanceof Error ? error.message : "Humidor request failed"); }
