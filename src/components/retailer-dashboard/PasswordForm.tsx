"use client";

import { changePassword } from "@/lib/profileInfo";
import { getMyRetailer } from "@/lib/retailer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import DashboardState from "./DashboardState";
import ProfileHero from "./ProfileHero";
import ProfileSkeleton from "./ProfileSkeleton";

const emptyValues = { oldPassword: "", newPassword: "", confirmPassword: "" };

export default function PasswordForm() {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { accessToken?: string; fullName?: string; profilePicture?: string } | undefined;
  const token = sessionUser?.accessToken;
  const query = useQuery({ queryKey: ["retailer", "me"], queryFn: ({ signal }) => getMyRetailer(token!, signal), enabled: Boolean(token) });
  const [values, setValues] = useState(emptyValues);
  const mutation = useMutation({
    mutationFn: () => changePassword(token!, values),
    onSuccess: data => { toast.success(data?.message || "Password updated successfully"); setValues(emptyValues); },
    onError: error => toast.error(error instanceof Error ? error.message : "Password update failed"),
  });
  const rules = passwordRules(values.newPassword);
  const confirmationMatches = Boolean(values.confirmPassword) && values.newPassword === values.confirmPassword;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!rules.every(rule => rule.valid)) return toast.error("Please meet all password requirements");
    if (!confirmationMatches) return toast.error("New passwords do not match");
    mutation.mutate();
  };

  if (status === "loading" || query.isLoading) return <ProfileSkeleton/>;
  if (!token) return <DashboardState type="error" message="Your session token is missing. Please log in again."/>;
  if (query.isError) return <DashboardState type="error" message={query.error instanceof Error ? query.error.message : "Something went wrong while loading your profile."} onRetry={() => query.refetch()}/>;
  const profile = query.data;
  const name = profile?.storeName || sessionUser?.fullName || "Retailer";

  return <div className="min-h-[calc(100vh-72px)] bg-[#3b2918] p-3 sm:p-4">
    <ProfileHero name={name} profilePicture={profile?.logo || sessionUser?.profilePicture} banner={profile?.banner}/>
    <form onSubmit={submit} className="mt-4 rounded-lg border border-[#d5c39b] bg-[#543b1f] p-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
        <PasswordField label="Current Password" value={values.oldPassword} onChange={oldPassword => setValues(current => ({ ...current, oldPassword }))}/>
        <PasswordField label="New Password" value={values.newPassword} onChange={newPassword => setValues(current => ({ ...current, newPassword }))}/>
        <div className="sm:col-span-2"><PasswordField label="Confirm New Password" value={values.confirmPassword} invalid={Boolean(values.confirmPassword) && !confirmationMatches} onChange={confirmPassword => setValues(current => ({ ...current, confirmPassword }))}/></div>
      </div>
      <ul className="mt-4 space-y-2 text-[10px] text-[#9eb3a9]" aria-label="Password requirements">{rules.map(rule => <li key={rule.label} className={`flex items-center gap-2 ${rule.valid ? "text-[#9eb3a9]" : "text-[#d09c2e]"}`}>{rule.valid ? <Check size={13}/> : <X size={13}/>}<span>{rule.label}</span></li>)}</ul>
      {mutation.isError && <p role="alert" className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{mutation.error instanceof Error ? mutation.error.message : "Password update failed"}</p>}
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setValues(emptyValues)} className="h-9 min-w-[102px] rounded-md border border-[#bd8b25] px-4 text-[9px] text-[#e1b451] transition hover:bg-[#60451f]">Cancel</button><button disabled={mutation.isPending} className="h-9 min-w-[96px] rounded-md bg-[#d2a13d] px-4 text-[9px] font-semibold text-white transition hover:bg-[#dfb34f] disabled:opacity-60">{mutation.isPending ? "Saving..." : "Save Changes"}</button></div>
    </form>
  </div>;
}

function passwordRules(password: string) {
  return [
    { label: "Minimum 8–12 characters (recommend 12+ for stronger security).", valid: password.length >= 8 },
    { label: "At least one uppercase letter must.", valid: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter must.", valid: /[a-z]/.test(password) },
    { label: "At least one number must (0–9).", valid: /\d/.test(password) },
    { label: "At least special character (! @ # $ % ^ & * etc.).", valid: /[^A-Za-z0-9\s]/.test(password) },
    { label: "No spaces allowed.", valid: password.length > 0 && !/\s/.test(password) },
  ];
}

function PasswordField({ label, value, onChange, invalid }: { label: string; value: string; onChange: (value: string) => void; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return <label className="relative flex flex-col gap-1.5 text-[11px]"><span>{label}</span><input required minLength={8} type={show ? "text" : "password"} value={value} onChange={event => onChange(event.target.value)} className={`h-10 w-full rounded border bg-transparent px-3 pr-11 text-xs text-[#f0ddb0] outline-none focus:border-[#d2a13d] ${invalid ? "border-red-500" : "border-[#d5c39b]"}`}/><button type="button" onClick={() => setShow(current => !current)} aria-label={show ? "Hide password" : "Show password"} className="absolute bottom-3 right-3 text-[#e6d5a8]">{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button></label>;
}
