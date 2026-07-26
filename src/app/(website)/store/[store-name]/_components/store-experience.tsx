"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useLayoutEffect,
  useRef,
} from "react";

const REVEAL_SELECTOR =
  "main section, main article, main [data-store-reveal]";

const StoreExperience = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const animatedElements = new Set<HTMLElement>();
    const observedElements = new WeakSet<HTMLElement>();

    if (reduceMotion) {
      gsap.set(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR), {
        clearProps: "opacity,transform",
      });
      return;
    }

    const reveal = (element: HTMLElement) => {
      animatedElements.add(element);
      gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: window.innerWidth < 640 ? 0.38 : 0.52,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          intersectionObserver.unobserve(element);
          reveal(element);
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.06,
      },
    );

    const register = (element: HTMLElement) => {
      if (
        observedElements.has(element) ||
        element.closest("[data-store-no-motion]")
      ) {
        return;
      }

      observedElements.add(element);
      animatedElements.add(element);
      gsap.set(element, {
        autoAlpha: 0,
        y: window.innerWidth < 640 ? 14 : 20,
      });
      intersectionObserver.observe(element);
    };

    const scan = (node: ParentNode) => {
      if (node instanceof HTMLElement && node.matches(REVEAL_SELECTOR)) {
        register(node);
      }
      node
        .querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
        .forEach(register);
    };

    scan(root);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      gsap.killTweensOf(Array.from(animatedElements));
      gsap.set(Array.from(animatedElements), {
        clearProps: "opacity,visibility,transform",
      });
    };
  }, [pathname, reduceMotion]);

  return (
    <div
      data-store-experience
      className="relative isolate min-w-0 flex-1 overflow-x-clip bg-[#0F0E0D]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-28 top-1/4 -z-10 h-72 w-72 rounded-full bg-[#CBA24A]/[0.035] blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-36 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#7C481F]/[0.055] blur-3xl sm:h-[28rem] sm:w-[28rem]"
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          ref={contentRef}
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
          transition={{
            duration: reduceMotion ? 0 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="min-w-0 [&>main]:min-w-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StoreExperience;
