"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0F0E0D] px-4 py-16 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,#352311_0%,#17110B_38%,#0F0E0D_72%)]" />
      <div className="absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-[#CBA24A]/[0.07] blur-3xl" />
      <div className="absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full bg-[#7C481F]/10 blur-3xl" />

      <section
        className="w-full max-w-xl rounded-2xl border border-[#CBA24A]/25 bg-[#19130D]/90 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-10 sm:py-12"
        aria-labelledby="error-title"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#CBA24A]/30 bg-[#CBA24A]/10 text-[#D7AA46]">
          <AlertTriangle className="h-7 w-7" strokeWidth={1.7} />
        </span>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#CBA24A]">
          Something went wrong
        </p>
        <h1
          id="error-title"
          className="mt-2 font-playfair text-3xl text-[#F5E7D0] sm:text-4xl"
        >
          We hit an unexpected snag
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#A9A095]">
          Your information is safe. Try loading this page again, or return home
          and continue from there.
        </p>

        {error.digest && (
          <p className="mt-4 text-[10px] text-[#756D64]">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D5AB48] px-6 text-sm font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBA24A]/45 px-6 text-sm text-[#D8C6A3] transition hover:bg-[#CBA24A]/10 hover:text-[#F5E7D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
