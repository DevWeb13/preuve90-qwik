import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { MotionSection } from "~/components/motion/motion";
import { EmptyState } from "~/components/ui/primitives";
import { getLotoFootPublicationById } from "~/content/loto-foot/publications";
import { getLotoFootResultByPublicationId } from "~/content/loto-foot/results";
import { calculatePublicationSettlement } from "~/content/loto-foot/settlement";
import {
  formatCorrectAnswerScore,
  getLotoFootFormulaLabel,
  getNetPresentation,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
} from "~/lib/formatting/loto-foot-presentation";
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

const signedCurrencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  signDisplay: "always",
});

const formatNet = (netCents: number) =>
  netCents === 0 ? currencyFormatter.format(0) : signedCurrencyFormatter.format(netCents / 100);

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
          message="Cette publication Loto Foot n’existe pas ou n’est plus accessible."
          actionHref="/"
          actionLabel="Retour aux publications"
          headingLevel="h1"
        />
      </div>
    );
  }

  const { publication, result } = data;
  const settlement = calculatePublicationSettlement(publication, result);
  const displayStatus = getPublicationDisplayStatus(publication, result);
  const formulaLabel = getLotoFootFormulaLabel(publication.formula);
  const net = getNetPresentation(settlement.netCents);
  const bestScore =
    settlement.status === "settled"
      ? Math.max(...settlement.ticketSettlements.map(({ correctSelections }) => correctSelections))
      : undefined;

  return (
    <div class="publication-detail">
      <Link class="back-link" href="/">
        <span aria-hidden="true">←</span> Retour au tableau de contrôle
      </Link>

      <header class="detail-command-header">
        <div class="detail-title-block">
          <span class="eyebrow">{formulaLabel.toUpperCase()} · TRACE HORODATÉE</span>
          <h1>
            {formulaLabel} — grille n°{publication.gridNumber}
          </h1>
          <span class={`status-chip status-${displayStatus}`}>
            <span aria-hidden="true" />
            {getPublicationStatusLabel(displayStatus)}
          </span>
        </div>
        <dl class="detail-identity">
          <div>
            <dt>Date limite</dt>
            <dd>{dateFormatter.format(new Date(publication.validationDeadline))}</dd>
          </div>
          <div>
            <dt>Publication</dt>
            <dd>{dateFormatter.format(new Date(publication.publishedAt))}</dd>
          </div>
          <div>
            <dt>Combinaisons</dt>
            <dd>{publication.tickets.length}</dd>
          </div>
        </dl>
        <a class="official-link" href={publication.officialUrl} target="_blank" rel="noreferrer">
          Grille officielle <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section class="grid-financial-section" aria-labelledby="grid-financial-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">BILAN FINANCIER</span>
            <h2 id="grid-financial-title">Performance virtuelle de la grille</h2>
          </div>
        </div>
        <MotionSection kind="finance" class="grid-financial-stage">
          <span class="technical-sweep" data-motion-line aria-hidden="true" />
          <dl class="grid-financial-readout">
            <div data-finance-item>
              <dt>Mise totale</dt>
              <dd>
                <span
                  class="animated-amount"
                  data-count-cents={settlement.stakeCents}
                  aria-hidden="true"
                >
                  {currencyFormatter.format(settlement.stakeCents / 100)}
                </span>
                <span class="sr-only">{currencyFormatter.format(settlement.stakeCents / 100)}</span>
              </dd>
            </div>
            <div data-finance-item>
              <dt>Retour total</dt>
              <dd>
                <span
                  class="animated-amount"
                  data-count-cents={settlement.returnCents}
                  aria-hidden="true"
                >
                  {currencyFormatter.format(settlement.returnCents / 100)}
                </span>
                <span class="sr-only">
                  {currencyFormatter.format(settlement.returnCents / 100)}
                </span>
              </dd>
            </div>
            <div class={`grid-net tone-${net.tone}`} data-finance-item>
              <dt>Résultat net</dt>
              <dd>
                <span class="net-state-label">{net.label}</span>
                <span
                  class="animated-amount"
                  data-count-cents={settlement.netCents}
                  data-count-signed="true"
                  aria-hidden="true"
                >
                  {formatNet(settlement.netCents)}
                </span>
                <span class="sr-only">{formatNet(settlement.netCents)}</span>
              </dd>
            </div>
            <div class="grid-best-score" data-finance-item>
              <dt>Meilleur score obtenu</dt>
              <dd>
                {bestScore === undefined ? (
                  "En attente"
                ) : (
                  <>
                    <strong>
                      {bestScore}/{publication.matches.length}
                    </strong>
                    <small>{formatCorrectAnswerScore(bestScore, publication.matches.length)}</small>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </MotionSection>
      </section>

      <section class="official-results-section" aria-labelledby="official-results-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">ISSUE DE LA GRILLE</span>
            <h2 id="official-results-title">Résultat officiel</h2>
          </div>
          {result && <span class="method-badge">Publié par la source officielle</span>}
        </div>
        {result ? (
          <MotionSection kind="result" class="official-result-board">
            <p>Suite officielle des résultats, dans l’ordre des matchs :</p>
            <ol class="official-result-sequence" aria-label="Suite officielle des résultats">
              {result.matches.map((matchResult) => (
                <li data-result-pill key={matchResult.position}>
                  <small>Match {matchResult.position}</small>
                  <strong>{matchResult.selection}</strong>
                </li>
              ))}
            </ol>
            <span class="result-confirmation">
              <span aria-hidden="true">✓</span> Résultats réglés le{" "}
              {dateFormatter.format(new Date(result.settledAt))}
            </span>
          </MotionSection>
        ) : (
          <div class="waiting-panel">
            <strong>Résultat officiel en attente</strong>
            <p>La suite 1, N et 2 apparaîtra ici après publication officielle.</p>
          </div>
        )}
      </section>

      <section class="official-payouts-section" aria-labelledby="official-payouts-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">BARÈME DE RÈGLEMENT</span>
            <h2 id="official-payouts-title">Rapports officiels de la grille</h2>
          </div>
        </div>
        {result ? (
          <>
            <p class="section-intro">
              Chaque montant correspond au rapport officiel de cette grille pour le nombre de bonnes
              réponses indiqué.
            </p>
            <MotionSection kind="payouts" class="official-payout-list">
              {result.payouts.map((payout) => (
                <article data-payout-item key={payout.correctSelections}>
                  <span class="payout-score">
                    <strong>{payout.correctSelections}</strong>
                    <small>
                      bonne{payout.correctSelections > 1 ? "s" : ""} réponse
                      {payout.correctSelections > 1 ? "s" : ""}
                    </small>
                  </span>
                  <span class="payout-amount">
                    {currencyFormatter.format(payout.amountCents / 100)}
                  </span>
                  <span class="payout-caption">Rapport officiel</span>
                </article>
              ))}
            </MotionSection>
          </>
        ) : (
          <div class="waiting-panel">
            <strong>Rapports en attente</strong>
            <p>Rapports officiels disponibles après publication des résultats.</p>
          </div>
        )}
      </section>

      <section class="tickets-section" aria-labelledby="tickets-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">PERFORMANCE DES COMBINAISONS</span>
            <h2 id="tickets-title">Les choix confrontés au réel</h2>
          </div>
          <span class="count-badge">{publication.tickets.length} combinaison(s)</span>
        </div>
        <p class="selection-legend">
          <span class="legend-correct">
            <span aria-hidden="true">✓</span> Correct
          </span>
          <span class="legend-incorrect">
            <span aria-hidden="true">×</span> Incorrect
          </span>
          {!result && <span>· Verdicts disponibles après les résultats</span>}
        </p>
        <MotionSection kind="tickets" class="ticket-grid">
          {publication.tickets.map((ticket, ticketIndex) => {
            const ticketSettlement = settlement.ticketSettlements.find(
              ({ ticket: settledTicket }) => settledTicket.id === ticket.id,
            );
            const ticketState = !ticketSettlement
              ? "pending"
              : ticketSettlement.payoutCents > 0
                ? "winning"
                : "losing";
            const ticketStateLabel =
              ticketState === "winning"
                ? "Gagnante"
                : ticketState === "losing"
                  ? "Perdue"
                  : "En attente";

            return (
              <article class={`ticket-card ticket-${ticketState}`} data-ticket-item key={ticket.id}>
                <header>
                  <span class="ticket-index">
                    COMBINAISON {String(ticketIndex + 1).padStart(2, "0")}
                  </span>
                  <span class={`ticket-state ticket-state-${ticketState}`}>
                    <span aria-hidden="true" />
                    {ticketStateLabel}
                  </span>
                  <h3>{ticket.label}</h3>
                </header>

                <div class="ticket-scoreline">
                  <strong>
                    {ticketSettlement
                      ? formatCorrectAnswerScore(
                          ticketSettlement.correctSelections,
                          publication.matches.length,
                        )
                      : `Score en attente sur ${publication.matches.length}`}
                  </strong>
                  <span>
                    Gain :{" "}
                    {ticketSettlement
                      ? currencyFormatter.format(ticketSettlement.payoutCents / 100)
                      : "en attente"}
                  </span>
                </div>

                <div class="ticket-selections" role="list" aria-label={`Choix de ${ticket.label}`}>
                  {ticket.selections.map((selection, index) => {
                    const isCorrect = result
                      ? selection === result.matches[index].selection
                      : undefined;
                    return (
                      <span
                        class={{
                          "ticket-selection": true,
                          "selection-correct": isCorrect === true,
                          "selection-incorrect": isCorrect === false,
                        }}
                        aria-label={`Match ${index + 1} : choix ${selection}${
                          isCorrect === undefined
                            ? ", en attente"
                            : isCorrect
                              ? ", correct"
                              : ", incorrect"
                        }`}
                        role="listitem"
                        key={`${ticket.id}-${index}`}
                      >
                        <small>M{index + 1}</small>
                        <strong>{selection}</strong>
                        <span class="selection-verdict">
                          {isCorrect === undefined ? "…" : isCorrect ? "✓" : "×"}
                          <span class="sr-only">
                            {isCorrect === undefined
                              ? "En attente"
                              : isCorrect
                                ? "Correct"
                                : "Incorrect"}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p class="ticket-rationale">{ticket.rationale}</p>
              </article>
            );
          })}
        </MotionSection>
      </section>

      <section class="comparison-section" aria-labelledby="comparison-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">LECTURE CROISÉE</span>
            <h2 id="comparison-title">Comparaison match par match</h2>
          </div>
        </div>
        <MotionSection kind="comparison" class="comparison-board">
          <div class="comparison-desktop">
            <table>
              <caption class="sr-only">
                Résultat officiel et choix de chaque combinaison pour chaque match
              </caption>
              <thead>
                <tr>
                  <th scope="col">Match</th>
                  <th scope="col">Officiel</th>
                  {publication.tickets.map((ticket) => (
                    <th scope="col" key={ticket.id}>
                      {ticket.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {publication.matches.map((match, matchIndex) => {
                  const officialSelection = result?.matches[matchIndex].selection;
                  return (
                    <tr data-comparison-row key={match.position}>
                      <th scope="row">
                        <span>{String(match.position).padStart(2, "0")}</span>
                        {match.homeTeam} — {match.awayTeam}
                      </th>
                      <td>
                        <strong class="comparison-official">{officialSelection ?? "—"}</strong>
                      </td>
                      {publication.tickets.map((ticket) => {
                        const selection = ticket.selections[matchIndex];
                        const isCorrect =
                          officialSelection === undefined
                            ? undefined
                            : selection === officialSelection;
                        return (
                          <td key={ticket.id}>
                            <span
                              class={{
                                "comparison-choice": true,
                                "choice-correct": isCorrect === true,
                                "choice-incorrect": isCorrect === false,
                              }}
                            >
                              <strong>{selection}</strong>
                              <small>
                                {isCorrect === undefined
                                  ? "En attente"
                                  : isCorrect
                                    ? "✓ Correct"
                                    : "× Incorrect"}
                              </small>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div class="comparison-mobile">
            {publication.matches.map((match, matchIndex) => {
              const officialSelection = result?.matches[matchIndex].selection;
              return (
                <article data-comparison-row key={match.position}>
                  <header>
                    <span>Match {match.position}</span>
                    <h3>
                      {match.homeTeam} — {match.awayTeam}
                    </h3>
                    <strong>Résultat officiel : {officialSelection ?? "en attente"}</strong>
                  </header>
                  <ul>
                    {publication.tickets.map((ticket) => {
                      const selection = ticket.selections[matchIndex];
                      const isCorrect =
                        officialSelection === undefined
                          ? undefined
                          : selection === officialSelection;
                      return (
                        <li key={ticket.id}>
                          <span>{ticket.label}</span>
                          <strong>{selection}</strong>
                          <small>
                            {isCorrect === undefined
                              ? "En attente"
                              : isCorrect
                                ? "✓ Correct"
                                : "× Incorrect"}
                          </small>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        </MotionSection>
      </section>

      <section class="analyses-section" aria-labelledby="analyses-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">DOSSIER D’AVANT-MATCH</span>
            <h2 id="analyses-title">Analyses détaillées</h2>
          </div>
          <span class="method-badge">Méthode {publication.methodVersion}</span>
        </div>
        <p class="section-intro">
          Ces éléments ont été publiés avant la date limite. Ils documentent le raisonnement, sans
          modifier le bilan présenté ci-dessus.
        </p>
        <div class="analysis-accordion">
          {publication.matches.map((match) => {
            const officialResult = result?.matches[match.position - 1];
            return (
              <details class="analysis-details" key={match.position}>
                <summary>
                  <span class="match-position">{String(match.position).padStart(2, "0")}</span>
                  <span>
                    {match.competition && <small>{match.competition}</small>}
                    <strong>
                      {match.homeTeam} — {match.awayTeam}
                    </strong>
                  </span>
                  {officialResult && (
                    <span class="summary-result">Officiel : {officialResult.selection}</span>
                  )}
                  <span class="summary-action">Voir l’analyse</span>
                </summary>
                <div class="analysis-details-body">
                  {officialResult && officialResult.homeScore !== undefined && (
                    <p class="official-score">
                      Score final : {officialResult.homeScore}–{officialResult.awayScore}
                    </p>
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
                      <h3>Analyse</h3>
                      <p>{match.analysis.summary}</p>
                    </div>
                    <div>
                      <h3>Facteurs principaux</h3>
                      <ul>
                        {match.analysis.keyFactors.map((factor) => (
                          <li key={factor}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>Incertitude</h3>
                      <p>{match.analysis.uncertainty}</p>
                    </div>
                    <div>
                      <h3>Sources</h3>
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
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section class="sources-section" aria-labelledby="sources-title">
        <div>
          <span class="eyebrow">TRAÇABILITÉ</span>
          <h2 id="sources-title">Sources et avertissements</h2>
        </div>
        <div class="sources-layout">
          <div class="result-sources">
            <h3>Sources officielles</h3>
            {result ? (
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
            ) : (
              <p>Les sources de règlement seront ajoutées avec les résultats officiels.</p>
            )}
            {result && (
              <a class="official-link" href={result.officialUrl} target="_blank" rel="noreferrer">
                Résultat officiel <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <aside class="disclaimer-panel" aria-label="Avertissement">
            <strong>Simulation sans argent réel.</strong>
            <p>
              Ces pronostics peuvent être faux. Les performances passées ne garantissent aucun
              résultat futur. Preuve90 n’est affilié ni à FDJ ni à Parions Sport.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(usePublication);

  if (!data) {
    return createDocumentHead(
      "Grille introuvable",
      "Cette publication Loto Foot n’existe pas.",
      "/",
      true,
    );
  }

  const { publication } = data;

  return createDocumentHead(
    `${getLotoFootFormulaLabel(publication.formula)} — grille n°${publication.gridNumber}`,
    `Résultats, rapports officiels et performances des combinaisons de la grille n° ${publication.gridNumber}.`,
    `/grille/${encodeURIComponent(publication.id)}/`,
  );
};
