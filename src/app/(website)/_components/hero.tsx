"use client";

import LandingContentState from "@/components/website/landing-content-state";
import LandingImage from "@/components/website/landing-image";
import { Skeleton } from "@/components/ui/skeleton";
import { landingText } from "@/lib/landingText";
import { getRetailerBanner } from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";

const fallbackBanner = {
  banner: "/assets/images/hero.png",
  title: "The digital operating platform for premium cigar retailers",
  mainTitle:
    "Spend Less Time Managing Your Humidor, Spend More Time Selling Cigars.",
  discription:
    "Humidor411 helps premium cigar retailers organize inventory, guide customers to the right cigars, and increase sales through a smarter in-store experience.",
};

const Hero = () => {
  const query = useQuery({
    queryKey: ["retailer-landing", "banner"],
    queryFn: ({ signal }) => getRetailerBanner(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isLoading) return <HeroSkeleton />;

  const live = query.data;
  const content = {
    banner: live?.banner?.trim() || fallbackBanner.banner,
    title: landingText(live?.title) || fallbackBanner.title,
    mainTitle: landingText(live?.mainTitle) || fallbackBanner.mainTitle,
    discription:
      landingText(live?.discription) || fallbackBanner.discription,
  };

  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-[#120805] text-white sm:min-h-[720px] lg:min-h-[840px]">
      <LandingImage
        src={content.banner}
        fallbackSrc={fallbackBanner.banner}
        alt="Premium cigar humidor showroom"
        fill
        priority
        sizes="100vw"
        className="z-[-3] object-cover object-[52%_48%]"
      />

      <div className="absolute inset-0 z-[-2] bg-[#1a0902]/55" />
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(120,63,18,0.16)_0%,rgba(18,8,5,0.10)_34%,rgba(18,8,5,0.58)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#090402]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090402]/55 to-transparent" />

      <div className="container flex min-h-[640px] flex-col items-center justify-center px-4 pb-16 pt-32 text-center sm:min-h-[720px] sm:pt-36 lg:min-h-[840px] lg:pt-40">
        <div className="mx-auto max-w-[1024px]">
          <p className="mb-2 text-xs font-normal uppercase leading-relaxed tracking-[0.14em] text-[#F7E4B3] md:text-sm">
            {content.title}
          </p>

          <h1 className="font-playfair text-3xl font-semibold leading-normal text-[#F7E4B3] drop-shadow-[0_4px_18px_rgba(0,0,0,0.48)] md:text-4xl lg:text-5xl xl:text-6xl">
            <HeroTitle title={content.mainTitle} />
          </h1>

          <p className="mx-auto mt-5 text-balance text-sm leading-relaxed text-[#F7E4B3] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-base">
            {content.discription}
          </p>
        </div>

        {(query.isError || !live) && (
          <div className="absolute inset-x-4 bottom-5 mx-auto max-w-2xl text-left">
            <LandingContentState
              type={query.isError ? "error" : "empty"}
              message={
                query.isError
                  ? "Live banner could not be loaded. Showing the default banner."
                  : "No live banner was found. Showing the default banner."
              }
              onRetry={query.isError ? () => void query.refetch() : undefined}
            />
          </div>
        )}
      </div>
    </section>
  );
};

function HeroTitle({ title }: { title: string }) {
  const highlight = "Humidor, Spend More";
  const start = title.toLowerCase().indexOf(highlight.toLowerCase());

  if (start === -1) return title;

  return (
    <>
      {title.slice(0, start)}
      <span className="text-[#CBA24A]">
        {title.slice(start, start + highlight.length)}
      </span>
      {title.slice(start + highlight.length)}
    </>
  );
}

function HeroSkeleton() {
  return (
    <section
      className="relative isolate flex min-h-[640px] items-center justify-center overflow-hidden bg-[#120805] sm:min-h-[720px] lg:min-h-[840px]"
      aria-label="Loading retailer banner"
    >
      <LandingImage
        fallbackSrc={fallbackBanner.banner}
        alt=""
        fill
        priority
        sizes="100vw"
        className="z-[-2] object-cover opacity-25"
      />
      <div className="absolute inset-0 z-[-1] bg-[#120805]/75" />
      <div className="w-full max-w-4xl space-y-5 px-6">
        <Skeleton className="mx-auto h-4 w-2/3 bg-[#6e4c22]/55" />
        <Skeleton className="mx-auto h-16 w-full bg-[#6e4c22]/55 sm:h-24" />
        <Skeleton className="mx-auto h-5 w-3/4 bg-[#6e4c22]/55" />
      </div>
    </section>
  );
}

export default Hero;
