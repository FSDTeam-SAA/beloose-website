"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LandingContentState from "@/components/website/landing-content-state";
import LandingImage from "@/components/website/landing-image";
import {
  getRetailerPlatform,
  type RetailerPlatformFeature,
} from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Box,
  Crown,
  Grid2X2,
  Package,
  QrCode,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fallbackPlatform = {
  image: "/assets/images/the-platform.jpg",
  platformLabel: "The Platform",
  title: "Why Retailers Choose",
  highlightedTitle: "Humidor411",
  description:
    "Purpose-built for premium cigar retailers — not adapted from generic inventory software. Every feature serves the specific demands of your business and your customers.",
  imageLabel: "Designed for the Discerning Retailer",
  imageTitle: "Six tools. One seamless platform.",
  features: [
    {
      icon: "package",
      title: "Inventory Management",
      description:
        "Receive shipments, track stock levels, and manage your entire catalog with precision. Never lose sight of what you carry.",
    },
    {
      icon: "warehouse",
      title: "Humidor Management",
      description:
        "Map every cigar to its exact location inside any humidor. Know where everything lives, down to the shelf.",
    },
    {
      icon: "qr-code",
      title: "QR Customer Experience",
      description:
        "Customers scan, discover, and explore your inventory independently - freeing staff to sell, recommend, and build relationships.",
    },
    {
      icon: "grid",
      title: "Shelf Assignment",
      description:
        "Assign precise shelf locations for every product. Build a living, accurate map of your floor at all times.",
    },
    {
      icon: "users",
      title: "Staff Productivity",
      description:
        "Streamline daily workflows so your team focuses on high-value interactions - recommendations, upsells, and loyal relationships.",
    },
    {
      icon: "bar-chart",
      title: "Business Insights",
      description:
        "Understand what sells, what sits, and where revenue comes from. Make smarter buying decisions with every reorder.",
    },
  ],
};

const iconMap: Record<string, LucideIcon> = {
  box: Box,
  package: Package,
  inventory: Package,
  warehouse: Warehouse,
  humidor: Warehouse,
  "qr-code": QrCode,
  qrcode: QrCode,
  qr: QrCode,
  grid: Grid2X2,
  shelf: Grid2X2,
  users: Users,
  staff: Users,
  "bar-chart": BarChart3,
  analytics: BarChart3,
  insights: BarChart3,
};

function getFeatureIcon(feature: RetailerPlatformFeature) {
  const key = feature.icon?.trim().toLowerCase().replace(/[\s_]+/g, "-") || "";
  return iconMap[key] || Box;
}

const ThePlatform = () => {
  const query = useQuery({
    queryKey: ["retailer-landing", "platform"],
    queryFn: ({ signal }) => getRetailerPlatform(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isLoading) return <PlatformSkeleton />;

  const live = query.data;
  const liveFeatures =
    live?.features?.filter(
      (feature) => feature?.title?.trim() || feature?.description?.trim(),
    ) || [];
  const content = {
    image: live?.image?.trim() || fallbackPlatform.image,
    platformLabel:
      live?.platformLabel?.trim() || fallbackPlatform.platformLabel,
    title: live?.title?.trim() || fallbackPlatform.title,
    highlightedTitle:
      live?.highlightedTitle?.trim() || fallbackPlatform.highlightedTitle,
    description: live?.description?.trim() || fallbackPlatform.description,
    imageLabel: live?.imageLabel?.trim() || fallbackPlatform.imageLabel,
    imageTitle: live?.imageTitle?.trim() || fallbackPlatform.imageTitle,
    features: liveFeatures.length ? liveFeatures : fallbackPlatform.features,
  };

  return (
    <section className="bg-[#150b04] py-16 text-[#d7c08c] sm:py-20 lg:py-[88px]">
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start lg:gap-16">
          <div>
            <p className="mb-5 text-[9px] font-semibold uppercase leading-none tracking-[0.13em] text-[#bd9142]">
              {content.platformLabel}
            </p>
            <h2 className="max-w-[470px] font-serif text-[36px] font-bold leading-[1.02] text-[#f3dfaf] sm:text-[44px] lg:text-[48px]">
              {content.title}{" "}
              <span className="block italic text-[#d4a23f]">
                {content.highlightedTitle}
              </span>
            </h2>
          </div>

          <p className="max-w-[470px] text-[15px] leading-[1.35] text-[#b59964] md:ml-auto md:pt-9">
            {content.description}
          </p>
        </div>

        <div className="relative mt-9 min-h-[126px] overflow-hidden rounded-[3px] bg-[#251307] sm:mt-10">
          <LandingImage
            src={content.image}
            fallbackSrc={fallbackPlatform.image}
            alt="Premium retail interior lighting"
            fill
            sizes="(min-width: 1024px) 1010px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#2b1205]/45" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#100804]/40 to-transparent" />
          <div className="relative flex min-h-[126px] flex-col items-center justify-center px-5 text-center">
            <p className="mb-2 text-[8px] font-medium uppercase leading-none tracking-[0.12em] text-[#dbc48d]/80">
              {content.imageLabel}
            </p>
            <h3 className="font-serif text-[19px] font-bold leading-tight text-[#f3dfaf] sm:text-[24px]">
              {content.imageTitle}
            </h3>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.features.map((feature, index) => {
            const Icon = getFeatureIcon(feature);
            return (
              <article
                key={`${feature.title || "Platform feature"}-${index}`}
                className="rounded-[5px] border border-[#5c3714]/45 bg-[#201207] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.12)]"
              >
                <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#d3a33e]/45 bg-[#9e741e]/35 text-[#d3a33e]">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </div>
                <h3 className="font-serif text-[14px] font-bold leading-none text-[#f2ddb0]">
                  {feature.title?.trim() || "Platform feature"}
                </h3>
                <p className="mt-4 text-[10px] leading-[1.35] text-[#a98f5d]">
                  {feature.description?.trim() ||
                    "More details about this platform feature are coming soon."}
                </p>
              </article>
            );
          })}
        </div>

        {(query.isError || !live) && (
          <LandingContentState
            type={query.isError ? "error" : "empty"}
            message={
              query.isError
                ? "Live platform content could not be loaded. Showing the default content."
                : "No platform content was found. Showing the default content."
            }
            onRetry={query.isError ? () => void query.refetch() : undefined}
          />
        )}

        <div className="relative mt-20 overflow-hidden rounded-[10px] border border-[#c79a42] bg-[#211207] sm:mt-[78px]">
          <Image
            src="/assets/images/subscribe-now.jpg"
            alt="Premium cigar bundles"
            fill
            sizes="(min-width: 1024px) 1010px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#120804]/58" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#160904]/45 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#160904]/55 to-transparent" />
          <div className="relative flex min-h-[142px] flex-col items-center justify-center px-5 py-8 text-center">
            <Crown className="mb-4 h-8 w-8 fill-[#d5a33d] text-[#d5a33d]" />
            <p className="mb-2 text-[8px] font-medium uppercase leading-none tracking-[0.12em] text-[#dbc48d]/80">
              Designed for the Discerning Retailer
            </p>
            <h3 className="max-w-[720px] font-serif text-[22px] font-bold leading-tight text-[#f4dfad] sm:text-[24px]">
              Subscribe To Our Monthly Package to Get The Best Experience
            </h3>
            <Link
              href="/subscription"
              className="mt-5 inline-flex h-8 min-w-[162px] items-center justify-center gap-3 rounded-[3px] bg-[#d5a33d] px-5 text-[11px] font-semibold text-[#1c1006] transition hover:bg-[#e0b657] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cf76]"
            >
              Subscribe Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

function PlatformSkeleton() {
  return (
    <section
      className="bg-[#150b04] py-16 sm:py-20 lg:py-[88px]"
      aria-label="Loading retailer platform"
    >
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-3 w-28 bg-[#513719]" />
            <Skeleton className="h-24 w-full bg-[#513719]" />
          </div>
          <Skeleton className="h-20 w-full bg-[#34200e] md:mt-9" />
        </div>
        <Skeleton className="mt-10 h-[126px] w-full bg-[#34200e]" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[150px] bg-[#34200e]" />
          ))}
        </div>
        <Skeleton className="mt-20 h-[142px] w-full bg-[#34200e]" />
      </div>
    </section>
  );
}

export default ThePlatform;
