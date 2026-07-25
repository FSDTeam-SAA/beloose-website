"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "Humidor411 transformed the way we manage our inventory and how our customers discover flavors. It’s not just software—it’s a game changer.",
    name: "Michael Reyes",
    role: "Owner, The Merchant Cigar Lounge",
  },
  {
    quote:
      "Our guests find the right cigar faster, and our team can spend more time creating a memorable in-store experience.",
    name: "Daniel Carter",
    role: "General Manager, Heritage Humidor",
  },
  {
    quote:
      "The product details are clear, the experience feels premium, and customers shop with confidence from their very first visit.",
    name: "Sophia Bennett",
    role: "Retail Director, The Reserve Lounge",
  },
];

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonial = testimonials[activeIndex];

  const showPrevious = () => {
    setActiveIndex((index) =>
      index === 0 ? testimonials.length - 1 : index - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % testimonials.length);
  };

  return (
    <section
      aria-label="Customer testimonials"
      className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-[#170C05] px-4 py-14 text-center text-white sm:min-h-[460px] sm:py-16 lg:min-h-[500px]"
    >
      <Image
        src="/assets/images/testimonial.jpg"
        alt="Interior of a premium cigar lounge"
        fill
        sizes="100vw"
        className="z-[-3] object-cover object-center"
      />
      <div className="absolute inset-0 z-[-2] bg-[#1A0D05]/65" />
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(81,47,21,0.12),rgba(16,8,3,0.42))]" />

      <div className="container">
        <Quote
          aria-hidden="true"
          className="mx-auto h-8 w-8 fill-[#CBA24A] text-[#CBA24A] sm:h-9 sm:w-9"
        />

        <blockquote className="mx-auto mt-5 min-h-[120px] max-w-4xl sm:min-h-[105px]">
          <p className="font-[family-name:var(--font-playfair)] text-xl italic leading-relaxed text-[#F4DFC0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-2xl lg:text-[28px]">
            “{testimonial.quote}”
          </p>
        </blockquote>

        <div className="mx-auto mt-5 h-px w-10 bg-[#CBA24A]" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#D8AF4F]">
          {testimonial.name}
        </p>
        <p className="mt-1 text-xs text-[#D8C3A5]/70">{testimonial.role}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Show previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#CBA24A]/45 text-[#CBA24A] transition-colors hover:border-[#CBA24A] hover:bg-[#CBA24A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2" aria-label="Testimonial pages">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show testimonial ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-1 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] ${
                  index === activeIndex
                    ? "w-7 bg-[#CBA24A]"
                    : "w-3 bg-[#CBA24A]/35 hover:bg-[#CBA24A]/65"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label="Show next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#CBA24A]/45 text-[#CBA24A] transition-colors hover:border-[#CBA24A] hover:bg-[#CBA24A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
