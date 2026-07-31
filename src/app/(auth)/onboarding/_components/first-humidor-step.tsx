import { Box, Layers3, Plus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import {
  inputClassName,
  labelClassName,
  textareaClassName,
  type OnboardingStepProps,
} from "./onboarding-types";

type FirstHumidorStepProps = OnboardingStepProps & {
  onShelfChange: (
    index: number,
    field: "name" | "description",
    value: string,
  ) => void;
  onAddShelf: () => void;
  onRemoveShelf: (index: number) => void;
};

const Required = () => <span className="text-[#D5AB48]">*</span>;

const FirstHumidorStep = ({
  data,
  onChange,
  onShelfChange,
  onAddShelf,
  onRemoveShelf,
}: FirstHumidorStepProps) => (
  <div className="space-y-5">
    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]">
          <Box className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#F5E7C2]">Humidor room details</h2>
          <p className="mt-0.5 text-xs text-[#B7A887]">
            The humidor represents the complete shop room.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className={labelClassName}>Humidor name <Required /></span>
          <input className={inputClassName} name="humidorName" value={data.humidorName} onChange={onChange} placeholder="e.g. Main Walk-in Humidor" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Location <Required /></span>
          <input className={inputClassName} name="humidorLocation" value={data.humidorLocation} onChange={onChange} placeholder="e.g. Front of store" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Description <Required /></span>
          <textarea className={textareaClassName} name="humidorDescription" value={data.humidorDescription} onChange={onChange} placeholder="Describe this humidor and what it stores..." required />
        </label>
      </div>
    </section>

    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]">
            <Layers3 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#F5E7C2]">First wall and shelf rows</h2>
            <p className="mt-0.5 text-xs text-[#B7A887]">
              A wall contains horizontal shelf rows and numbered columns.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddShelf}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-[7px] border border-[#D5AB48]/60 px-3 text-xs font-medium text-[#D5AB48] transition hover:bg-[#D5AB48]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
        >
          <Plus className="h-4 w-4" /> Add shelf row
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={labelClassName}>Wall name <Required /></span><input className={inputClassName} name="wallName" value={data.wallName} onChange={onChange} placeholder="e.g. Wall 1" required /></label>
        <label className="block">
          <span className={labelClassName}>Shelf columns per row <Required /></span>
          <input
            className={inputClassName}
            name="wallColumns"
            type="number"
            min="1"
            max="100"
            step="1"
            inputMode="numeric"
            value={data.wallColumns}
            onChange={onChange}
            placeholder="e.g. 4"
            required
          />
        </label>
        <label className="block sm:col-span-2"><span className={labelClassName}>Wall description</span><input className={inputClassName} name="wallDescription" value={data.wallDescription} onChange={onChange} placeholder="e.g. Left-side wall" /></label>
      </div>
      <div className="space-y-3">
        {data.shelfes.map((shelf, index) => (
          <div key={index} className="rounded-lg border border-[#6f5528] bg-[#3B2D16]/35 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D5AB48]">
                Shelf row {index + 1}
              </span>
              {data.shelfes.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemoveShelf(index)}
                  aria-label={`Remove shelf row ${index + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#B7A887] transition hover:bg-red-400/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClassName}>Shelf name <Required /></span>
                <input className={inputClassName} value={shelf.name} onChange={(event: ChangeEvent<HTMLInputElement>) => onShelfChange(index, "name", event.target.value)} placeholder="e.g. Shelf 1" required />
              </label>
              <label className="block">
                <span className={labelClassName}>Contents <Required /></span>
                <input className={inputClassName} value={shelf.description} onChange={(event: ChangeEvent<HTMLInputElement>) => onShelfChange(index, "description", event.target.value)} placeholder="e.g. Premium cigars" required />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default FirstHumidorStep;
