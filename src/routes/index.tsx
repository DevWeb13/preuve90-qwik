import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DashboardIntro } from "~/components/motion/motion";
import {
  PredictionHero,
  RecentPredictions,
  TransparencyNotice,
} from "~/components/domain/predictions";
import { StatisticsGrid } from "~/components/domain/statistics";
import { DataError, DemoBanner, EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { loadContentResult } from "~/lib/server/content-repository.server";
import { createDocumentHead } from "~/lib/formatting/seo";

export const useHomeContent = routeLoader$(() => loadContentResult());

export default component$(() => {
  const content = useHomeContent();

  if (content.value.state === "error") {
    return (
      <div class="route-stack">
        <DataError message={content.value.message} />
      </div>
    );
  }

  const { snapshot } = content.value;
  const featured = snapshot.predictions[0];

  return (
    <DashboardIntro>
      {snapshot.isDemo && <DemoBanner />}
      <header class="home-hero" data-intro-title>
        <span class="eyebrow">EXPÉRIENCE PUBLIQUE · FOOTBALL 1N2</span>
        <h1>{SITE_CONFIG.tagline}</h1>
        <p>{SITE_CONFIG.description}</p>
      </header>

      {featured ? (
        <PredictionHero prediction={featured} />
      ) : (
        <EmptyState
          title="Aucun pronostic publié"
          message="L’expérience n’a pas encore enregistré de pronostic réel. Rien n’est fabriqué pour remplir cet espace."
          actionHref="/methode/"
          actionLabel="Découvrir le protocole"
        />
      )}

      <section class="section-block" data-intro-panel>
        <div class="section-header">
          <span class="eyebrow">MESURES ESSENTIELLES</span>
          <h2>Le tableau de bord de l’expérience</h2>
          <p>Des statistiques calculées exclusivement depuis les publications et règlements.</p>
        </div>
        <StatisticsGrid statistics={snapshot.statistics} />
      </section>

      {snapshot.predictions.length > 1 && (
        <RecentPredictions predictions={snapshot.predictions.slice(1, 4)} />
      )}
      <TransparencyNotice />
    </DashboardIntro>
  );
});

export const head = createDocumentHead(
  "Pronostics IA publics, résultats compris | Preuve90",
  SITE_CONFIG.description,
  "/",
);
