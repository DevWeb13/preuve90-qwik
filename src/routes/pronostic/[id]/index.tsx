import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  MatchDisplay,
  OddsDisplay,
  PredictionReasoning,
  ProofTimeline,
  SettlementSummary,
  TransparencyNotice,
  VirtualStakeDisplay,
} from "~/components/domain/predictions";
import { PredictionReel } from "~/components/motion/motion";
import {
  Badge,
  ButtonLink,
  DataError,
  DemoBanner,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from "~/components/ui/primitives";
import { formatDateTime, getSelectionLabel } from "~/lib/formatting/format";
import { createDocumentHead } from "~/lib/formatting/seo";
import { loadContentResult } from "~/lib/server/content-repository.server";

export const usePredictionDetail = routeLoader$(({ params, status }) => {
  const content = loadContentResult();
  if (content.state === "error") return { state: "error" as const, message: content.message };
  const prediction = content.snapshot.predictions.find((item) => item.id === params.id);
  if (!prediction) {
    status(404);
    return { state: "not-found" as const };
  }
  return { state: "ready" as const, prediction, isDemo: content.snapshot.isDemo };
});

export default component$(() => {
  const detail = usePredictionDetail();

  if (detail.value.state === "error") return <DataError message={detail.value.message} />;
  if (detail.value.state === "not-found") {
    return (
      <EmptyState
        title="Preuve introuvable"
        message="Cet identifiant ne correspond à aucune publication vérifiée."
        actionHref="/historique/"
        actionLabel="Retour à l’historique"
        headingLevel="h1"
      />
    );
  }

  const { prediction, isDemo } = detail.value;
  return (
    <div class="route-stack proof-page">
      {isDemo && <DemoBanner />}
      <PageHeader
        eyebrow="PREUVE PERMANENTE"
        title={`${prediction.match.homeTeam} — ${prediction.match.awayTeam}`}
        description="La publication d’origine et son règlement éventuel sont présentés comme deux faits distincts."
      />
      <Panel class="proof-panel">
        <div class="proof-panel-head">
          <Badge class="immutable-badge">PUBLICATION IMMUABLE</Badge>
          <StatusBadge status={prediction.status} />
        </div>
        <div class="proof-id-line">
          <span>IDENTIFIANT</span>
          <code>{prediction.id}</code>
        </div>
        <div class="proof-match-grid">
          <div>
            <span class="eyebrow">
              {prediction.competition.name}
              {prediction.competition.country ? ` · ${prediction.competition.country}` : ""}
            </span>
            <MatchDisplay prediction={prediction} />
            <p>
              <strong>Sélection :</strong> {getSelectionLabel(prediction.selection)}
            </p>
          </div>
          <PredictionReel selection={prediction.selection} />
        </div>
        <div class="data-grid proof-data-grid">
          <OddsDisplay prediction={prediction} />
          <VirtualStakeDisplay cents={prediction.virtualStakeCents} />
          <div class="data-cell">
            <span class="data-label">Publication UTC</span>
            <strong>{formatDateTime(prediction.publishedAt)}</strong>
            <small>{prediction.publishedAt}</small>
          </div>
          <div class="data-cell">
            <span class="data-label">Coup d’envoi</span>
            <strong>{formatDateTime(prediction.kickoffAt)}</strong>
            <small>Temps réglementaire uniquement</small>
          </div>
          <div class="data-cell">
            <span class="data-label">Observation</span>
            <strong>{formatDateTime(prediction.bookmaker.observedAt)}</strong>
            <small>{prediction.bookmaker.name}</small>
          </div>
        </div>
      </Panel>
      <div class="proof-content-grid">
        <PredictionReasoning prediction={prediction} detailed />
        <SettlementSummary prediction={prediction} />
      </div>
      <ProofTimeline prediction={prediction} />
      <TransparencyNotice />
      <ButtonLink href="/historique/" label="Revenir à l’historique" class="back-link" />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const detail = resolveValue(usePredictionDetail);
  if (detail.state !== "ready") {
    return createDocumentHead(
      "Preuve introuvable",
      "Cette preuve Preuve90 n’existe pas.",
      "/",
      true,
    );
  }
  const { prediction } = detail;
  return createDocumentHead(
    `${prediction.match.homeTeam} – ${prediction.match.awayTeam} : pronostic publié | Preuve90`,
    `Preuve horodatée du pronostic ${getSelectionLabel(prediction.selection)}, cote ${prediction.recordedOdds} observée chez ${prediction.bookmaker.name}.`,
    `/pronostic/${prediction.id}/`,
    detail.isDemo,
  );
};
