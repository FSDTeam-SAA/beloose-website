"use client";

import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "next-share";
import { Check, Copy, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SocialShareContentProps = {
  storeName: string;
  productId: string;
  title: string;
};

const SocialShareContent = ({
  storeName,
  productId,
  title,
}: SocialShareContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(
      `${window.location.origin}/store/${encodeURIComponent(storeName)}/${encodeURIComponent(productId)}`,
    );
  }, [productId, storeName]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Share ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
          open
            ? "border-[#D5AB48] bg-[#D5AB48] text-[#241A0C]"
            : "border-white/[0.09] bg-[#2C2927] text-[#A9A095] hover:border-[#CBA24A]/35 hover:text-[#D7AA46]"
        }`}
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Share ${title}`}
          className="absolute right-0 top-12 z-50 w-[min(290px,calc(100vw-2rem))] rounded-xl border border-[#CBA24A]/25 bg-[#19130F] p-4 text-left shadow-[0_18px_55px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-playfair text-base text-[#F5E7D0]">
                Share this cigar
              </p>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8F8983]">
                {title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close share options"
              className="rounded-md p-1 text-[#8F8983] transition hover:bg-white/[0.06] hover:text-[#F5E7D0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={36} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl}>
              <TwitterIcon size={36} round />
            </TwitterShareButton>
            <WhatsappShareButton url={shareUrl}>
              <WhatsappIcon size={36} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={36} round />
            </LinkedinShareButton>
            <TelegramShareButton url={shareUrl}>
              <TelegramIcon size={36} round />
            </TelegramShareButton>
          </div>

          <button
            type="button"
            disabled={!shareUrl}
            onClick={() => void copyLink()}
            className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-xs font-medium transition disabled:cursor-wait disabled:opacity-50 ${
              copied
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                : "border-[#CBA24A]/35 bg-[#CBA24A]/[0.07] text-[#D7AA46] hover:bg-[#CBA24A]/15"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Link copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialShareContent;
