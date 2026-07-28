"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleCheck, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRetailerBySlug } from "@/lib/retailer";

const StoreUserHero = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const query = useQuery({
    queryKey: ["store", storeName, "retailer-profile"],
    queryFn: ({ signal }) => getRetailerBySlug(storeName, signal),
    enabled: Boolean(storeName),
    staleTime: 5 * 60_000,
  });
  const retailer = query.data;
  const banner = retailer?.banner?.trim() || "/assets/images/hero.png";
  const logo = retailer?.logo?.trim() || "/assets/images/logo.png";
  const location = retailer
    ? [retailer.address, retailer.city].filter(Boolean).join(" · ")
    : "";

  return (
    <section
      aria-labelledby="store-hero-title"
      className="relative isolate flex min-h-[390px] items-center overflow-hidden bg-[#120805] text-white sm:min-h-[500px] lg:min-h-[560px]"
    >
      <Image
        src={banner}
        alt={
          retailer?.storeName
            ? `${retailer.storeName} storefront`
            : "Premium cigars displayed inside a humidor"
        }
        fill
        priority
        sizes="100vw"
        className="z-[-3] object-cover object-[center_35%]"
      />

      {/* <div className="absolute inset-0 z-[-2] bg-[#160B05]/60" /> */}
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_bottom,rgba(10,5,2,0.12),rgba(10,5,2,0.32)_62%,#0F0E0D_100%),radial-gradient(circle_at_center,rgba(35,17,7,0.08)_0%,rgba(8,3,1,0.52)_100%)]" />

      <div className="container py-10 text-center sm:py-12 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-[#D0A33E]/60 bg-[#17100A]/80 shadow-[0_10px_35px_rgba(0,0,0,0.4)] sm:h-24 sm:w-24">
            <Image
              src={logo}
              alt={retailer?.storeName ? `${retailer.storeName} logo` : "Humidor411 logo"}
              fill
              sizes="(min-width: 640px) 96px, 80px"
              className="rounded-full object-cover"
            />
          </div>

          <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.08em] text-[#F2DFC1] sm:text-xs">
            Welcome to
          </p>

          <h1
            id="store-hero-title"
            className="text-balance font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-[1.08] text-[#F5E1BF] drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] sm:text-5xl lg:text-[52px]"
          >
            {retailer?.storeName ? (
              <span className="text-[#D0A33E]">{retailer.storeName}</span>
            ) : (
              <>
                The World of
                <br />
                <span className="text-[#D0A33E]">Premium Cigars</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-[#F5E7D0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:mt-4 sm:text-sm sm:leading-6">
            {retailer?.description ||
              "Scan, search, locate, discover, enjoy. Your guide to finding the perfect cigar on the shelf."}
          </p>

          {(location || retailer?.phoneNumber) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#E5D5BC] sm:text-xs">
              {location && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-[#D0A33E]" />
                  <span className="truncate">{location}</span>
                </span>
              )}
              {retailer?.phoneNumber && (
                <a
                  href={`tel:${retailer.phoneNumber.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-sm transition hover:border-[#D0A33E]/40 hover:text-[#D0A33E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0A33E]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#D0A33E]" />
                  {retailer.phoneNumber}
                </a>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
            <Link
              href={`${storePath}/all-products`}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D0A33E] px-6 text-xs font-semibold text-[#1C1207] shadow-[0_8px_24px_rgba(203,162,74,0.2)] transition hover:-translate-y-0.5 hover:bg-[#E0B44F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2CB70] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120805] sm:w-auto"
            >
              <CircleCheck className="h-4 w-4" />
              Browse All Cigars
            </Link>

            <Link
              href={`${storePath}/quiz`}
              className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#CBA24A]/65 bg-black/25 px-6 text-xs font-medium text-[#F7E4C5] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#D9AE50] hover:bg-[#CBA24A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2CB70] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120805] sm:w-auto"
            >
              Guided Discovery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreUserHero;
