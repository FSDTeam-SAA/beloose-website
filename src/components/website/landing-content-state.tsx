"use client";

import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react";

type LandingContentStateProps = {
  type: "error" | "empty";
  message: string;
  onRetry?: () => void;
};

export default function LandingContentState({
  type,
  message,
  onRetry,
}: LandingContentStateProps) {
  const Icon = type === "error" ? AlertCircle : FileQuestion;

  return (
    <div
      className="mt-6 flex items-center justify-between gap-4 rounded-[5px] border border-[#5c3714]/60 bg-[#201207]/90 px-4 py-3 text-[#bda16d]"
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 flex-none text-[#d4a23f]" />
        <p className="text-[10px] leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 flex-none items-center gap-2 rounded-[3px] border border-[#d4a23f]/50 px-3 text-[10px] font-semibold text-[#d4a23f] transition hover:bg-[#d4a23f]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cf76]"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}
