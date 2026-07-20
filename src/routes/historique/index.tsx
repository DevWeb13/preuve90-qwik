import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PredictionCard } from "~/components/domain/predictions";
import { DataError, DemoBanner, EmptyState, PageHeader } from "~/components/ui/primitives";
import { STATUS_LABELS } from "~/config/product";
import { createDocumentHead } from "~/lib/formatting/seo";
import { loadContentResult } from "~/lib/server/content-repository.server";
import type { PredictionStatus } from "~/types/prediction";
import { PRODUCT_CONFIG } from "~/config/product";
import { groupPredictionsByPublicationDay } from "~/lib/domain/predictions";
import { formatCalendarDate } from "~/lib/formatting/format";

const FILTERS: { value: PredictionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "PENDING", label: STATUS_LABELS.PENDING },
  { value: "WON", label: "Gagnés" },
  { value: "LOST", label: "Perdus" },
  { value: "VOID", label: "Annulés" },
];

export const useHistoryContent = routeLoader$(() => loadContentResult());

export default component$(() => {
  const content = useHistoryContent();
  const activeFilter = useSignal<PredictionStatus | "ALL">("ALL");

  if (content.value.state === "error") {
    return <DataError message={content.value.message} />;
  }

  const { snapshot } = content.value;
  const visiblePredictions = snapshot.predictions.filter(
    (prediction) => activeFilter.value === "ALL" || prediction.status === activeFilter.value,
  );
  const dayGroups = groupPredictionsByPublicationDay(visiblePredictions, PRODUCT_CONFIG.timezone);

  return (
    <div class="route-stack">
      {snapshot.isDemo && <DemoBanner />}
      <PageHeader
        eyebrow="JOURNAL PUBLIC"
        title="Historique des pronostics"
        description="Toutes les publications dans l’ordre chronologique inverse, sans retrait des erreurs ni modification des cotes."
      />
      <div class="history-toolbar">
        <strong>
          {snapshot.predictions.length} pronostic{snapshot.predictions.length > 1 ? "s" : ""}
        </strong>
        <div aria-label="Filtrer par statut" class="filter-group" role="group">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              aria-pressed={activeFilter.value === filter.value}
              class={{ "filter-button": true, active: activeFilter.value === filter.value }}
              onClick$={() => (activeFilter.value = filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {snapshot.predictions.length === 0 ? (
        <EmptyState
          title="Historique vide"
          message="Aucune publication réelle n’existe encore. La méthode est disponible dès maintenant."
          actionHref="/methode/"
          actionLabel="Lire la méthode"
        />
      ) : visiblePredictions.length === 0 ? (
        <EmptyState
          title="Aucun résultat pour ce filtre"
          message="Les faits publiés restent disponibles dans les autres catégories."
        />
      ) : (
        <div class="history-groups" aria-live="polite">
          {dayGroups.map((group) => (
            <section
              key={group.dateKey}
              class="history-day"
              aria-labelledby={`history-day-${group.dateKey}`}
            >
              <header>
                <h2 id={`history-day-${group.dateKey}`}>
                  <time dateTime={group.dateKey}>{formatCalendarDate(group.dateKey)}</time>
                </h2>
                <span>
                  {group.predictions.length} publication
                  {group.predictions.length > 1 ? "s" : ""}
                </span>
              </header>
              <div class="prediction-list">
                {group.predictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
});

export const head = createDocumentHead(
  "Historique complet des pronostics",
  "Consultez toutes les preuves Preuve90, leurs cotes enregistrées et leurs résultats, y compris les pertes.",
  "/historique/",
);
