"use client";

import LandingImage from "@/components/website/landing-image";
import {
  getRetailerHowItWorks,
  type RetailerHowItWork,
} from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";

const fallbackSteps = [
  {
    title: "Receive Inventory",
    description:
      "Scan incoming shipments and instantly organize new products. Every cigar is accounted for from the moment it arrives.",
    image: "/assets/images/hiw1.png",
    alt: "Cigar and glasses in a dark lounge setting",
  },
  {
    title: "Assign Shelf Locations",
    description:
      "Map every product to an exact shelf inside your humidor. Build a real-time, accurate picture of your entire walk-in.",
    image: "/assets/images/hiw2.png",
    alt: "Premium cigars displayed inside a humidor",
  },
  {
    title: "Customers Scan & Discover",
    description:
      "Customers scan QR codes throughout your humidor, instantly locate cigars, read tasting notes, and find what they love.",
    image: "/assets/images/hiw3.png",
    alt: "Customer scanning a QR code with a phone",
  },
];

const HowItWorks = () => {
  const query = useQuery({
    queryKey: ["retailer-landing", "how-it-works"],
    queryFn: ({ signal }) => getRetailerHowItWorks(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const liveSteps = query.data?.filter(hasStepContent) || [];
  const steps = liveSteps.length
    ? liveSteps.map((step, index) => {
        const fallback = fallbackSteps[index % fallbackSteps.length];
        return {
          title: step.title?.trim() || fallback.title,
          description: step.description?.trim() || fallback.description,
          image: step.image?.trim() || fallback.image,
          fallbackImage: fallback.image,
          alt: step.title?.trim() || fallback.alt,
        };
      })
    : fallbackSteps.map((step) => ({
        ...step,
        fallbackImage: step.image,
      }));

  return (
    <section className="border-t border-[#3d230d]/45 bg-[#0d0904] py-16 text-[#d7c08c] sm:py-20 lg:py-[86px]">
      <div className="container px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="">
          <div className="text-center">
            <p className="mb-3 text-[8px] font-semibold uppercase leading-none tracking-[0.13em] text-[#987631]">
              How It Works
            </p>
            <h2 className="font-serif text-[38px] font-bold leading-tight text-[#f3dfaf] sm:text-[48px] lg:text-[54px]">
              Three Steps, Infinite Value.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="overflow-hidden rounded-[3px] border border-[#3d260e] bg-[#1c1006] shadow-[0_18px_38px_rgba(0,0,0,0.14)]"
              >
                <LandingImage
                  src={step.image}
                  fallbackSrc={step.fallbackImage}
                  alt={step.alt}
                  width={495}
                  height={180}
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 100vw"
                  className="aspect-[11/4] w-full object-cover"
                />

                <div className="min-h-[96px] px-5 py-5">
                  <h3 className="font-serif text-[14px] font-bold leading-none text-[#f4dfad]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[10px] leading-[1.45] text-[#b2945d]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function hasStepContent(step: RetailerHowItWork) {
  return Boolean(
    step.image?.trim() ||
      step.title?.trim() ||
      step.description?.trim(),
  );
}

export default HowItWorks;
