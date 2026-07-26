"use client";

import {
  getMyRetailer,
  updateRetailerProfile,
  type RetailerProfile,
  type RetailerProfileInput,
} from "@/lib/retailer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, CreditCard, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardState from "./DashboardState";
import ProfileHero from "./ProfileHero";
import ProfileSkeleton from "./ProfileSkeleton";

const inputClass =
  "h-9 w-full rounded border border-[#d5c39b] bg-transparent px-3 text-[11px] text-[#f0ddb0] outline-none placeholder:text-[#aa8e5b] read-only:cursor-default focus:border-[#d2a13d] disabled:cursor-not-allowed disabled:opacity-60";

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const token = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const query = useQuery({
    queryKey: ["retailer", "me"],
    queryFn: ({ signal }) => getMyRetailer(token!, signal),
    enabled: Boolean(token),
  });

  if (
    status === "loading" ||
    query.isLoading ||
    (status === "authenticated" && !token)
  )
    return <ProfileSkeleton />;
  if (!token)
    return (
      <DashboardState
        type="error"
        message="Your session token is missing. Please log in again."
      />
    );
  if (query.isError)
    return (
      <DashboardState
        type="error"
        message={
          query.error instanceof Error
            ? query.error.message
            : "Something went wrong while loading your retailer profile."
        }
        onRetry={() => query.refetch()}
      />
    );
  if (!query.data)
    return (
      <DashboardState
        type="empty"
        message="Your retailer profile was not found."
      />
    );

  return (
    <ProfileEditor
      key={query.data._id}
      initialRetailer={query.data}
      token={token}
    />
  );
}

function ProfileEditor({
  initialRetailer,
  token,
}: {
  initialRetailer: RetailerProfile;
  token: string;
}) {
  const [retailer, setRetailer] = useState(initialRetailer);
  const [savedRetailer, setSavedRetailer] = useState(initialRetailer);
  const [editing, setEditing] = useState<"shop" | "contact" | null>(null);
  const [logo, setLogo] = useState<File>();
  const [banner, setBanner] = useState<File>();
  const [logoPreview, setLogoPreview] = useState<string>();
  const [bannerPreview, setBannerPreview] = useState<string>();
  const [validationError, setValidationError] = useState("");
  const queryClient = useQueryClient();
  const verificationStatus =
    retailer.userId?.verified || retailer.userId?.verfied;

  const mutation = useMutation({
    mutationFn: (input: RetailerProfileInput) =>
      updateRetailerProfile(token, retailer._id, input, { logo, banner }),
    onSuccess: (data) => {
      releasePreview(logoPreview);
      releasePreview(bannerPreview);
      setRetailer(data);
      setSavedRetailer(data);
      setEditing(null);
      setLogo(undefined);
      setBanner(undefined);
      setLogoPreview(undefined);
      setBannerPreview(undefined);
      setValidationError("");
      queryClient.setQueryData(["retailer", "me"], data);
      toast.success("Retailer profile updated successfully");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Profile update failed",
      ),
  });

  useEffect(
    () => () => {
      releasePreview(logoPreview);
      releasePreview(bannerPreview);
    },
    [bannerPreview, logoPreview],
  );

  const field = (
    key: keyof RetailerProfileInput,
    value: string,
  ) => {
    setRetailer((current) => ({ ...current, [key]: value }));
    setValidationError("");
  };

  const chooseLogo = (file?: File) => {
    releasePreview(logoPreview);
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : undefined);
    setEditing("shop");
  };

  const chooseBanner = (file?: File) => {
    releasePreview(bannerPreview);
    setBanner(file);
    setBannerPreview(file ? URL.createObjectURL(file) : undefined);
  };

  const cancel = () => {
    releasePreview(logoPreview);
    releasePreview(bannerPreview);
    setRetailer(savedRetailer);
    setEditing(null);
    setLogo(undefined);
    setBanner(undefined);
    setLogoPreview(undefined);
    setBannerPreview(undefined);
    setValidationError("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      storeName: retailer.storeName.trim(),
      address: retailer.address.trim(),
      phoneNumber: retailer.phoneNumber.trim(),
      city: retailer.city.trim(),
      description: retailer.description?.trim() || "",
    };
    if (!input.storeName)
      return setValidationError("Shop name is required.");
    if (!input.city) return setValidationError("City is required.");
    if (!input.address) return setValidationError("Address is required.");
    if (!input.phoneNumber)
      return setValidationError("Phone number is required.");
    mutation.mutate(input);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
      <ProfileHero
        name={retailer.storeName || "Retailer"}
        profilePicture={logoPreview || retailer.logo}
        banner={bannerPreview || retailer.banner}
        verified={verificationStatus?.toLowerCase() === "verified"}
        editable
        onImageChange={chooseLogo}
      />

      <div className="mt-4">
        <SubscriptionSummary
          plan={retailer.subscriptionPlan}
          status={retailer.subscriptionStatus}
          expiresAt={retailer.userId?.subscriptionExpiry}
        />
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <FormSection
          title="Shop Information"
          editing={editing === "shop"}
          onEdit={() => setEditing("shop")}
          onCancel={cancel}
          pending={mutation.isPending}
        >
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
            <Field
              label="Shop Name"
              value={retailer.storeName}
              onChange={(value) => field("storeName", value)}
              disabled
              required
            />
            <Field
              label="Store URL"
              value={retailer.storeSlug || ""}
              onChange={() => undefined}
              readOnly
            />
            <label className="flex flex-col gap-1.5 text-[11px] sm:col-span-2">
              <span>Shop Description</span>
              <textarea
                value={retailer.description || ""}
                onChange={(event) => field("description", event.target.value)}
                placeholder="Describe your cigar shop"
                readOnly={editing !== "shop"}
                className={`${inputClass} h-20 resize-none py-3`}
              />
            </label>
            {editing === "shop" && (
              <FileField
                label="Banner Image"
                helper={
                  banner?.name ||
                  (retailer.banner
                    ? "Current banner will be kept unless replaced."
                    : "Upload a banner for your shop profile.")
                }
                onChange={chooseBanner}
              />
            )}
            <ReadOnlyValue
              label="Review Status"
              value={retailer.status}
            />
          </div>
        </FormSection>

        <FormSection
          title="Contact & Location"
          editing={editing === "contact"}
          onEdit={() => setEditing("contact")}
          onCancel={cancel}
          pending={mutation.isPending}
        >
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
            <Field
              label="Phone Number"
              value={retailer.phoneNumber}
              onChange={(value) => field("phoneNumber", value)}
              placeholder="+8801712345678"
              type="tel"
              readOnly={editing !== "contact"}
              required
            />
            <Field
              label="City"
              value={retailer.city}
              onChange={(value) => field("city", value)}
              readOnly={editing !== "contact"}
              required
            />
            <label className="flex flex-col gap-1.5 text-[11px] sm:col-span-2">
              <span>Address</span>
              <textarea
                required
                value={retailer.address}
                onChange={(event) => field("address", event.target.value)}
                placeholder="Enter your full shop address"
                readOnly={editing !== "contact"}
                className={`${inputClass} h-20 resize-none py-3`}
              />
            </label>
          </div>
        </FormSection>

        {(validationError || mutation.isError) && (
          <p
            role="alert"
            className="rounded border border-red-400/30 bg-red-500/10 p-3 text-[10px] text-red-200"
          >
            {validationError ||
              (mutation.error instanceof Error
                ? mutation.error.message
                : "Profile update failed")}
          </p>
        )}
      </form>
    </div>
  );
}

function FormSection({
  title,
  editing,
  onEdit,
  onCancel,
  pending,
  children,
}: {
  title: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md bg-[#59401f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={onCancel}
              className="h-7 rounded border border-[#b88b35] px-3 text-[9px] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              className="h-7 rounded bg-[#d2a13d] px-3 text-[9px] font-semibold text-[#291806] disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`Edit ${title}`}
            onClick={onEdit}
            className="text-[#f0d796] transition hover:text-[#d2a13d]"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[11px]">
      <span>{label}</span>
      <input
        className={inputClass}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
      />
    </label>
  );
}

function FileField({
  label,
  helper,
  onChange,
}: {
  label: string;
  helper: string;
  onChange: (file?: File) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[11px] sm:col-span-2">
      <span>{label}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0])}
        className="block w-full rounded border border-[#d5c39b] bg-transparent p-2 text-[10px] file:mr-3 file:rounded file:border-0 file:bg-[#d2a13d] file:px-3 file:py-1.5 file:text-[#291806]"
      />
      <small className="text-[9px] text-[#bca37b]">
        {helper} Large images are optimized automatically before upload.
      </small>
    </label>
  );
}

function ReadOnlyValue({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-[11px]">
      <span>{label}</span>
      <span className={`${inputClass} flex items-center capitalize`}>
        {value?.replaceAll("_", " ") || "—"}
      </span>
    </div>
  );
}

function SubscriptionSummary({
  plan,
  status,
  expiresAt,
}: {
  plan?: RetailerProfile["subscriptionPlan"];
  status?: RetailerProfile["subscriptionStatus"];
  expiresAt?: string;
}) {
  const isActive = status === "active";

  return (
    <div className="overflow-hidden rounded-md border border-[#d5c39b]/30 bg-[#392711]/60 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d5c39b]/15 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[#f0ddb0]">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d2a13d]/15 text-[#d2a13d]">
            <CreditCard size={14} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#aa8e5b]">
              Subscription
            </p>
            <p className="text-xs font-semibold capitalize">
              {plan && plan !== "none" ? `${plan} plan` : "No active plan"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-wide ${
            isActive
              ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/25 bg-amber-500/10 text-amber-200"
          }`}
        >
          <CheckCircle2 size={10} aria-hidden="true" />
          {status?.replaceAll("_", " ") || "Inactive"}
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 text-[10px] text-[#bca37b]">
        <CalendarDays size={13} className="text-[#d2a13d]" aria-hidden="true" />
        <span>Valid until</span>
        <span className="font-medium text-[#f0ddb0]">
          {formatSubscriptionDate(expiresAt)}
        </span>
      </div>
    </div>
  );
}

function formatSubscriptionDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function releasePreview(value?: string) {
  if (value) URL.revokeObjectURL(value);
}
