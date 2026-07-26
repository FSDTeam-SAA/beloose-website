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
  const banner = retailer?.banner || "/assets/images/hero.png";
  const location = retailer
    ? [retailer.address, retailer.city].filter(Boolean).join(" · ")
    : "";

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-[#120805] text-white sm:min-h-[720px] lg:min-h-[840px]">
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
        className="z-[-3] object-cover object-center"
      />

      <div className="absolute inset-0 z-[-2] bg-[#160B05]/55" />
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(35,17,7,0.12)_0%,rgba(13,6,3,0.22)_48%,rgba(8,3,1,0.58)_100%)]" />

      <div className="container py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          {retailer?.logo && (
            <div className="relative mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border border-[#D0A33E]/50 bg-[#17100A]/80 shadow-[0_10px_35px_rgba(0,0,0,0.4)] sm:h-24 sm:w-24">
              <Image
                src={retailer.logo}
                alt={`${retailer.storeName} logo`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          )}

          <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.08em] text-[#F2DFC1] sm:text-xs">
            Welcome to
          </p>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold leading-[1.05] text-[#F5E1BF] drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] sm:text-5xl lg:text-[58px]">
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

          <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-[#F5E7D0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:text-sm">
            {retailer?.description ||
              "Scan, search, locate, discover, enjoy. Your guide to finding the perfect cigar on the shelf."}
          </p>

          {(location || retailer?.phoneNumber) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#E5D5BC] sm:text-xs">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#D0A33E]" />
                  {location}
                </span>
              )}
              {retailer?.phoneNumber && (
                <a
                  href={`tel:${retailer.phoneNumber.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 transition hover:text-[#D0A33E]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#D0A33E]" />
                  {retailer.phoneNumber}
                </a>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`${storePath}/all-products`}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[3px] bg-[#D0A33E] px-5 text-xs font-medium text-[#1C1207] transition-colors hover:bg-[#E0B44F] sm:w-auto"
            >
              <CircleCheck className="h-4 w-4" />
              Browse All Cigars
            </Link>

            <Link
              href={`${storePath}/quiz`}
              className="inline-flex h-10 w-full items-center justify-center gap-3 rounded-[3px] border border-[#CBA24A]/80 bg-black/15 px-6 text-xs font-medium text-[#F7E4C5] backdrop-blur-[2px] transition-colors hover:bg-[#CBA24A]/15 sm:w-auto"
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
