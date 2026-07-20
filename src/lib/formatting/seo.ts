import type { DocumentHeadValue } from "@builder.io/qwik-city";
import { SITE_CONFIG } from "~/config/site";

export function createDocumentHead(
  title: string,
  description: string,
  path: string,
  noIndex = false,
): DocumentHeadValue {
  const fullTitle = title.includes("Preuve90") ? title : `${title} | Preuve90`;
  const canonical = SITE_CONFIG.publicOrigin ? `${SITE_CONFIG.publicOrigin}${path}` : undefined;

  return {
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_CONFIG.name },
      ...(canonical ? [{ property: "og:url", content: canonical }] : []),
      ...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}
