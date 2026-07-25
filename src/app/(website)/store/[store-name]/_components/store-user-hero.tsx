"use client"

import { ArrowRight, CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const StoreUserHero = () => {

   const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-[#120805] text-white sm:min-h-[720px] lg:min-h-[840px]">
      <Image
        src="/assets/images/hero.png"
        alt="Premium cigars displayed inside a humidor"
        fill
        priority
        sizes="100vw"
        className="z-[-3] object-cover object-center"
      />

      <div className="absolute inset-0 z-[-2] bg-[#160B05]/55" />
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(35,17,7,0.12)_0%,rgba(13,6,3,0.22)_48%,rgba(8,3,1,0.58)_100%)]" />

      <div className="container py-20 text-center sm:py-24">
        <div>
          <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.08em] text-[#F2DFC1] sm:text-xs">
            Welcome to
          </p>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold leading-[1.05] text-[#F5E1BF] drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] sm:text-5xl lg:text-[58px]">
            The World of
            <br />
            <span className="text-[#D0A33E]">Premium Cigars</span>
          </h1>

          <p className="mt-4 text-xs leading-relaxed text-[#F5E7D0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:text-sm">
            Scan, search, locate, discover, enjoy. Your guide to
            <br className="hidden sm:block" /> finding the perfect cigar on the
            shelf.
          </p>

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
