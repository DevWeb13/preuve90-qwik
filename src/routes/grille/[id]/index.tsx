import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { EmptyState } from "~/components/ui/primitives";
import { getLotoFootPublicationById } from "~/content/loto-foot/publications";
import { getLotoFootResultByPublicationId } from "~/content/loto-foot/results";
import { calculatePublicationSettlement } from "~/content/loto-foot/settlement";
import { createDocumentHead } from "~/lib/formatting/seo";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export const usePublication = routeLoader$(({ params, status }) => {
  const publication = getLotoFootPublicationById(params.id);

  if (!publication) status(404);
  return publication
    ? { publication, result: getLotoFootResultByPublicationId(publication.id) }
    : undefined;
});

export default component$(() => {
  const data = usePublication().value;

  if (!data) {
    return (
      <div class="not-found-page">
        <span aria-hidden="true" class="error-code">
          404
        </span>
        <EmptyState
          title="Grille introuvable"
          message="Cette publication Loto Foot 7 n’existe pas ou n’est plus accessible."
          actionHref="/"
          actionLabel="Retour aux publications"
          headingLevel="h1"
        />
      </div>
    );
  }

  const { publication, result } = data;
  const settlement = calculatePublicationSettlement(publication, result);
  const virtualStake = currencyFormatter.format(settlement.stakeCents / 100);

  return (
    <div class="route-stack publication-detail">
      <Link class="back-link" href="/">
        <span aria-hidden="true">←</span> Toutes les publications
      </Link>

      <header class="detail-header">
        <div>
          <span class="eyebrow">LOTO FOOT 7 · PUBLICATION HORODATÉE</span>
          <h1>Grille n° {publication.gridNumber}</h1>
          <p class={result ? "results-status settled-status" : "results-status"}>
            {result
              ? `Réglée le ${dateFormatter.format(new Date(result.settledAt))}`
              : "Résultats en attente"}
          </p>
        </div>
        <dl class="detail-meta">
          <div>
            <dt>Publiée le</dt>
            <dd>{dateFormatter.format(new Date(publication.publishedAt))}</dd>
          </div>
          <div>
            <dt>Date limite</dt>
            <dd>{dateFormatter.format(new Date(publication.validationDeadline))}</dd>
          </div>
          <div>
            <dt>Combinaisons</dt>
            <dd>{publication.tickets.length}</dd>
          </div>
          <div>
            <dt>Mise virtuelle totale</dt>
            <dd>{virtualStake}</dd>
          </div>
        </dl>
        <a class="official-link" href={publication.officialUrl} target="_blank" rel="noreferrer">
          Consulter la grille officielle <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section aria-labelledby="matches-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">ANALYSE MATCH PAR MATCH</span>
            <h2 id="matches-title">Les {publication.matches.length} matchs officiels</h2>
          </div>
          <span class="method-badge">Méthode {publication.methodVersion}</span>
        </div>

        <div class="match-list">
          {publication.matches.map((match) => {
            const officialResult = result?.matches[match.position - 1];
            return (
              <article class="match-card" key={match.position}>
                <header class="match-heading">
                  <span class="match-position">{match.position}</span>
                  <div>
                    {match.competition && <span class="competition">{match.competition}</span>}
                    <h3>
                      {match.homeTeam} <span>—</span> {match.awayTeam}
                    </h3>
                    {match.startsAt && (
                      <p>Début prévu : {dateFormatter.format(new Date(match.startsAt))}</p>
                    )}
                  </div>
                </header>

                {officialResult && (
                  <div
                    class="official-result"
                    aria-label={`Résultat officiel du match ${match.position}`}
                  >
                    <span>Résultat officiel : {officialResult.selection}</span>
                    {officialResult.homeScore !== undefined && (
                      <strong>
                        Score : {officialResult.homeScore}–{officialResult.awayScore}
                      </strong>
                    )}
                  </div>
                )}

                <dl
                  class="probability-grid"
                  aria-label={`Probabilités pour le match ${match.position}`}
                >
                  <div>
                    <dt>1</dt>
                    <dd>{match.probabilities.home} %</dd>
                  </div>
                  <div>
                    <dt>N</dt>
                    <dd>{match.probabilities.draw} %</dd>
                  </div>
                  <div>
                    <dt>2</dt>
                    <dd>{match.probabilities.away} %</dd>
                  </div>
                </dl>

                <div class="analysis-copy">
                  <div>
                    <h4>Résumé</h4>
                    <p>{match.analysis.summary}</p>
                  </div>
                  <div>
                    <h4>Facteurs principaux</h4>
                    <ul>
                      {match.analysis.keyFactors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Incertitude</h4>
                    <p>{match.analysis.uncertainty}</p>
                  </div>
                  <div>
                    <h4>Sources publiques</h4>
                    <ul class="source-list">
                      {match.analysis.sources.map((source) => (
                        <li key={`${source.url}-${source.accessedAt}`}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.label} <span aria-hidden="true">↗</span>
                          </a>
                          <small>
                            Consultée le {dateFormatter.format(new Date(source.accessedAt))}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="tickets-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">SIMULATIONS · 1 EUR PAR COMBINAISON</span>
            <h2 id="tickets-title">Combinaisons virtuelles</h2>
          </div>
          <span class="count-badge">Total virtuel : {virtualStake}</span>
        </div>
        <div class="ticket-grid">
          {publication.tickets.map((ticket) => {
            const ticketSettlement = settlement.ticketSettlements.find(
              ({ ticket: settledTicket }) => settledTicket.id === ticket.id,
            );
            return (
              <article class="ticket-card" key={ticket.id}>
                <h3>{ticket.label}</h3>
                <p class="ticket-selections" role="list">
                  {ticket.selections.map((selection, index) => {
                    const isCorrect = result
                      ? selection === result.matches[index].selection
                      : undefined;
                    return (
                      <span
                        class={
                          isCorrect === undefined
                            ? undefined
                            : isCorrect
                              ? "selection-correct"
                              : "selection-incorrect"
                        }
                        aria-label={
                          isCorrect === undefined
                            ? `Match ${index + 1} : ${selection}`
                            : `Match ${index + 1} : ${selection}, ${isCorrect ? "correct" : "incorrect"}`
                        }
                        role="listitem"
                        key={`${ticket.id}-${index}`}
                      >
                        {selection}
                      </span>
                    );
                  })}
                </p>
                <p>{ticket.rationale}</p>
                {ticketSettlement && (
                  <dl class="ticket-result">
                    <div>
                      <dt>Bons choix</dt>
                      <dd>
                        {ticketSettlement.correctSelections} / {publication.matches.length}
                      </dd>
                    </div>
                    <div>
                      <dt>Rapport obtenu</dt>
                      <dd>{currencyFormatter.format(ticketSettlement.payoutCents / 100)}</dd>
                    </div>
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {result && (
        <section aria-labelledby="settlement-title">
          <div class="section-heading">
            <div>
              <span class="eyebrow">RÈGLEMENT OFFICIEL</span>
              <h2 id="settlement-title">Bilan de la grille</h2>
            </div>
          </div>
          <dl class="settlement-summary">
            <div>
              <dt>Mise totale</dt>
              <dd>{currencyFormatter.format(settlement.stakeCents / 100)}</dd>
            </div>
            <div>
              <dt>Retour total</dt>
              <dd>{currencyFormatter.format(settlement.returnCents / 100)}</dd>
            </div>
            <div>
              <dt>Résultat net</dt>
              <dd>{currencyFormatter.format(settlement.netCents / 100)}</dd>
            </div>
          </dl>
          <div class="result-sources">
            <h3>Sources officielles du règlement</h3>
            <ul class="source-list">
              {result.sources.map((source) => (
                <li key={`${source.url}-${source.accessedAt}`}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label} <span aria-hidden="true">↗</span>
                  </a>
                  <small>Consultée le {dateFormatter.format(new Date(source.accessedAt))}</small>
                </li>
              ))}
            </ul>
            <a class="official-link" href={result.officialUrl} target="_blank" rel="noreferrer">
              Consulter le résultat officiel <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      )}

      <aside class="disclaimer-panel" aria-label="Avertissement">
        <strong>Simulation sans argent réel.</strong>
        <p>
          Ces pronostics peuvent être faux. Les performances passées ne garantissent aucun résultat
          futur. Preuve90 n’est affilié ni à FDJ ni à Parions Sport.
        </p>
      </aside>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(usePublication);

  if (!data) {
    return createDocumentHead(
      "Grille introuvable",
      "Cette publication Loto Foot 7 n’existe pas.",
      "/",
      true,
    );
  }

  const { publication } = data;

  return createDocumentHead(
    `Grille Loto Foot 7 n° ${publication.gridNumber}`,
    `Analyse et combinaisons virtuelles de la grille Loto Foot 7 n° ${publication.gridNumber}.`,
    `/grille/${encodeURIComponent(publication.id)}/`,
  );
};
