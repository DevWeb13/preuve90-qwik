import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PRODUCT_CONFIG } from "~/config/product";
import {
  formatDateTime,
  formatBasisPoints,
  formatMoney,
  formatShortDateTime,
  formatSignedBasisPoints,
  formatSignedMoney,
} from "~/lib/formatting/format";
import { getBreakEvenProbabilityBps, getEstimatedValueBps } from "~/lib/domain/money";
import type { PredictionView } from "~/types/prediction";
import { ResultMotion } from "~/components/motion/motion";
import { Badge, ButtonLink, Card, SectionHeader, StatusBadge } from "~/components/ui/primitives";
import { Icon } from "~/components/ui/icon";

export const EventDisplay = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <div class="match-display">
    <span>{prediction.event.participantA}</span>
    <strong aria-label="contre">VS</strong>
    <span>{prediction.event.participantB}</span>
  </div>
));

export const OddsDisplay = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <div class="data-cell odds-display">
    <span class="data-label">Cote enregistrée</span>
    <strong>{prediction.recordedOdds}</strong>
    <small>{prediction.bookmaker.name}</small>
  </div>
));

export const VirtualStakeDisplay = component$<{ cents: number }>(({ cents }) => (
  <div class="data-cell">
    <span class="data-label">Mise virtuelle fixe</span>
    <strong>{formatMoney(cents)}</strong>
    <small>Aucun argent réel</small>
  </div>
));

export const EstimatedValueDisplay = component$<{ prediction: PredictionView }>(
  ({ prediction }) => {
    const estimatedValueBps = getEstimatedValueBps(
      prediction.reasoning.estimatedProbabilityBps,
      prediction.recordedOdds,
    );
    return (
      <>
        <div class="data-cell">
          <span class="data-label">Probabilité estimée par l’IA</span>
          <strong>{formatBasisPoints(prediction.reasoning.estimatedProbabilityBps)}</strong>
          <small>
            Seuil de rentabilité :{" "}
            {formatBasisPoints(getBreakEvenProbabilityBps(prediction.recordedOdds))}
          </small>
        </div>
        <div class="data-cell">
          <span class="data-label">Valeur estimée par l’IA</span>
          <strong>{formatSignedBasisPoints(estimatedValueBps)}</strong>
          <small>Estimation incertaine, pas un bénéfice réalisé</small>
        </div>
      </>
    );
  },
);

export const PredictionReasoning = component$<{
  prediction: PredictionView;
  detailed?: boolean;
}>(({ prediction, detailed = false }) => (
  <section class="reasoning">
    <h2>{detailed ? "Justification publiée" : "Pourquoi cette sélection ?"}</h2>
    <p>{prediction.reasoning.summary}</p>
    {detailed && (
      <>
        <h3>Facteurs considérés</h3>
        <ul>
          {prediction.reasoning.factors.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
        <div class="uncertainty">
          <strong>Incertitude documentée</strong>
          <p>{prediction.reasoning.uncertainty}</p>
        </div>
      </>
    )}
  </section>
));

export const SettlementSummary = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <ResultMotion status={prediction.status}>
    <section class="settlement-summary">
      <div>
        <span class="data-label">État observé</span>
        <StatusBadge status={prediction.status} />
      </div>
      {prediction.settlement ? (
        <>
          <div>
            <span class="data-label">Issue gagnante</span>
            <strong>{prediction.settlement.result.winningOutcomeName ?? "Événement annulé"}</strong>
            {prediction.settlement.result.scores && (
              <small class="score-list">
                {prediction.settlement.result.scores
                  .map((score) => `${score.name} : ${score.value}`)
                  .join(" · ")}
              </small>
            )}
          </div>
          <div>
            <span class="data-label">Retour virtuel</span>
            <strong>{formatMoney(prediction.realizedReturnCents ?? 0)}</strong>
          </div>
          <div>
            <span class="data-label">Résultat net</span>
            <strong>{formatSignedMoney(prediction.netResultCents ?? 0)}</strong>
          </div>
        </>
      ) : (
        <p>Le règlement sera ajouté comme un fait distinct lorsque le résultat sera certain.</p>
      )}
    </section>
  </ResultMotion>
));

export const ProofTimeline = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <section class="proof-timeline" aria-labelledby="timeline-title">
    <h2 id="timeline-title">Chronologie de la preuve</h2>
    <ol>
      <li>
        <Icon name="proof" size={19} />
        <div>
          <strong>Publication immuable</strong>
          <time dateTime={prediction.publishedAt}>{formatDateTime(prediction.publishedAt)}</time>
        </div>
      </li>
      <li>
        <Icon name="clock" size={19} />
        <div>
          <strong>Début prévu</strong>
          <time dateTime={prediction.startsAt}>{formatDateTime(prediction.startsAt)}</time>
        </div>
      </li>
      <li>
        <Icon name={prediction.settlement ? "check" : "clock"} size={19} />
        <div>
          <strong>{prediction.settlement ? "Règlement ajouté" : "Règlement en attente"}</strong>
          {prediction.settlement ? (
            <time dateTime={prediction.settlement.settledAt}>
              {formatDateTime(prediction.settlement.settledAt)}
            </time>
          ) : (
            <span>Aucun fait de règlement publié</span>
          )}
        </div>
      </li>
    </ol>
  </section>
));

export const PredictionCard = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <Card class={`prediction-card status-border-${prediction.status.toLowerCase()}`}>
    <Link
      aria-label={`Ouvrir la preuve ${prediction.event.participantA} contre ${prediction.event.participantB}`}
      class="card-cover-link"
      href={`/pronostic/${prediction.id}/`}
    />
    <div class="prediction-card-head">
      <div>
        <span class="eyebrow">{prediction.sport.title}</span>
        <time dateTime={prediction.startsAt}>{formatShortDateTime(prediction.startsAt)}</time>
      </div>
      <StatusBadge status={prediction.status} />
    </div>
    <div class="prediction-card-match">
      <strong>{prediction.event.participantA}</strong>
      <span>—</span>
      <strong>{prediction.event.participantB}</strong>
    </div>
    <div class="prediction-card-outcomes" aria-label="Issues du marché h2h">
      {prediction.market.outcomes.map((outcome) => (
        <span key={outcome.name} class={{ selected: outcome.name === prediction.selection.name }}>
          {outcome.name} <strong>{outcome.odds}</strong>
        </span>
      ))}
    </div>
    <div class="prediction-card-data">
      <span>
        <small>SÉLECTION</small>
        <strong>{prediction.selection.name}</strong>
      </span>
      <span>
        <small>COTE</small>
        <strong>{prediction.recordedOdds}</strong>
        <em>{prediction.bookmaker.name}</em>
      </span>
      <span>
        <small>MISE VIRTUELLE</small>
        <strong>{formatMoney(prediction.virtualStakeCents)}</strong>
      </span>
      <span>
        <small>PROBABILITÉ IA</small>
        <strong>{formatBasisPoints(prediction.reasoning.estimatedProbabilityBps)}</strong>
      </span>
      <span>
        <small>VALEUR IA</small>
        <strong>
          {formatSignedBasisPoints(
            getEstimatedValueBps(
              prediction.reasoning.estimatedProbabilityBps,
              prediction.recordedOdds,
            ),
          )}
        </strong>
      </span>
      <span>
        <small>STATUT / NET</small>
        <strong>
          {prediction.netResultCents === null
            ? "En attente"
            : formatSignedMoney(prediction.netResultCents)}
        </strong>
      </span>
    </div>
    <div class="prediction-card-analysis">
      <p>{prediction.reasoning.summary}</p>
      <small>
        <strong>Incertitude :</strong> {prediction.reasoning.uncertainty}
      </small>
    </div>
  </Card>
));

export const DailyPredictions = component$<{
  predictions: PredictionView[];
  dateLabel: string;
  isDemo: boolean;
}>(({ predictions, dateLabel, isDemo }) => (
  <section class="section-block daily-predictions" data-intro-panel>
    <SectionHeader
      eyebrow={isDemo ? "PRONOSTICS DE DÉMONSTRATION" : "PRONOSTICS DU JOUR"}
      title={`${predictions.length} pronostic${predictions.length > 1 ? "s" : ""} publié${predictions.length > 1 ? "s" : ""}`}
      description={`${dateLabel} · Chaque publication possède sa propre preuve, sa cote enregistrée et sa mise virtuelle fixe.`}
    />
    <div class="prediction-list daily-predictions-grid">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  </section>
));

export const RecentPredictions = component$<{ predictions: PredictionView[] }>(
  ({ predictions }) => (
    <section class="section-block">
      <SectionHeader
        eyebrow="JOURNAL IMMUABLE"
        title="Derniers résultats"
        description="Chaque résultat reste visible, y compris les pertes et annulations."
      />
      <div class="prediction-list compact-list">
        {predictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </div>
      <ButtonLink href="/historique/" label="Consulter tout l’historique" class="section-action" />
    </section>
  ),
);

export const TransparencyNotice = component$(() => (
  <aside class="transparency-notice">
    <Badge>PROTOCOLE TRANSPARENT</Badge>
    <div>
      <h2>Une cote observée, pas une promesse.</h2>
      <p>
        La référence est {PRODUCT_CONFIG.bookmaker.name}. La cote horodatée ne prouve pas qu’un pari
        aurait été accepté pour une personne donnée. Aucun pari réel n’est placé.
      </p>
    </div>
    <ButtonLink href="/methode/" label="Lire la méthode" />
  </aside>
));
