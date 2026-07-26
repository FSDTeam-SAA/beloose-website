"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const testimonial = testimonials[activeIndex];
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

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
      aria-labelledby="testimonial-title"
      className="store-section relative isolate overflow-hidden bg-[#170C05] px-4 text-white"
    >
      <Image
        src="/assets/images/testimonial.jpg"
        alt=""
        fill
        sizes="100vw"
        className="z-[-3] object-cover object-center"
      />
      <div className="absolute inset-0 z-[-2] bg-[#100905]/80" />
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(203,162,74,0.12),transparent_58%),linear-gradient(to_right,rgba(10,5,2,0.42),transparent_35%,rgba(10,5,2,0.42))]" />

      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7AA46]">
            Trusted experiences
          </p>
          <h2
            id="testimonial-title"
            className="mt-2 font-playfair text-2xl text-[#F5E7D0] sm:text-3xl"
          >
            What Retailers Are Saying
          </h2>
        </div>

        <div
          className="relative mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#19130F]/85 px-5 py-7 text-center shadow-[0_18px_55px_rgba(0,0,0,0.3)] backdrop-blur-md sm:px-10 sm:py-9"
          aria-live="polite"
        >
          <Quote
            aria-hidden="true"
            className="absolute left-4 top-4 h-10 w-10 fill-[#CBA24A]/10 text-[#CBA24A]/25 sm:left-7 sm:top-6 sm:h-14 sm:w-14"
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={testimonial.name}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
            >
              <blockquote className="relative mx-auto max-w-3xl">
                <p className="text-balance font-playfair text-lg italic leading-8 text-[#F4DFC0] sm:text-xl lg:text-2xl">
                  “{testimonial.quote}”
                </p>
              </blockquote>

              <div className="mt-6 flex items-center justify-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CBA24A]/35 bg-[#CBA24A]/10 text-xs font-semibold text-[#E1B654]"
                >
                  {initials}
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#F2DEBB]">
                    {testimonial.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#AFA59A]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Show previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CBA24A]/40 bg-black/20 text-[#D7AA46] transition hover:border-[#CBA24A] hover:bg-[#CBA24A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
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
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#170C05] ${
                  index === activeIndex
                    ? "w-8 bg-[#CBA24A]"
                    : "w-2 bg-white/25 hover:bg-[#CBA24A]/65"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label="Show next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CBA24A]/40 bg-black/20 text-[#D7AA46] transition hover:border-[#CBA24A] hover:bg-[#CBA24A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
