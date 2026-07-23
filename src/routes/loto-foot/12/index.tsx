import { component$ } from "@builder.io/qwik";
import { LotoFootDashboard } from "~/components/loto-foot/loto-foot-dashboard";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => <LotoFootDashboard formula={12} />);

export const head = createDocumentHead(
  "Preuve90 — Loto Foot 12",
  "Statistiques, publications et résultats vérifiables des grilles Loto Foot 12.",
  "/loto-foot/12/",
);
