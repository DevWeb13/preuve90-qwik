import { component$ } from "@builder.io/qwik";
import { LotoFootDashboard } from "~/components/loto-foot/loto-foot-dashboard";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => <LotoFootDashboard formula={7} />);

export const head = createDocumentHead(
  "Preuve90 — Loto Foot 7",
  "Statistiques, publications et résultats vérifiables des grilles Loto Foot 7.",
  "/loto-foot/7/",
);
