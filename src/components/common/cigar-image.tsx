"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

export const DEFAULT_CIGAR_IMAGE =
  "/assets/images/default-cigar-image.jpg";

type CigarImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export default function CigarImage({ src, alt, ...props }: CigarImageProps) {
  const preferredSrc = src?.trim() || DEFAULT_CIGAR_IMAGE;
  const [resolvedSrc, setResolvedSrc] = useState(preferredSrc);

  useEffect(() => setResolvedSrc(preferredSrc), [preferredSrc]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => setResolvedSrc(DEFAULT_CIGAR_IMAGE)}
    />
  );
}
