import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  ).replace(/\/$/, "");
  const response = await fetch(
    `${apiUrl}/retailer-howitwork-title/${encodeURIComponent(params.id)}`,
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
