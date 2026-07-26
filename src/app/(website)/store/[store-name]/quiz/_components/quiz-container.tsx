"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  MapPin,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  getGuidedDiscoveryResults,
  type GuidedDiscoveryAnswers,
} from "@/lib/guidedDiscovery";

type AnswerKey = keyof GuidedDiscoveryAnswers;

type Option = {
  value: string;
  title: string;
  description: string;
  icon: string;
  extra?: Partial<GuidedDiscoveryAnswers>;
};

type Question = {
  key: AnswerKey;
  title: string;
  subtitle: string;
  options: Option[];
};

const questions: Question[] = [
  {
    key: "strength",
    title: "How strong do you like it?",
    subtitle: "Pick your preferred intensity.",
    options: [
      { value: "mild", title: "Mild", description: "Smooth & gentle", icon: "🙂" },
      { value: "medium", title: "Medium", description: "Balanced & approachable", icon: "😊" },
      { value: "medium-full", title: "Medium-Full", description: "Rich & flavorful", icon: "😋" },
      { value: "full", title: "Full", description: "Bold & intense", icon: "💪" },
    ],
  },
  {
    key: "budget",
    title: "What’s your budget?",
    subtitle: "How much are you looking to spend per cigar?",
    options: [
      { value: "5-15", title: "$5–15", description: "Great value picks", icon: "💵" },
      { value: "15-25", title: "$15–25", description: "Premium everyday", icon: "💰" },
      { value: "25+", title: "$25+", description: "Luxury & rare", icon: "💎" },
    ],
  },
  {
    key: "smokingTime",
    title: "How much time do you have?",
    subtitle: "This helps us match the right cigar size.",
    options: [
      { value: "60", title: "About 1 hour", description: "A quick smoke", icon: "⏱️" },
      { value: "90", title: "About 1.5 hours", description: "A standard session", icon: "⌚" },
      { value: "120+", title: "2+ hours", description: "Long & leisurely", icon: "⌛" },
    ],
  },
  {
    key: "profile",
    title: "What are you in the mood for?",
    subtitle: "Choose a flavor direction, or keep your options open.",
    options: [
      {
        value: "familiar",
        title: "Smooth & Familiar",
        description: "Connecticut wrapper · Coffee pairing",
        icon: "🤝",
        extra: {
          wrapper: "Connecticut",
          pairingSuggestions: "Cigar + Coffee / Espresso",
        },
      },
      {
        value: "rich",
        title: "Rich & Relaxed",
        description: "Maduro wrapper · Aged rum pairing",
        icon: "🥃",
        extra: {
          wrapper: "Maduro",
          pairingSuggestions: "Cigar + Aged Rum",
        },
      },
      {
        value: "adventurous",
        title: "Try Something New",
        description: "Explore any wrapper or pairing",
        icon: "⭐",
        extra: { wrapper: "", pairingSuggestions: "" },
      },
    ],
  },
];

export default function QuizContainer() {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const storePath = `/store/${encodeURIComponent(storeName)}`;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<GuidedDiscoveryAnswers>({});
  const [submittedAnswers, setSubmittedAnswers] =
    useState<GuidedDiscoveryAnswers | null>(null);
  const [resultLimit, setResultLimit] = useState(5);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const showingResults = step === questions.length;
  const question = questions[step];

  const resultsQuery = useQuery({
    queryKey: [
      "store",
      storeName,
      "guided-discovery",
      submittedAnswers,
      resultLimit,
    ],
    queryFn: ({ signal }) =>
      getGuidedDiscoveryResults(
        storeName,
        submittedAnswers!,
        signal,
        resultLimit,
      ),
    enabled: Boolean(storeName && submittedAnswers) && showingResults,
    staleTime: 60_000,
  });

  const selectOption = (option: Option) => {
    setAnswers((current) => ({
      ...current,
      [question.key]: option.value,
      ...(question.key === "profile"
        ? { wrapper: "", pairingSuggestions: "", ...option.extra }
        : {}),
    }));
  };

  const restart = () => {
    setAnswers({});
    setSubmittedAnswers(null);
    setResultLimit(5);
    setSavedIds([]);
    setStep(0);
  };

  const continueQuiz = () => {
    if (!selectedValue) return;

    if (step === questions.length - 1) {
      setSubmittedAnswers({ ...answers });
    }

    setStep((current) => current + 1);
  };

  if (showingResults) {
    return (
      <main className="min-h-screen bg-[#130B05] px-4 py-10 text-white sm:py-16">
        <div className="container">
          <QuizHeading results />

          {resultsQuery.isLoading && (
            <div className="mx-auto mt-10 max-w-3xl space-y-3">
              {Array.from({ length: 5 }).map((_, item) => (
                <div
                  key={item}
                  className="flex min-h-24 animate-pulse items-center gap-4 rounded-lg border border-[#795629]/60 bg-[#241509] p-4"
                >
                  <div className="h-16 w-16 shrink-0 rounded bg-white/[0.07]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 rounded bg-white/[0.08]" />
                    <div className="h-3 w-3/5 rounded bg-white/[0.06]" />
                    <div className="h-3 w-1/4 rounded bg-white/[0.06]" />
                  </div>
                  <div className="hidden h-9 w-16 rounded bg-white/[0.07] sm:block" />
                </div>
              ))}
            </div>
          )}

          {resultsQuery.isError && (
            <div className="mx-auto mt-10 flex max-w-lg flex-col items-center rounded-2xl border border-[#CBA24A]/20 bg-[#241509] px-6 py-14 text-center">
              <RefreshCw className="h-8 w-8 text-[#D5A744]" />
              <h2 className="mt-4 font-playfair text-xl text-[#F4DFB9]">
                We couldn’t find your matches
              </h2>
              <p className="mt-2 text-sm text-[#A99070]">
                {resultsQuery.error instanceof Error
                  ? resultsQuery.error.message
                  : "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => resultsQuery.refetch()}
                className="mt-5 rounded-lg bg-[#D2A440] px-5 py-2.5 text-xs font-semibold text-[#211305]"
              >
                Try again
              </button>
            </div>
          )}

          {!resultsQuery.isLoading &&
            !resultsQuery.isError &&
            !resultsQuery.data?.items.length && (
              <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-dashed border-[#CBA24A]/30 bg-[#241509] px-6 py-14 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[#D5A744]" />
                <h2 className="mt-4 font-playfair text-xl text-[#F4DFB9]">
                  No exact match this time
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#A99070]">
                  Try the quiz again and choose “Try Something New” for a wider
                  selection.
                </p>
              </div>
            )}

          {!!resultsQuery.data?.items.length && (
            <>
              <div className="mx-auto mt-9 max-w-3xl space-y-3">
                {resultsQuery.data.items.map((item) => {
                  const isSaved = savedIds.includes(item._id);

                  return (
                    <article
                      key={item._id}
                      className="flex min-w-0 flex-col gap-4 rounded-lg border border-[#8B6532] bg-[#2A1A0E]/90 p-4 transition hover:border-[#C99D43] sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#1B1008]">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center font-playfair text-2xl text-[#D9AD4A]">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-playfair text-lg text-[#F3DEB5]">
                            {item.name}
                          </h2>
                          <p className="mt-0.5 truncate text-[11px] text-[#A88E6D]">
                            {[item.brand, item.wrapper, item.strength]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                            <span className="font-semibold text-[#D9AD4A]">
                              ${Number(item.price).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[#A88E6D]">
                              <MapPin className="h-3 w-3" />
                              {item.shelfName || "Ask store staff"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={
                            isSaved
                              ? `Remove ${item.name} from saved cigars`
                              : `Save ${item.name}`
                          }
                          aria-pressed={isSaved}
                          onClick={() =>
                            setSavedIds((current) =>
                              isSaved
                                ? current.filter((id) => id !== item._id)
                                : [...current, item._id],
                            )
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded border transition ${
                            isSaved
                              ? "border-[#D9AD4A] bg-[#D9AD4A]/10 text-[#D9AD4A]"
                              : "border-[#795629] text-[#B4915D] hover:border-[#D9AD4A] hover:text-[#D9AD4A]"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                          />
                        </button>
                        <Link
                          href={`${storePath}/${encodeURIComponent(item._id)}`}
                          className="inline-flex h-9 min-w-16 items-center justify-center rounded bg-[#D2A440] px-5 text-xs font-semibold text-[#211305] transition hover:bg-[#E0B44F]"
                        >
                          View
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {resultsQuery.data.meta.total >
                resultsQuery.data.items.length && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    disabled={resultsQuery.isFetching}
                    onClick={() =>
                      setResultLimit(resultsQuery.data!.meta.total)
                    }
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#CBA24A]/55 px-6 text-xs font-medium text-[#E4C98E] transition hover:bg-[#CBA24A]/10 disabled:cursor-wait disabled:opacity-60"
                  >
                    {resultsQuery.isFetching ? "Loading..." : "See all"}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBA24A]/55 px-5 text-xs text-[#E4C98E] transition hover:bg-[#CBA24A]/10"
            >
              <RotateCcw className="h-4 w-4" />
              Retake quiz
            </button>
            <Link
              href={`${storePath}/all-products`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D2A440] px-5 text-xs font-semibold text-[#211305] transition hover:bg-[#E0B44F]"
            >
              Browse all cigars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedValue = answers[question.key];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#160D06] px-4 py-10 text-white sm:py-16">
      <div className="pointer-events-none absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#CBA24A]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#8A5528]/10 blur-3xl" />

      <div className="container relative min-h-[calc(100vh-8rem)]">
        <div className="mx-auto flex w-full max-w-2xl flex-col">
        <Link
          href={storePath}
          className="mb-7 inline-flex w-fit items-center gap-2 text-xs text-[#A99070] transition hover:text-[#D5A744]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>

        <QuizHeading />

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between text-[10px] text-[#D5A744]">
            <span>
              {step + 1} of {questions.length} questions
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[#F1E8D8]/15"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B98626] to-[#E0B44F] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="mt-7 rounded-2xl border border-[#6C431D]/45 bg-[#261609]/95 p-5 shadow-2xl shadow-black/20 sm:p-7">
          <h2 className="font-playfair text-xl font-semibold text-[#D9AD4A] sm:text-2xl">
            {question.title}
          </h2>
          <p className="mt-1 text-xs text-[#92795D]">{question.subtitle}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const selected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectOption(option)}
                  className={`relative flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[#D5A744] bg-[#D5A744]/10 shadow-[0_0_0_1px_rgba(213,167,68,0.18)]"
                      : "border-[#765022]/65 bg-[#211307] hover:border-[#B98626] hover:bg-[#2B190A]"
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {option.icon}
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-medium text-[#EBD9B9]">
                      {option.title}
                    </strong>
                    <small className="mt-0.5 block text-[10px] text-[#947B5F]">
                      {option.description}
                    </small>
                  </span>
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#D5A744] text-[#211305]">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBA24A]/50 px-7 text-xs text-[#CDB68B] transition hover:bg-[#CBA24A]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={!selectedValue}
              onClick={continueQuiz}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D2A440] px-8 text-xs font-semibold text-[#211305] transition hover:bg-[#E0B44F] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === questions.length - 1 ? "Find my matches" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function QuizHeading({ results = false }: { results?: boolean }) {
  return (
    <header className="text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CBA24A]/20 bg-[#CBA24A]/10 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#D5A744]">
        <Sparkles className="h-3 w-3" />
        {results ? "Your perfect match" : "Guided discovery"}
      </span>
      <h1 className="mt-3 font-playfair text-3xl font-semibold text-[#DDB24E] sm:text-4xl lg:text-5xl">
        {results ? "Cigars Picked Just For You" : "Find Your Perfect Cigar"}
      </h1>
      <p className="mt-2 text-xs text-[#957A5B] sm:text-sm">
        {results
          ? "Based on your preferences and this store’s current inventory."
          : "Answer a few questions — we’ll do the rest."}
      </p>
    </header>
  );
}
