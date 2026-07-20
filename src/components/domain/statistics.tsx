import { component$ } from "@builder.io/qwik";
import { STATUS_LABELS } from "~/config/product";
import { formatMoney, formatPercent, formatSignedMoney } from "~/lib/formatting/format";
import type { PredictionStatistics, PredictionStatus } from "~/types/prediction";
import { Panel, StatCard } from "~/components/ui/primitives";

export const StatisticsGrid = component$<{ statistics: PredictionStatistics }>(({ statistics }) => (
  <div class="statistics-grid">
    <StatCard
      label="Pronostics"
      value={statistics.totalPredictions}
      note={`${statistics.pendingPredictions} en attente`}
    />
    <StatCard
      label="Taux de réussite"
      value={statistics.successRate ?? 0}
      format="percent"
      note={
        statistics.successRate === null
          ? "Aucune issue décisive"
          : `${statistics.wonPredictions} gagnés / ${statistics.lostPredictions} perdus`
      }
      tone="positive"
    />
    <StatCard
      label="Résultat net"
      value={statistics.netResultCents}
      format="money"
      note={`Sur ${formatMoney(statistics.totalSettledStakeCents)} de mises réglées`}
      tone={statistics.netResultCents >= 0 ? "positive" : "negative"}
    />
    <StatCard
      label="Rendement observé"
      value={statistics.roi ?? 0}
      format="percent"
      note={statistics.roi === null ? "Aucune mise réglée" : "Net / mises réglées"}
      tone={statistics.netResultCents >= 0 ? "positive" : "negative"}
    />
  </div>
));

export const StatusDistribution = component$<{ statistics: PredictionStatistics }>(
  ({ statistics }) => {
    const statuses: PredictionStatus[] = ["WON", "LOST", "VOID", "PENDING"];
    const denominator = Math.max(1, statistics.totalPredictions);
    return (
      <Panel class="distribution-panel">
        <h2>Répartition des statuts</h2>
        <div class="distribution-list">
          {statuses.map((status) => {
            const count = statistics.statusDistribution[status];
            const percentage = count / denominator;
            return (
              <div key={status} class="distribution-row">
                <div>
                  <span class={`status-dot status-${status.toLowerCase()}`} aria-hidden="true" />
                  <strong>{STATUS_LABELS[status]}</strong>
                  <span>{count}</span>
                </div>
                <div
                  class="distribution-track"
                  aria-label={`${STATUS_LABELS[status]} : ${formatPercent(percentage)}`}
                >
                  <span
                    class={`status-${status.toLowerCase()}`}
                    style={{ width: `${percentage * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    );
  },
);

export const CumulativePerformanceChart = component$<{ statistics: PredictionStatistics }>(
  ({ statistics }) => {
    const points = statistics.cumulativePerformance;
    const width = 720;
    const height = 260;
    const padding = 34;
    const values = points.map((point) => point.netResultCents);
    const min = Math.min(0, ...values);
    const max = Math.max(0, ...values);
    const range = Math.max(1, max - min);
    const coordinates = points.map((point, index) => ({
      ...point,
      x:
        points.length <= 1
          ? width / 2
          : padding + (index / (points.length - 1)) * (width - padding * 2),
      y: padding + ((max - point.netResultCents) / range) * (height - padding * 2),
    }));
    const zeroY = padding + ((max - 0) / range) * (height - padding * 2);
    const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
    const finalValue = points.at(-1)?.netResultCents ?? 0;
    const summary =
      points.length === 0
        ? "Aucun règlement : la courbe ne contient pas encore de point."
        : `${points.length} règlements. Le résultat cumulé final est ${formatSignedMoney(finalValue)}.`;

    return (
      <Panel class="chart-panel">
        <div class="chart-heading">
          <div>
            <span class="eyebrow">PERFORMANCE CUMULÉE</span>
            <h2>Résultat net dans le temps</h2>
          </div>
          <strong>{formatSignedMoney(finalValue)}</strong>
        </div>
        <p id="performance-summary" class="chart-summary">
          {summary}
        </p>
        {points.length === 0 ? (
          <div class="chart-empty">La première issue réglée créera le premier point.</div>
        ) : (
          <svg
            role="img"
            aria-labelledby="chart-title chart-desc"
            class="performance-chart"
            viewBox={`0 0 ${width} ${height}`}
          >
            <title id="chart-title">Évolution cumulative du résultat net virtuel</title>
            <desc id="chart-desc">{summary}</desc>
            <line class="chart-zero" x1={padding} x2={width - padding} y1={zeroY} y2={zeroY} />
            {points.length > 1 ? (
              <polyline class="chart-line" fill="none" points={polyline} />
            ) : null}
            {coordinates.map((point) => (
              <circle key={point.predictionId} class="chart-point" cx={point.x} cy={point.y} r="5">
                <title>{`${point.publicationDate} : ${formatSignedMoney(point.netResultCents)}`}</title>
              </circle>
            ))}
          </svg>
        )}
      </Panel>
    );
  },
);
