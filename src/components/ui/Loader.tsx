"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const loadingStates = [
  "Opening the digital humidor...",
  "Curating the store’s cigar collection...",
  "Preparing your guided discovery...",
  "Your premium cigar experience is ready.",
];

const Loader = ({ leaving = false }: { leaving?: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        Math.min(current + 1, loadingStates.length - 1),
      );
    }, 520);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={loadingStates[messageIndex]}
      className={`fixed inset-0 z-[250] flex min-h-dvh items-center justify-center overflow-hidden bg-[#0F0B07] px-5 text-white transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,162,74,0.13),transparent_42%)]" />
      <div className="absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-[#7C481F]/10 blur-3xl" />
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#CBA24A]/[0.07] blur-3xl" />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="relative grid h-40 w-40 place-items-center sm:h-44 sm:w-44">
          <span className="absolute inset-0 rounded-full border border-[#CBA24A]/15 motion-safe:animate-[spin_10s_linear_infinite]" />
          <span className="absolute inset-3 rounded-full border border-dashed border-[#CBA24A]/35 motion-safe:animate-[spin_7s_linear_infinite_reverse]" />
          <span className="absolute inset-7 rounded-full bg-[#CBA24A]/[0.06] blur-md motion-safe:animate-pulse" />

          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-[#CBA24A]/35 bg-[#19130D] shadow-[0_0_45px_rgba(203,162,74,0.14)] sm:h-28 sm:w-28">
            <Image
              src="/assets/images/logo.png"
              alt="Humidor411"
              width={76}
              height={76}
              priority
              className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
            />
          </div>

          <Sparkles className="absolute right-2 top-5 h-5 w-5 text-[#E0B44F] motion-safe:animate-pulse" />
          <span className="absolute bottom-6 left-1 h-2.5 w-2.5 rounded-full bg-[#CBA24A] shadow-[0_0_18px_rgba(203,162,74,0.7)] motion-safe:animate-pulse" />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CBA24A]">
          Humidor411
        </p>
        <h1 className="mt-2 font-playfair text-2xl text-[#F5E7D0] sm:text-3xl">
          A finer cigar experience
        </h1>
        <p className="mt-3 min-h-6 text-sm text-[#A9A095]">
          {loadingStates[messageIndex]}
        </p>

        <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-white/[0.08] sm:w-64">
          <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-[#A87921] via-[#E0B44F] to-[#A87921] motion-safe:animate-[loader-slide_1.1s_ease-in-out_infinite]" />
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-[10px] text-[#746D65]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#9D7B35]" />
          Discover responsibly. Enjoy at your own pace.
        </p>
      </div>

      <style jsx>{`
        @keyframes loader-slide {
          0% {
            transform: translateX(-105%);
          }
          100% {
            transform: translateX(205%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
