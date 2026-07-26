"use client";

import { useParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";

type LoaderState = "checking" | "showing" | "leaving" | "hidden";

const StoreEntryGate = ({ children }: { children: ReactNode }) => {
  const params = useParams<{ "store-name": string }>();
  const storeName = params["store-name"];
  const [loaderState, setLoaderState] = useState<LoaderState>("checking");

  useEffect(() => {
    const key = `humidor411-store-intro:${storeName}`;

    try {
      if (window.sessionStorage.getItem(key) === "seen") {
        setLoaderState("hidden");
        return;
      }
      window.sessionStorage.setItem(key, "seen");
    } catch {
      // Continue with the intro when session storage is unavailable.
    }

    setLoaderState("showing");
    const leaveTimer = window.setTimeout(
      () => setLoaderState("leaving"),
      1700,
    );
    const hideTimer = window.setTimeout(
      () => setLoaderState("hidden"),
      2000,
    );

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [storeName]);

  useEffect(() => {
    if (loaderState === "hidden") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [loaderState]);

  if (loaderState !== "hidden") {
    return <Loader leaving={loaderState === "leaving"} />;
  }

  return children;
};

export default StoreEntryGate;
