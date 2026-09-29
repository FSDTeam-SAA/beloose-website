"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Sparkles,
  MapPin,
  Heart,
  ArrowRight,
  RotateCcw,
  Clock,
  CircleDollarSign,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import CigarImage from "@/components/common/cigar-image";
import { useFavorites } from "@/hooks/use-favorites";
import {
  getGuidedDiscoveryResults,
  type GuidedDiscoveryItem,
} from "@/lib/guidedDiscovery";

const STRENGTH_TABS = [
  { label: "All", value: "all" },
  { label: "Mild", value: "mild" },
  { label: "Medium", value: "medium" },
  { label: "Full", value: "full" },
];

const TIME_TABS = [
  { label: "Any Time", value: "all" },
  { label: "~1 Hour", value: "60" },
  { label: "1.5 Hours", value: "90" },
  { label: "2+ Hours", value: "120+" },
];

const BUDGET_TABS = [
  { label: "Any Budget", value: "all" },
  { label: "$5–$15", value: "5-15" },
  { label: "$15–$25", value: "15-25" },
  { label: "$25+", value: "25+" },
];

const PREFERENCE_TABS = [
  { label: "All Cigars", value: "all" },
  { label: "Popular Classics", value: "familiar" },
  { label: "New Arrivals", value: "new" },
];

export default function GuidedDiscovery() {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const favorites = useFavorites(storeName);

  const [strength, setStrength] = useState("all");
  const [smokingTime, setSmokingTime] = useState("all");
  const [budget, setBudget] = useState("all");
  const [profile, setProfile] = useState("all");

  const query = useQuery({
    queryKey: [
      "store",
      storeName,
      "guided-discovery-showcase",
      strength,
      smokingTime,
      budget,
      profile,
    ],
    queryFn: ({ signal }) =>
      getGuidedDiscoveryResults(
        storeName,
        {
          strength: strength === "all" ? undefined : strength,
          smokingTime: smokingTime === "all" ? undefined : smokingTime,
          budget: budget === "all" ? undefined : budget,
          profile: profile === "all" ? undefined : profile,
        },
        signal,
        4,
      ),
    enabled: Boolean(storeName),
    staleTime: 60_000,
  });

  const resetFilters = () => {
    setStrength("all");
    setSmokingTime("all");
    setBudget("all");
    setProfile("all");
  };

  const hasActiveFilters =
    strength !== "all" ||
    smokingTime !== "all" ||
    budget !== "all" ||
    profile !== "all";

  const items = query.data?.items ?? [];

  return (
    <section
      id="cigar-finder"
      className="store-section scroll-mt-20 bg-[#0F0D0B] text-white py-12 border-y border-[#261E16]"
      aria-labelledby="guided-discovery-title"
    >
      <div className="container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2A2118]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A94A]/30 bg-[#D4A94A]/10 px-3 py-1 text-xs font-medium text-[#E5C37A] mb-3">
              <Compass className="h-3.5 w-3.5 text-[#D4A94A]" />
              <span>Interactive Cigar Finder</span>
            </div>

            <h2
              id="guided-discovery-title"
              className="font-playfair text-2xl sm:text-3xl lg:text-4xl text-[#F5EAD9]"
            >
              Guided Discovery
            </h2>

            <p className="mt-2 text-sm text-[#A3998F] sm:text-base leading-relaxed">
              Find cigars calibrated to your palate. Filter preferences below for instant matches or take the sommelier quiz for a personalized consultation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#4A3B2D] px-4 text-xs font-medium text-[#C8B39B] transition hover:border-[#D4A94A] hover:text-[#F0DFCD]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}

            <Link
              href={`${storePath}/quiz`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7993E] to-[#E0B44F] px-5 text-xs font-semibold text-[#181107] shadow-[0_8px_20px_rgba(203,162,74,0.18)] transition duration-200 hover:brightness-110 hover:shadow-[0_10px_25px_rgba(203,162,74,0.28)]"
            >
              Take Sommelier Quiz
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#171412] border border-[#2B231A]">
          {/* Strength Filter */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A89886]">
              <Flame className="h-3.5 w-3.5 text-[#D4A94A]" />
              Strength
            </span>
            <div className="flex flex-wrap gap-1">
              {STRENGTH_TABS.map((tab) => {
                const active = strength === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStrength(tab.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[#D4A94A] text-[#1A1206] shadow"
                        : "bg-[#241E18] text-[#B8A793] hover:bg-[#302821] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smoking Time Filter */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A89886]">
              <Clock className="h-3.5 w-3.5 text-[#D4A94A]" />
              Session Length
            </span>
            <div className="flex flex-wrap gap-1">
              {TIME_TABS.map((tab) => {
                const active = smokingTime === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setSmokingTime(tab.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[#D4A94A] text-[#1A1206] shadow"
                        : "bg-[#241E18] text-[#B8A793] hover:bg-[#302821] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Filter */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A89886]">
              <CircleDollarSign className="h-3.5 w-3.5 text-[#D4A94A]" />
              Price Range
            </span>
            <div className="flex flex-wrap gap-1">
              {BUDGET_TABS.map((tab) => {
                const active = budget === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setBudget(tab.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[#D4A94A] text-[#1A1206] shadow"
                        : "bg-[#241E18] text-[#B8A793] hover:bg-[#302821] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood / Discovery Type Filter */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A89886]">
              <Compass className="h-3.5 w-3.5 text-[#D4A94A]" />
              Discovery Style
            </span>
            <div className="flex flex-wrap gap-1">
              {PREFERENCE_TABS.map((tab) => {
                const active = profile === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setProfile(tab.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[#D4A94A] text-[#1A1206] shadow"
                        : "bg-[#241E18] text-[#B8A793] hover:bg-[#302821] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Products Showcase */}
        <div className="mt-8">
          {query.isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#33271D] bg-[#1A1613] p-4 space-y-3 animate-pulse"
                >
                  <div className="h-44 w-full rounded-xl bg-white/[0.05]" />
                  <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
                  <div className="h-8 w-full rounded bg-white/[0.05]" />
                </div>
              ))}
            </div>
          )}

          {query.isError && (
            <div className="rounded-2xl border border-[#5C3B1E] bg-[#1E1610] p-8 text-center">
              <Compass className="mx-auto h-8 w-8 text-[#D4A94A] mb-2" />
              <p className="text-sm text-[#D7C4AE]">
                Could not load live recommendations. Please try again.
              </p>
              <button
                type="button"
                onClick={() => query.refetch()}
                className="mt-4 rounded-lg bg-[#D4A94A] px-4 py-2 text-xs font-semibold text-[#181107]"
              >
                Retry
              </button>
            </div>
          )}

          {!query.isLoading && !query.isError && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#5C4530] bg-[#191410] p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#D4A94A] mb-3" />
              <h3 className="font-playfair text-xl text-[#F3E5D4]">
                No cigars match this exact combination
              </h3>
              <p className="mt-1 text-xs text-[#9E8E7D] max-w-md mx-auto">
                Try loosening your filters or resetting to view all available recommendations.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-[#D4A94A] px-5 py-2.5 text-xs font-semibold text-[#171107] hover:bg-[#E0B44F]"
              >
                Reset Filters & Show Cigars
              </button>
            </div>
          )}

          {!query.isLoading && !query.isError && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item: GuidedDiscoveryItem, index: number) => {
                const isSaved = favorites.isFavorite(item._id);

                return (
                  <article
                    key={item._id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-[#35281E] bg-[#1A1613] p-4 transition-all duration-300 hover:border-[#D4A94A]/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                  >
                    <div>
                      {/* Top Label & Score */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#D4A94A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#E5C37A] border border-[#D4A94A]/30">
                          <Sparkles className="h-3 w-3" />
                          {item.label || (index === 0 ? "Top Pick" : "Great Choice")}
                        </span>

                        {item.matchScore ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-600/40 rounded px-1.5 py-0.5">
                            {item.matchScore}% Match
                          </span>
                        ) : null}
                      </div>

                      {/* Image container */}
                      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#110E0C] border border-[#2B2017]">
                        <CigarImage
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="mt-3.5 space-y-1">
                        <h3 className="truncate font-playfair text-base font-semibold text-[#F7ECDD] group-hover:text-[#F3D58C] transition-colors">
                          {item.name}
                        </h3>

                        <p className="truncate text-xs text-[#A89886]">
                          {[item.brand, item.wrapper, item.strength]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {/* Match Reason Banner */}
                        {item.matchReason && (
                          <p className="line-clamp-2 mt-2 text-[11px] leading-tight text-[#E0C69A] bg-[#271F17] rounded-lg p-2 border border-[#403123]">
                            ✦ {item.matchReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer info & CTA */}
                    <div className="mt-4 pt-3 border-t border-[#291F16] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-playfair text-lg font-bold text-[#E5C37A]">
                          ${Number(item.price).toFixed(2)}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] text-[#A89886]">
                          <MapPin className="h-3 w-3 text-[#D4A94A]" />
                          {[item.wallName, item.shelfName].filter(Boolean).join(" · ") ||
                            item.humidorName ||
                            "In Humidor"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={
                            isSaved
                              ? `Remove ${item.name} from saved cigars`
                              : `Save ${item.name}`
                          }
                          aria-pressed={isSaved}
                          onClick={() =>
                            favorites.setFavorite(
                              {
                                id: item._id,
                                name: item.name,
                                brand: item.brand,
                                price: item.price,
                                strength: item.strength,
                                image: item.image,
                                origin: item.wrapper,
                                description: [item.size, item.wallName, item.shelfName]
                                  .filter(Boolean)
                                  .join(" · "),
                                badges: [
                                  {
                                    label: "Guided Discovery",
                                    variant: "gold",
                                  },
                                ],
                              },
                              !isSaved,
                            )
                          }
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                            isSaved
                              ? "border-[#D4A94A] bg-[#D4A94A]/15 text-[#D4A94A]"
                              : "border-[#4A3B2D] text-[#B8A793] hover:border-[#D4A94A] hover:text-[#D4A94A]"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                          />
                        </button>

                        <Link
                          href={`${storePath}/${encodeURIComponent(item._id)}`}
                          className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-[#D4A94A] px-3 text-xs font-semibold text-[#181107] transition hover:bg-[#E0B44F]"
                        >
                          View Cigar
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Sommelier Consultation Banner */}
        <div className="mt-10 rounded-2xl border border-[#403122] bg-gradient-to-r from-[#1E1712] via-[#241B14] to-[#1A1410] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4A94A]">
              Personal Sommelier Quiz
            </span>
            <h3 className="font-playfair text-xl sm:text-2xl text-[#F5EAD9]">
              Want a comprehensive taste recommendation?
            </h3>
            <p className="text-xs sm:text-sm text-[#A89886] max-w-xl">
              Answer 6 quick questions covering your beverage pairings, wrapper preferences, budget, and time to get precision humidor recommendations.
            </p>
          </div>

          <Link
            href={`${storePath}/quiz`}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#D4A94A] px-6 text-xs font-semibold text-[#1A1206] shadow-md transition hover:bg-[#E5B955]"
          >
            Start Quiz Consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
