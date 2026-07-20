import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PRODUCT_CONFIG } from "~/config/product";
import {
  formatDateTime,
  formatMoney,
  formatShortDate,
  formatSignedMoney,
  getSelectionLabel,
} from "~/lib/formatting/format";
import type { PredictionView } from "~/types/prediction";
import { PredictionReel, ResultMotion } from "~/components/motion/motion";
import { Badge, ButtonLink, Card, SectionHeader, StatusBadge } from "~/components/ui/primitives";
import { Icon } from "~/components/ui/icon";

export const MatchDisplay = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <div class="match-display">
    <span>{prediction.match.homeTeam}</span>
    <strong aria-label="contre">VS</strong>
    <span>{prediction.match.awayTeam}</span>
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
            <span class="data-label">Score final</span>
            <strong class="score">
              {prediction.settlement.finalScore.home} — {prediction.settlement.finalScore.away}
            </strong>
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
          <strong>Coup d’envoi prévu</strong>
          <time dateTime={prediction.kickoffAt}>{formatDateTime(prediction.kickoffAt)}</time>
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

export const PredictionHero = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <article class="prediction-hero" data-intro-panel>
    <div class="prediction-hero-topline">
      <div>
        <span class="eyebrow">PRONOSTIC DU JOUR · {prediction.competition.name}</span>
        <time dateTime={prediction.kickoffAt}>{formatDateTime(prediction.kickoffAt)}</time>
      </div>
      <StatusBadge status={prediction.status} />
    </div>

    <div class="prediction-main-grid">
      <div>
        <MatchDisplay prediction={prediction} />
        <div class="selection-copy">
          <span class="data-label">Sélection publiée</span>
          <strong>{getSelectionLabel(prediction.selection)}</strong>
        </div>
      </div>
      <PredictionReel selection={prediction.selection} />
    </div>

    <div class="data-grid">
      <OddsDisplay prediction={prediction} />
      <VirtualStakeDisplay cents={prediction.virtualStakeCents} />
      <div class="data-cell">
        <span class="data-label">Cote observée</span>
        <strong>{formatDateTime(prediction.bookmaker.observedAt)}</strong>
        <small>Avant publication</small>
      </div>
    </div>

    <PredictionReasoning prediction={prediction} />
    <div class="prediction-hero-actions">
      <ButtonLink href={`/pronostic/${prediction.id}/`} label="Voir la preuve complète" />
      <span class="proof-id">ID · {prediction.id}</span>
    </div>
  </article>
));

export const PredictionCard = component$<{ prediction: PredictionView }>(({ prediction }) => (
  <Card class={`prediction-card status-border-${prediction.status.toLowerCase()}`}>
    <Link
      aria-label={`Ouvrir la preuve ${prediction.match.homeTeam} contre ${prediction.match.awayTeam}`}
      class="card-cover-link"
      href={`/pronostic/${prediction.id}/`}
    />
    <div class="prediction-card-head">
      <div>
        <span class="eyebrow">{prediction.competition.name}</span>
        <time dateTime={prediction.kickoffAt}>{formatShortDate(prediction.kickoffAt)}</time>
      </div>
      <StatusBadge status={prediction.status} />
    </div>
    <div class="prediction-card-match">
      <strong>{prediction.match.homeTeam}</strong>
      <span>—</span>
      <strong>{prediction.match.awayTeam}</strong>
    </div>
    <div class="prediction-card-data">
      <span>
        <small>SÉLECTION</small>
        <strong>{getSelectionLabel(prediction.selection)}</strong>
      </span>
      <span>
        <small>COTE</small>
        <strong>{prediction.recordedOdds}</strong>
      </span>
      <span>
        <small>NET</small>
        <strong>
          {prediction.netResultCents === null ? "—" : formatSignedMoney(prediction.netResultCents)}
        </strong>
      </span>
    </div>
  </Card>
));

export const RecentPredictions = component$<{ predictions: PredictionView[] }>(
  ({ predictions }) => (
    <section class="section-block">
      <SectionHeader
        eyebrow="JOURNAL IMMUABLE"
        title="Derniers résultats"
        description="Chaque issue reste visible, y compris les pertes et annulations."
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
