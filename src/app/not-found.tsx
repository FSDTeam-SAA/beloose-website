"use client";

import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0F0E0D] px-4 py-16 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,#352311_0%,#17110B_38%,#0F0E0D_72%)]" />
      <div className="absolute -right-24 top-12 -z-10 h-80 w-80 rounded-full bg-[#CBA24A]/[0.07] blur-3xl" />
      <div className="absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-[#7C481F]/10 blur-3xl" />

      <section
        className="w-full max-w-xl rounded-2xl border border-[#CBA24A]/25 bg-[#19130D]/90 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-10 sm:py-12"
        aria-labelledby="not-found-title"
      >
        <div className="relative mx-auto w-fit">
          <span className="font-playfair text-8xl font-semibold leading-none text-[#D5AB48]/15 sm:text-9xl">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <SearchX className="h-10 w-10 text-[#D7AA46]" strokeWidth={1.5} />
          </span>
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#CBA24A]">
          Page not found
        </p>
        <h1
          id="not-found-title"
          className="mt-2 font-playfair text-3xl text-[#F5E7D0] sm:text-4xl"
        >
          This page has gone missing
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#A9A095]">
          The link may be outdated, or the page may have moved. Head home or go
          back to where you were.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D5AB48] px-6 text-sm font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2]"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBA24A]/45 px-6 text-sm text-[#D8C6A3] transition hover:bg-[#CBA24A]/10 hover:text-[#F5E7D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
