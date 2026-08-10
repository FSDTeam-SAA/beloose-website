"use client";

import LandingImage from "@/components/website/landing-image";
import { landingText } from "@/lib/landingText";
import { getRetailerBenefits } from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

const fallbackBenefits = {
  media: [
    { type: "image" as const, src: "/assets/images/business-benefits.png" },
  ],
  title: "Built to Help Retailers Sell More Cigars",
  subTitle:
    "Humidor411 is not inventory software — it is a revenue-generating operating platform that makes your store smarter, your team more productive, and your customers more satisfied.",
  features: [
    "Increase sales and average ticket value",
    "Improve profitability per transaction",
    "Save employee time on routine questions",
    "Reduce customer wait times significantly",
    "Deliver a better premium shopping experience",
    "Manage inventory faster with fewer errors",
    "Engage premium customers more deeply",
  ],
};

const BusinessBenefits = () => {
  const query = useQuery({
    queryKey: ["retailer-landing", "benefits"],
    queryFn: ({ signal }) => getRetailerBenefits(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const live = query.data;
  const liveImages = live?.images?.filter((image) => image?.trim()) || [];
  const liveVideos = live?.video?.filter((video) => video?.trim()) || [];
  const liveMedia = [
    ...liveImages.map((src) => ({ type: "image" as const, src })),
    ...liveVideos.map((src) => ({ type: "video" as const, src })),
  ].slice(0, 3);
  const liveFeatures =
    live?.features?.map(landingText).filter(Boolean) || [];
  const content = {
    media: liveMedia.length ? liveMedia : fallbackBenefits.media,
    title: landingText(live?.title) || fallbackBenefits.title,
    subTitle: landingText(live?.subTitle) || fallbackBenefits.subTitle,
    features: liveFeatures.length ? liveFeatures : fallbackBenefits.features,
  };

  if (live?.isActive === false) return null;

  return (
    <section
      id="business-benefits"
      className="bg-[#1b1006] py-16 text-[#d7c08c] sm:py-20 lg:py-[92px]"
    >
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid items-center gap-9 md:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:gap-14">
          <div className="mx-auto w-full max-w-[520px] md:mx-0">
            <BenefitsGallery media={content.media} />
          </div>

          <div className="mx-auto w-full max-w-[560px] md:mx-0">
            <p className="mb-4 text-[9px] font-semibold uppercase leading-none tracking-[0.22em] text-[#bd9142]">
              Business Benefits
            </p>

            <h2 className="max-w-[520px] font-serif text-[37px] font-bold leading-[0.95] text-[#f4dfad] sm:text-[46px] lg:text-[52px]">
              {content.title}
            </h2>

            <p className="mt-5 max-w-[590px] text-[13px] leading-[1.35] text-[#a98f5d] sm:text-sm">
              {content.subTitle}
            </p>

            <ul className="mt-8 space-y-3">
              {content.features.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-[13px] leading-none text-[#c4aa76]"
                >
                  <Check className="mt-[-1px] h-3.5 w-3.5 flex-none text-[#d0a13d]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

type BenefitMedia = { type: "image" | "video"; src: string };

function BenefitsGallery({ media }: { media: BenefitMedia[] }) {
  if (media.length === 1) {
    return <MediaItem item={media[0]} index={0} single />;
  }

  return (
    <div className="grid aspect-[648/520] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-[5px]">
      {media.map((item, index) => (
        <div
          key={`${item.type}-${item.src}-${index}`}
          className={`relative overflow-hidden ${
            media.length === 2 || (media.length === 3 && index === 0)
              ? "row-span-2"
              : ""
          }`}
        >
          <MediaItem item={item} index={index} />
        </div>
      ))}
    </div>
  );
}

function MediaItem({
  item,
  index,
  single = false,
}: {
  item: BenefitMedia;
  index: number;
  single?: boolean;
}) {
  const className = single
    ? "aspect-[648/520] h-auto w-full rounded-[5px] object-cover"
    : "h-full w-full object-cover";

  if (item.type === "video") {
    return (
      <video
        src={item.src}
        controls
        playsInline
        preload="metadata"
        aria-label={`Business benefit video ${index + 1}`}
        className={className}
      />
    );
  }

  return (
    <LandingImage
      src={item.src}
      fallbackSrc={fallbackBenefits.media[0].src}
      alt={`Premium cigar retail space ${index + 1}`}
      width={single ? 648 : 324}
      height={single ? 520 : 260}
      sizes={
        single
          ? "(min-width: 1024px) 520px, (min-width: 768px) 48vw, 100vw"
          : "(min-width: 1024px) 260px, (min-width: 768px) 24vw, 50vw"
      }
      className={className}
    />
  );
}

export default BusinessBenefits;
