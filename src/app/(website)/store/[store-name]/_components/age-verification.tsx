"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const AGE_VERIFIED_KEY = "humidor411-age-verified";

type VerificationState = "checking" | "prompt" | "verified" | "denied";

interface AgeVerificationProps {
  children: ReactNode;
}

const AgeVerification = ({ children }: AgeVerificationProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationState>("checking");

  useEffect(() => {
    const isVerified = window.localStorage.getItem(AGE_VERIFIED_KEY) === "true";
    setStatus(isVerified ? "verified" : "prompt");
  }, []);

  useEffect(() => {
    if (status === "verified") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [status]);

  const confirmAge = () => {
    window.localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setStatus("verified");
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  if (status === "verified") {
    return children;
  }

  return (
    <div className="fixed inset-0 z-[100] isolate flex min-h-dvh items-center justify-center overflow-y-auto bg-[#0F0D0C] px-4 py-8">
      <Image
        src="/assets/images/auth_bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-black/60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(203,162,74,0.09),transparent_48%),linear-gradient(to_bottom,rgba(10,7,4,0.12),rgba(10,7,4,0.48))]"
      />

      {status === "checking" ? (
        <span className="sr-only">Checking age verification</span>
      ) : (
        <div className="w-full max-w-[510px] rounded-[18px] border border-[#CBA24A]/25 bg-[#15110D]/90 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-10 sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#3A3531] bg-[#171513]">
            <Image
              src="/assets/images/logo.png"
              alt="Humidor411 logo"
              width={58}
              height={58}
              className="h-[58px] w-[58px] object-contain"
              priority
            />
          </div>

          {status === "prompt" ? (
            <>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.35em] text-[#CBA24A]">
                Humidor411
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-normal leading-tight text-[#F1ECE7] sm:text-[44px]">
                Age Verification
              </h1>
              <p className="mx-auto mt-4 max-w-[390px] text-base leading-7 text-[#A9A39E] sm:text-lg">
                You must be of legal smoking age in your jurisdiction to enter.
                By clicking &quot;I&apos;m 21+&quot;, you confirm that you meet this
                requirement.
              </p>

              <div className="mx-auto mt-8 grid max-w-[350px] gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={confirmAge}
                  className="h-[50px] rounded-xl bg-[#D1A34C] px-5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#E0B45B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C675] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191715]"
                >
                  I&apos;m 21 or Older
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("denied")}
                  className="h-[50px] rounded-xl border border-[#3B3632] bg-transparent px-5 text-sm font-medium text-[#8E8985] transition-colors hover:border-[#57504B] hover:text-[#B8B2AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E8985]"
                >
                  I&apos;m Under 21
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-7 font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#F1ECE7] sm:text-4xl">
                We&apos;re Sorry
              </h1>
              <p className="mx-auto mt-4 max-w-[370px] text-base leading-6 text-[#A9A39E] sm:text-lg">
                You must be 21 or older to access Humidor411. Please come back
                when you meet the age requirement.
              </p>
              <button
                type="button"
                onClick={goBack}
                className="mx-auto mt-7 inline-flex h-[48px] min-w-[170px] items-center justify-center gap-2 rounded-xl border border-[#CBA24A]/60 px-5 text-sm font-semibold text-[#D7AD55] transition-colors hover:border-[#CBA24A] hover:bg-[#CBA24A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191715]"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AgeVerification;
