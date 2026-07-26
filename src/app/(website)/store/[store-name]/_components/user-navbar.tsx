"use client";

import {
  Heart,
  Home,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";

type NavItem = {
  label: string;
  href: string;
  icon?: typeof Sparkles;
};

const UserNavbar = () => {
  const params = useParams<{ "store-name": string }>();
  const pathname = usePathname();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const favoritesPath = `${storePath}/favorites`;
  const favorites = useFavorites(storeName);
  const favoriteCount = favorites.favorites.length;
  const favoritesActive = pathname === favoritesPath;
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Home", href: storePath },
    { label: "All Cigars", href: `${storePath}/all-products` },
    { label: "Daily Featured", href: `${storePath}/daily-featured` },
    { label: "Staff Picks", href: `${storePath}/staff-picks` },
    { label: "New Arrivals", href: `${storePath}/new-arrivals` },
    {
      label: "Surprise Me",
      href: `${storePath}/surprise-me`,
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    const cleanHref = href.split("#")[0];
    if (cleanHref === storePath) return pathname === storePath;
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#151311]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4 sm:h-[70px]">
        <Link
          href={storePath}
          aria-label="Humidor411 store home"
          className="flex shrink-0 items-center gap-2.5"
        >
          <Image
            src="/assets/images/logo.png"
            alt="Humidor411"
            width={46}
            height={44}
            priority
            className="h-10 w-10 object-contain sm:h-11 sm:w-11"
          />
          <span className="font-playfair text-xl text-[#D4A94A] sm:text-2xl">
            Humidor<small className="text-[10px]">411</small>
          </span>
        </Link>

        <nav
          aria-label="Store navigation"
          className="hidden items-center justify-center gap-1 lg:flex xl:gap-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-1 rounded-lg px-2.5 text-[13px] transition xl:px-3 ${
                  active
                    ? "bg-[#CBA24A]/10 text-[#D7AA46]"
                    : "text-[#A49D95] hover:bg-white/[0.04] hover:text-[#E4DDD5]"
                }`}
              >
                {item.label === "Home" && <Home className="h-3.5 w-3.5" />}
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href={`${storePath}/all-products`}
            aria-label="Search cigars"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#A49D95] transition hover:bg-white/[0.05] hover:text-[#D7AA46]"
          >
            <Search className="h-5 w-5" />
          </Link> 
          <Link
            href={favoritesPath}
            aria-label={
              favorites.isReady
                ? `View favorites, ${favoriteCount} saved`
                : "View favorites"
            }
            aria-current={favoritesActive ? "page" : undefined}
            title={
              favorites.isReady
                ? `${favoriteCount} saved ${favoriteCount === 1 ? "cigar" : "cigars"}`
                : "View favorites"
            }
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
              favoritesActive
                ? "bg-[#CBA24A]/15 text-[#D7AA46]"
                : "text-[#A49D95] hover:bg-white/[0.05] hover:text-[#D7AA46]"
            }`}
          >
            <Heart
              className={`h-5 w-5 ${
                favoriteCount > 0 ? "fill-current text-[#D7AA46]" : ""
              }`}
            />
            {favorites.isReady && favoriteCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#151311] bg-[#D5AB48] px-1 text-[9px] font-bold leading-none text-[#241A0C]"
              >
                {favoriteCount > 99 ? "99+" : favoriteCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="store-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#D7AA46] transition hover:bg-white/[0.05] lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="store-mobile-menu"
        className={`absolute inset-x-0 top-full overflow-hidden border-b border-white/[0.08] bg-[#151311] transition-[max-height,opacity] duration-300 lg:hidden ${
          menuOpen
            ? "max-h-[calc(100vh-4rem)] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile store navigation"
          className="container flex flex-col gap-1 py-4"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm transition ${
                  active
                    ? "bg-[#CBA24A]/10 text-[#D7AA46]"
                    : "text-[#AAA29A] hover:bg-white/[0.04] hover:text-[#E4DDD5]"
                }`}
              >
                {item.label === "Home" ? (
                  <Home className="h-4 w-4" />
                ) : Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CBA24A]/60" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-16 -z-10 bg-black/55 backdrop-blur-sm sm:top-[70px] lg:hidden"
        />
      )}
    </header>
  );
};

export default UserNavbar;
