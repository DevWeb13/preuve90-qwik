import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  CumulativePerformanceChart,
  StatisticsGrid,
  StatusDistribution,
} from "~/components/domain/statistics";
import { DataError, DemoBanner, PageHeader, Panel } from "~/components/ui/primitives";
import { formatMoney } from "~/lib/formatting/format";
import { createDocumentHead } from "~/lib/formatting/seo";
import { loadContentResult } from "~/lib/server/content-repository.server";

export const useStatisticsContent = routeLoader$(() => loadContentResult());

export default component$(() => {
  const content = useStatisticsContent();
  if (content.value.state === "error") return <DataError message={content.value.message} />;

  const { snapshot } = content.value;
  const { statistics } = snapshot;

  return (
    <div class="route-stack">
      {snapshot.isDemo && <DemoBanner />}
      <PageHeader
        eyebrow="MESURES DÉRIVÉES"
        title="Statistiques de l’expérience"
        description="Aucune valeur n’est saisie à la main : chaque indicateur est recalculé depuis les faits immuables."
      />
      <StatisticsGrid statistics={statistics} />
      <div class="stats-panels">
        <StatusDistribution statistics={statistics} />
        <Panel class="observation-panel">
          <span class="eyebrow">ÉCHANTILLON</span>
          <strong>{statistics.totalPredictions}</strong>
          <p>
            pronostic{statistics.totalPredictions > 1 ? "s" : ""} observé
            {statistics.totalPredictions > 1 ? "s" : ""} sur {statistics.daysSinceFirstPublication}{" "}
            jour{statistics.daysSinceFirstPublication > 1 ? "s" : ""}.
          </p>
          <dl>
            <div>
              <dt>Mises virtuelles totales</dt>
              <dd>{formatMoney(statistics.totalVirtualStakeCents)}</dd>
            </div>
            <div>
              <dt>Retours réalisés</dt>
              <dd>{formatMoney(statistics.totalRealizedReturnCents)}</dd>
            </div>
            <div>
              <dt>Pronostics réglés</dt>
              <dd>{statistics.settledPredictions}</dd>
            </div>
          </dl>
        </Panel>
      </div>
      <CumulativePerformanceChart statistics={statistics} />
      <Panel class="formula-panel">
        <h2>Formules publiques</h2>
        <div class="formula-grid">
          <div>
            <code>taux de réussite</code>
            <p>Gagnés ÷ (gagnés + perdus). Les annulations sont exclues.</p>
          </div>
          <div>
            <code>rendement observé</code>
            <p>Résultat net ÷ total des mises virtuelles réglées.</p>
          </div>
          <div>
            <code>résultat net</code>
            <p>Retours réalisés − mises virtuelles des pronostics réglés.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
});

export const head = createDocumentHead(
  "Statistiques transparentes",
  "Taux de réussite, rendement observé et évolution cumulative des pronostics IA de Preuve90.",
  "/statistiques/",
);
