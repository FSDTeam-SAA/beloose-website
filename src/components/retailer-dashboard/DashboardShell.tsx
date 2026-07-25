"use client";

import Image from "next/image";
import {
  LogOut,
} from "lucide-react";
import DashboardNav from "./DashboardNav";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import LogoutDialog from "./LogoutDialog";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMyRetailer, RetailerApiError } from "@/lib/retailer";
import { useEffect } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function DashboardShell({ title, subtitle, children }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = session?.user as
    | { fullName?: string; firstName?: string; lastName?: string; email?: string; profilePicture?: string }
    | undefined;
  const token = (user as typeof user & { accessToken?: string })?.accessToken;
  const retailerQuery = useQuery({ queryKey: ["retailer", "me"], queryFn: ({ signal }) => getMyRetailer(token!, signal), enabled: Boolean(token), retry: false, staleTime: 5 * 60 * 1000 });
  useEffect(() => {
    if (retailerQuery.error instanceof RetailerApiError && retailerQuery.error.status === 404) router.replace("/onboarding");
  }, [retailerQuery.error, router]);
  const name =
    retailerQuery.data?.storeName ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Retailer";
  const email = user?.email || "";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="dashboard-copy min-h-screen w-full bg-[#3b2816] font-poppins text-[#f4dfa8] lg:pl-[280px]">
      <aside className="sticky top-0 z-40 flex h-16 w-full items-center bg-[#291806] px-3 font-sans lg:fixed lg:inset-y-0 lg:left-0 lg:h-screen lg:w-[280px] lg:flex-col lg:px-4 lg:py-4">
        <Link href="/" aria-label="Go to home page" className="flex h-14 w-16 shrink-0 items-center justify-center no-underline lg:h-[70px] lg:w-full">
          <Image src="/assets/images/logo.png" alt="Beloose" width={72} height={72} className="h-12 w-12 object-contain lg:h-14 lg:w-14" />
        </Link>

        <DashboardNav />

        <div className="mt-auto hidden w-full lg:block">
          <div className="flex items-center gap-2 px-0.5 py-3">
            <Avatar src={retailerQuery.data?.logo || user?.profilePicture} initials={initials} className="h-9 w-9 text-[9px]" />
            <span className="flex min-w-0 flex-col"><strong className="text-[10px] text-[#ead8ae]">{name}</strong><small className="truncate text-[7px] text-[#80653c]">{email}</small></span>
          </div>
          <button type="button" onClick={() => setLogoutOpen(true)} className="flex h-9 w-full items-center justify-center gap-2 rounded border border-[#e63f4c] text-[11px] text-[#ff4554] transition hover:bg-[#e63f4c] hover:text-white"><LogOut size={17} /> Log out</button>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-16 z-30 flex h-[72px] items-center justify-between border-b border-[#5f401d] bg-[#2d1a08]/95 px-4 backdrop-blur-md sm:px-6 lg:top-0">
          <div><h1 className="text-lg font-bold leading-[120%]">{title}</h1><p className="mt-1 text-[11px] text-[#876d46]">{subtitle}</p></div>
          <div className="flex items-center gap-2">
            <Link href="/retailer-dashboard/settings" aria-label="Open settings" className="flex items-center gap-2 rounded px-1 py-1 no-underline transition hover:bg-[#513719] hover:no-underline">
              <Avatar src={retailerQuery.data?.logo || user?.profilePicture} initials={initials} className="h-8 w-8 text-[8px]" />
              <span className="hidden flex-col sm:flex"><strong className="text-xs text-[#ead4a4]">{name}</strong><small className="text-[9px] text-[#8f7146]">{email}</small></span>
            </Link>
            <button type="button" onClick={() => setLogoutOpen(true)} aria-label="Log out" className="grid h-8 w-8 place-items-center rounded border border-[#e63f4c] text-[#ff4554] transition hover:bg-[#e63f4c] hover:text-white lg:hidden"><LogOut size={15} /></button>
          </div>
        </header>
        {children}
      </section>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={() => signOut({ callbackUrl: "/login" })}/>
    </main>
  );
}

function Avatar({ src, initials, className }: { src?: string; initials: string; className: string }) {
  return <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#c7963d] bg-gradient-to-br from-[#79402d] to-[#17100b] font-bold ${className}`}>{src ? <Image src={src} alt="Profile" fill sizes="36px" className="object-cover"/> : initials}</span>;
}
