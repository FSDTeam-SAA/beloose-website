"use client";

import LandingImage from "@/components/website/landing-image";
import { landingText } from "@/lib/landingText";
import { getRetailerBenefits } from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

const fallbackBenefits = {
  images: ["/assets/images/business-benefits.png"],
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
  const liveFeatures =
    live?.features?.map(landingText).filter(Boolean) || [];
  const content = {
    images: liveImages.length ? liveImages : fallbackBenefits.images,
    title: landingText(live?.title) || fallbackBenefits.title,
    subTitle: landingText(live?.subTitle) || fallbackBenefits.subTitle,
    features: liveFeatures.length ? liveFeatures : fallbackBenefits.features,
  };

  return (
    <section className="bg-[#1b1006] py-16 text-[#d7c08c] sm:py-20 lg:py-[92px]">
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid items-center gap-9 md:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:gap-14">
          <div className="mx-auto w-full max-w-[520px] md:mx-0">
            <BenefitsGallery images={content.images} />
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

function BenefitsGallery({ images }: { images: string[] }) {
  if (images.length === 1) {
    return (
      <LandingImage
        src={images[0]}
        fallbackSrc={fallbackBenefits.images[0]}
        alt="Premium cigar retail spaces and cigar presentation"
        width={648}
        height={520}
        sizes="(min-width: 1024px) 520px, (min-width: 768px) 48vw, 100vw"
        className="aspect-[648/520] h-auto w-full object-cover"
      />
    );
  }

  const visibleImages = images.slice(0, 4);
  return (
    <div className="grid aspect-[648/520] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-[5px]">
      {visibleImages.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`relative overflow-hidden ${
            visibleImages.length === 2 ||
            (visibleImages.length === 3 && index === 0)
              ? "row-span-2"
              : ""
          }`}
        >
          <LandingImage
            src={image}
            fallbackSrc={fallbackBenefits.images[0]}
            alt={`Premium cigar retail space ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 260px, (min-width: 768px) 24vw, 50vw"
            className="object-cover"
          />
          {index === visibleImages.length - 1 && images.length > 4 && (
            <span className="absolute inset-0 grid place-items-center bg-black/60 font-serif text-2xl text-[#f4dfad]">
              +{images.length - 4}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default BusinessBenefits;
