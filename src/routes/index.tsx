import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DashboardIntro } from "~/components/motion/motion";
import {
  DailyPredictions,
  RecentPredictions,
  TransparencyNotice,
} from "~/components/domain/predictions";
import { StatisticsGrid } from "~/components/domain/statistics";
import { DataError, DemoBanner, EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { loadContentResult } from "~/lib/server/content-repository.server";
import { createDocumentHead } from "~/lib/formatting/seo";
import { PRODUCT_CONFIG } from "~/config/product";
import { getDateKeyInTimeZone } from "~/lib/domain/calendar";
import { selectPredictionsForDate } from "~/lib/domain/predictions";
import { formatCalendarDate } from "~/lib/formatting/format";

export const useHomeContent = routeLoader$(() => {
  const referenceDate = new Date();
  return {
    content: loadContentResult(referenceDate),
    todayDateKey: getDateKeyInTimeZone(referenceDate, PRODUCT_CONFIG.timezone),
  };
});

export default component$(() => {
  const content = useHomeContent();

  if (content.value.content.state === "error") {
    return (
      <div class="route-stack">
        <DataError message={content.value.content.message} />
      </div>
    );
  }

  const { snapshot } = content.value.content;
  const todayPredictions = selectPredictionsForDate(
    snapshot.predictions,
    content.value.todayDateKey,
    PRODUCT_CONFIG.timezone,
  );
  const recentHistorical = snapshot.predictions
    .filter((prediction) => !todayPredictions.some((today) => today.id === prediction.id))
    .slice(0, 3);

  return (
    <DashboardIntro>
      {snapshot.isDemo && <DemoBanner />}
      <header class="home-hero" data-intro-title>
        <span class="eyebrow">EXPÉRIENCE PUBLIQUE · FOOTBALL 1N2</span>
        <h1>{SITE_CONFIG.tagline}</h1>
        <p>{SITE_CONFIG.description}</p>
      </header>

      {todayPredictions.length > 0 ? (
        <DailyPredictions
          predictions={todayPredictions}
          dateLabel={formatCalendarDate(content.value.todayDateKey)}
          isDemo={snapshot.isDemo}
        />
      ) : (
        <EmptyState
          title="Aucun pronostic publié aujourd’hui"
          message="Le protocole ne force aucune sélection lorsqu’aucun match ne présente un niveau de pertinence suffisant."
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

      {recentHistorical.length > 0 && <RecentPredictions predictions={recentHistorical} />}
      <TransparencyNotice />
    </DashboardIntro>
  );
});

export const head = createDocumentHead(
  "Pronostics IA publics, résultats compris | Preuve90",
  SITE_CONFIG.description,
  "/",
);
