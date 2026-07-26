"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type FavoriteProductData = {
  id: string;
  name: string;
  brand: string;
  price: number;
  strength?: string;
  image?: string;
  origin?: string;
  description?: string;
  badges?: Array<{ label: string; variant?: "blue" | "gold" }>;
};

const FAVORITES_EVENT = "humidor411:favorites-changed";

const storageKey = (storeName: string) =>
  `humidor411-favorites:${storeName}`;

function isFavoriteProduct(value: unknown): value is FavoriteProductData {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FavoriteProductData>;
  return (
    typeof item.id === "string" &&
    Boolean(item.id) &&
    typeof item.name === "string" &&
    typeof item.brand === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price)
  );
}

function readFavorites(storeName: string): FavoriteProductData[] {
  if (typeof window === "undefined" || !storeName) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(storeName));
    if (!raw) {
      window.localStorage.setItem(storageKey(storeName), "[]");
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Invalid favorites data");

    return Array.from(
      new Map(
        parsed.filter(isFavoriteProduct).map((product) => [product.id, product]),
      ).values(),
    );
  } catch {
    try {
      window.localStorage.setItem(storageKey(storeName), "[]");
    } catch {
      // Storage can be unavailable in restricted/private browser contexts.
    }
    return [];
  }
}

function writeFavorites(
  storeName: string,
  favorites: FavoriteProductData[],
) {
  const unique = Array.from(
    new Map(favorites.map((product) => [product.id, product])).values(),
  );
  try {
    window.localStorage.setItem(storageKey(storeName), JSON.stringify(unique));
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT, { detail: { storeName } }),
    );
  } catch {
    return readFavorites(storeName);
  }
  return unique;
}

export function useFavorites(storeName: string) {
  const [favorites, setFavorites] = useState<FavoriteProductData[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!storeName) return;

    const refresh = () => setFavorites(readFavorites(storeName));
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey(storeName)) refresh();
    };
    const onFavoritesChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ storeName?: string }>).detail;
      if (detail?.storeName === storeName) refresh();
    };

    refresh();
    setIsReady(true);
    window.addEventListener("storage", onStorage);
    window.addEventListener(FAVORITES_EVENT, onFavoritesChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FAVORITES_EVENT, onFavoritesChanged);
    };
  }, [storeName]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((product) => product.id)),
    [favorites],
  );

  const setFavorite = useCallback(
    (product: FavoriteProductData, favorite: boolean) => {
      if (!storeName) return;
      const current = readFavorites(storeName);
      const next = favorite
        ? [...current.filter((item) => item.id !== product.id), product]
        : current.filter((item) => item.id !== product.id);
      setFavorites(writeFavorites(storeName, next));
    },
    [storeName],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      if (!storeName) return;
      const next = readFavorites(storeName).filter((item) => item.id !== id);
      setFavorites(writeFavorites(storeName, next));
    },
    [storeName],
  );

  return {
    favorites,
    favoriteIds,
    isReady,
    isFavorite: useCallback(
      (id: string) => favoriteIds.has(id),
      [favoriteIds],
    ),
    setFavorite,
    removeFavorite,
  };
}
