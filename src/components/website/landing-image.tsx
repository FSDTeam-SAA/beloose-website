"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type LandingImageProps = Omit<ImageProps, "src"> & {
  src?: string;
  fallbackSrc: string;
};

export default function LandingImage({
  src,
  fallbackSrc,
  alt,
  ...props
}: LandingImageProps) {
  const preferredSrc = src?.trim() || fallbackSrc;
  const [resolvedSrc, setResolvedSrc] = useState(preferredSrc);

  useEffect(() => setResolvedSrc(preferredSrc), [preferredSrc]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) setResolvedSrc(fallbackSrc);
      }}
    />
  );
}
