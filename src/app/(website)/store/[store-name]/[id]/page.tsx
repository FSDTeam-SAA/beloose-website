import type { Metadata } from "next";
import ProductDetailsContainer from "./_components/product-details-container";

export const metadata: Metadata = {
  title: "Product Details | Humidor411",
  description: "View cigar details, availability, and in-store shelf location.",
};

export default function ProductDetailsPage() {
  return <ProductDetailsContainer />;
}
