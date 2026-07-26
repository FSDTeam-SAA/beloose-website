"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LandingImage from "@/components/website/landing-image";
import { getRetailerAbout } from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const fallbackAbout = {
  image: "/assets/images/ForRetailers.png",
  title: "Run Your Shop Smarter",
  description:
    "Manage cigars, humidors, and inventory with precision. Humidor411 gives your team the tools to organize every product, every shelf, and every walk-in with confidence.",
  features: [
    "Organize cigars by humidor, shelf, and row",
    "Real-time inventory tracking and alerts",
    "QR codes generated per product location",
    "Staff management and role-based access",
    "Sales analytics and trending product reports",
    "Multi-location humidor management",
  ],
};

const ForRetailers = () => {
  const query = useQuery({
    queryKey: ["retailer-landing", "about"],
    queryFn: ({ signal }) => getRetailerAbout(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isLoading) return <ForRetailersSkeleton />;

  const live = query.data;
  const features =
    live?.features?.filter((feature) => feature?.trim()) || [];
  const content = {
    image: live?.image?.trim() || fallbackAbout.image,
    title: live?.title?.trim() || fallbackAbout.title,
    description: live?.description?.trim() || fallbackAbout.description,
    features: features.length ? features : fallbackAbout.features,
  };
  const titleParts = content.title.split(/\s+/);
  const highlightedTitle = titleParts.pop();

  return (
    <section className="bg-[#150b04] py-14 text-[#d4bd86] sm:py-16 lg:py-[76px]">
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid items-center gap-9 md:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-14">
          <div className="relative overflow-hidden rounded-[5px] bg-[#241408] shadow-[0_28px_60px_rgba(0,0,0,0.22)]">
            <LandingImage
              src={content.image}
              fallbackSrc={fallbackAbout.image}
              alt="Cigar retailer holding a tray of cigars"
              width={755}
              height={520}
              sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
              className="aspect-[755/520] h-auto w-full object-cover"
            />
          </div>

          <div className="mx-auto w-full max-w-[520px] md:mx-0">
            <p className="mb-4 text-[9px] font-semibold uppercase leading-none tracking-[0.22em] text-[#c79a42]">
              For Retailers
            </p>

            <h2 className="max-w-[480px] font-serif text-[38px] font-bold leading-[0.95] text-[#f5dfaa] sm:text-[48px] lg:text-[56px]">
              {titleParts.join(" ")}{" "}
              {highlightedTitle && (
                <span className="block text-[#d1a13c]">
                  {highlightedTitle}
                </span>
              )}
            </h2>

            <p className="mt-5 max-w-[560px] text-[13px] leading-[1.45] text-[#b79b67] sm:text-sm">
              {content.description}
            </p>

            <ul className="mt-8 space-y-3">
              {content.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[13px] leading-none text-[#c3aa78]"
                >
                  <Check className="mt-[-1px] h-3.5 w-3.5 flex-none text-[#d0a13d]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/services"
              className="mt-9 inline-flex h-10 items-center justify-center gap-3 rounded-[4px] bg-[#d4a43d] px-5 text-[12px] font-semibold text-[#1c1006] shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition hover:bg-[#e0b657] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cf76]"
            >
              Explore More Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

function ForRetailersSkeleton() {
  return (
    <section
      className="bg-[#150b04] py-14 sm:py-16 lg:py-[76px]"
      aria-label="Loading retailer information"
    >
      <div className="container grid items-center gap-9 px-4 sm:px-6 md:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-8 xl:px-10">
        <Skeleton className="aspect-[755/520] w-full rounded-[5px] bg-[#34200e]" />
        <div className="space-y-5">
          <Skeleton className="h-3 w-28 bg-[#513719]" />
          <Skeleton className="h-24 w-full bg-[#513719]" />
          <Skeleton className="h-16 w-full bg-[#34200e]" />
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full bg-[#34200e]" />
            ))}
          </div>
          <Skeleton className="h-10 w-48 bg-[#513719]" />
        </div>
      </div>
    </section>
  );
}

export default ForRetailers;
