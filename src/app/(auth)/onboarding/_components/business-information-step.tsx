import { Building2, MapPin } from "lucide-react";
import {
  inputClassName,
  labelClassName,
  textareaClassName,
  type BusinessInformationData,
  type BusinessInformationField,
} from "./onboarding-types";

type BusinessInformationStepProps = {
  data: BusinessInformationData;
  onFieldChange: (field: BusinessInformationField, value: string) => void;
};

const Required = () => <span className="text-[#D5AB48]">*</span>;

const BusinessInformationStep = ({
  data,
  onFieldChange,
}: BusinessInformationStepProps) => (
  <div className="space-y-5">
    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]">
          <Building2 className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#F5E7C2]">Store details</h2>
          <p className="mt-0.5 text-xs text-[#B7A887]">
            This information identifies your business to customers.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClassName}>Store name <Required /></span>
          <input className={inputClassName} name="storeName" value={data.storeName} onChange={(event) => onFieldChange("storeName", event.target.value)} placeholder="e.g. Downtown Cigar Lounge" autoComplete="organization" required />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClassName}>Street address <Required /></span>
          <input className={inputClassName} name="address" value={data.address} onChange={(event) => onFieldChange("address", event.target.value)} placeholder="e.g. 123 Main Street" autoComplete="street-address" required />
        </label>
        <label>
          <span className={labelClassName}>City <Required /></span>
          <input className={inputClassName} name="city" value={data.city} onChange={(event) => onFieldChange("city", event.target.value)} placeholder="e.g. Dhaka" autoComplete="address-level2" required />
        </label>
        <label>
          <span className={labelClassName}>Phone number <Required /></span>
          <input
            className={inputClassName}
            name="phoneNumber"
            value={data.phoneNumber}
            onChange={(event) => onFieldChange("phoneNumber", event.target.value)}
            placeholder="Enter any contact number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
          />
          <span className="mt-1 block text-[10px] text-[#B7A887]">
            Any local or international number is accepted.
          </span>
        </label>
      </div>
    </section>

    <section className="rounded-xl border border-[#6f5528]/80 bg-black/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D5AB48]/15 text-[#D5AB48]">
          <MapPin className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#F5E7C2]">About your store</h2>
          <p className="mt-0.5 text-xs text-[#B7A887]">
            Tell customers what makes your shop special.
          </p>
        </div>
      </div>
      <label>
        <span className={labelClassName}>Description <Required /></span>
        <textarea className={textareaClassName} name="description" value={data.description} onChange={(event) => onFieldChange("description", event.target.value)} placeholder="Describe your selection, service, and atmosphere..." required />
      </label>
    </section>
  </div>
);

export default BusinessInformationStep;
