"use client";

import { Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const GuidedDiscovery = () => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];

  return (
    <section
      id="cigar-finder"
      className="store-section scroll-mt-24 bg-[#0F0E0D] text-white"
      aria-labelledby="guided-discovery-title"
    >
      <div className="container">
        <div className="rounded-2xl border border-[#373330] bg-[#191715] px-5 py-8 shadow-[0_16px_45px_rgba(0,0,0,0.18)] sm:px-10 sm:py-10 lg:px-12 lg:py-11">
          <Compass
            className="h-8 w-8 text-[#D4A94A]"
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <h2
            id="guided-discovery-title"
            className="mt-4 font-playfair text-2xl text-[#F0E8DF] sm:text-3xl"
          >
            Guided Discovery
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#9E9790] sm:text-base sm:leading-6">
            Not sure what to smoke? Answer a few questions and we&apos;ll
            recommend cigars with a personalized explanation of why each one
            fits your taste.
          </p>

          <Link
            href={`/store/${encodeURIComponent(storeName)}/quiz`}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D2A64B] px-6 text-sm font-semibold text-[#171109] shadow-[0_10px_24px_rgba(203,162,74,0.14)] transition duration-200 hover:bg-[#E0B44F] hover:shadow-[0_12px_30px_rgba(203,162,74,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0CF76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191715] sm:w-auto"
          >
            Start Discovery
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GuidedDiscovery;
