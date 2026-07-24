import { component$ } from "@builder.io/qwik";
import { LotoFootDashboard } from "~/components/loto-foot/loto-foot-dashboard";
import { SITE_CONFIG } from "~/config/site";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => <LotoFootDashboard />);

export const head = createDocumentHead(
  "Preuve90 : Publications Loto Foot 7, 8, 12 et 15",
  SITE_CONFIG.description,
  "/",
);
