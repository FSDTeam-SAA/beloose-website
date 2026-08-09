import { type NextRequest, NextResponse } from "next/server";

const resources = new Set([
  "retailer-banner",
  "retailer-about",
  "retailer-platform",
  "retailer-howitwork",
  "retailer-benefits",
  "contact-info",
  "social-media",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } },
) {
  if (!resources.has(params.resource)) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  ).replace(/\/$/, "");
  const response = await fetch(
    `${apiUrl}/${params.resource}${request.nextUrl.search}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    },
  });
}
