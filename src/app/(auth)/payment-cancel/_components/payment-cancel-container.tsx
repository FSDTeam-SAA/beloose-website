import { ArrowLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PaymentCancelContainer = () => {
  return (
    <main className="flex w-full items-center justify-center px-4 py-8">
      <section className="w-full max-w-[500px] rounded-[14px] border border-[#CBA24A] bg-[rgba(19,15,9,0.82)] px-6 py-8 text-center shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-[7px] sm:px-10 sm:py-10">
        <Link href="/" aria-label="Go to home" className="inline-flex">
          <Image
            src="/assets/images/logo.png"
            alt="Humidor411"
            width={76}
            height={76}
            priority
            className="h-[76px] w-[76px] object-contain"
          />
        </Link>

        <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/50 bg-red-950/70 text-red-300 shadow-[0_0_28px_rgba(248,113,113,0.14)]">
          <X className="h-8 w-8" strokeWidth={2.4} />
        </div>

        <h1 className="mt-5 font-playfair text-[30px] font-semibold text-[#D5AB48]">
          Payment Cancelled
        </h1>
        <p className="mx-auto mt-2 max-w-[350px] text-sm leading-6 text-white/80">
          Your payment was not completed and you have not been charged.
        </p>
        <p className="mt-1 text-xs text-[#B7A887]">
          You can return to the plans and try again anytime.
        </p>

        <Link
          href="/subscription"
          className="mx-auto mt-7 flex h-11 w-full max-w-[250px] items-center justify-center gap-2 rounded-[7px] bg-[#D5AB48] text-sm font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#130f09]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
      </section>
    </main>
  );
};

export default PaymentCancelContainer;
