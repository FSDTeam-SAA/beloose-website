"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getRetailerBySlug } from "@/lib/retailer";

const readableStoreName = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const UserFooter = () => {
  const params = useParams<{ "store-name": string }>();
  const storeSlug = params["store-name"];
  const query = useQuery({
    queryKey: ["store", storeSlug, "retailer-profile"],
    queryFn: ({ signal }) => getRetailerBySlug(storeSlug, signal),
    enabled: Boolean(storeSlug),
    staleTime: 5 * 60_000,
  });
  const shopName =
    query.data?.storeName || readableStoreName(storeSlug) || "Humidor411";

  return (
    <footer className="border-t border-[#CBA24A]/15 bg-[#120B07] px-4 py-7 text-center text-white sm:py-8">
      <p className="text-xs text-[#A9A095]">
        © {new Date().getFullYear()}{" "}
        <span className="font-medium text-[#D7AA46]">{shopName}</span>. All
        rights reserved.
      </p>
    </footer>
  );
};

export default UserFooter;
