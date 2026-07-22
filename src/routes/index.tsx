import { component$ } from "@builder.io/qwik";
import { DashboardIntro } from "~/components/motion/motion";
import { SITE_CONFIG } from "~/config/site";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => (
  <DashboardIntro>
    <header class="home-hero" data-intro-title>
      <span class="eyebrow">PREUVE90 · NOUVELLE EXPÉRIENCE</span>
      <h1>{SITE_CONFIG.tagline}</h1>
      <p>{SITE_CONFIG.description}</p>
    </header>

    <section class="launch-panel" data-intro-panel>
      <span class="launch-status">
        <span aria-hidden="true" /> EN PRÉPARATION
      </span>
      <p>
        Le service public est en cours de conception. Cette page sera mise à jour lorsque la
        nouvelle expérience sera prête.
      </p>
    </section>
  </DashboardIntro>
));

export const head = createDocumentHead(
  "Preuve90 — Nouvelle expérience en préparation",
  SITE_CONFIG.description,
  "/",
);
