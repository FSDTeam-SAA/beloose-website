const blockClosingTag =
  /<\/(?:address|article|blockquote|div|h[1-6]|li|ol|p|pre|section|table|tr|ul)>/gi;

const decodeCodePoint = (code: number) =>
  Number.isInteger(code) && code >= 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : "";

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code: string) => decodeCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      decodeCodePoint(Number.parseInt(code, 16)),
    )
    .replace(
      /&(nbsp|amp|quot|apos|lt|gt);/gi,
      (_, entity: string) =>
        ({
          nbsp: " ",
          amp: "&",
          quot: '"',
          apos: "'",
          lt: "<",
          gt: ">",
        })[entity.toLowerCase()] || "",
    );

export const landingText = (value?: string) => {
  if (!value) return "";

  const spacedHtml = value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(blockClosingTag, " ");
  const text =
    typeof DOMParser === "undefined"
      ? decodeHtmlEntities(spacedHtml.replace(/<[^>]*>/g, ""))
      : new DOMParser().parseFromString(spacedHtml, "text/html").body
          .textContent || "";

  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
};
