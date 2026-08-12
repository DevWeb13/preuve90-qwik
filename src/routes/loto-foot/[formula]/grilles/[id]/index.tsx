import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { DeadlineStatus } from "~/components/loto-foot/deadline-status";
import { MotionSection } from "~/components/motion/motion";
import { Breadcrumbs } from "~/components/navigation/breadcrumbs";
import { EmptyState } from "~/components/ui/primitives";
import { LOTO_FOOT_SELECTIONS } from "~/content/loto-foot/model";
import { getLotoFootResultByPublicationId } from "~/content/loto-foot/results";
import { calculatePublicationSettlement } from "~/content/loto-foot/settlement";
import {
  formatCorrectAnswerScore,
  getLotoFootFormulaLabel,
  getMatchVerdictLabel,
  getNetPresentation,
  getPublicationDetailSections,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
  getSelectionPresentation,
  getSelectionSymbolPresentation,
} from "~/lib/formatting/loto-foot-presentation";
import { createDocumentHead } from "~/lib/formatting/seo";
import { getLotoFootGridPath, resolveLotoFootGridPublication } from "~/lib/routing/loto-foot-grid";

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

const formatNet = (netCents?: number) =>
  netCents === undefined
    ? "-"
    : netCents === 0
      ? currencyFormatter.format(0)
      : signedCurrencyFormatter.format(netCents / 100);

export const usePublication = routeLoader$(({ params, status }) => {
  const publication = resolveLotoFootGridPublication(params.id, params.formula);

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
  const detailSections = getPublicationDetailSections(result !== undefined);
  const displayStatus = getPublicationDisplayStatus(publication, result);
  const formulaLabel = getLotoFootFormulaLabel(publication.formula);
  const net = getNetPresentation(settlement.netCents);
  const bestScore =
    settlement.status === "settled"
      ? Math.max(...settlement.ticketSettlements.map(({ correctSelections }) => correctSelections))
      : undefined;

  return (
    <div class="publication-detail">
      <div class="publication-detail-intro">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: formulaLabel, href: `/loto-foot/${publication.formula}/` },
            { label: `Grille ${publication.gridNumber}` },
          ]}
        />

        <header class="detail-command-header">
          <div class="detail-title-block">
            <span class="eyebrow">{formulaLabel.toUpperCase()} · GRILLE PUBLIÉE</span>
            <h1>
              {formulaLabel} : grille n°{publication.gridNumber}
            </h1>
            <span class={`status-chip status-${displayStatus}`}>
              <span aria-hidden="true" />
              {getPublicationStatusLabel(displayStatus)}
            </span>
          </div>
          <dl class="detail-identity">
            <div>
              <dt>Clôture</dt>
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
          {!result && <DeadlineStatus validationDeadline={publication.validationDeadline} />}
        </header>
      </div>

      {!result && (
        <p class="waiting-summary">
          Les résultats et rapports officiels seront affichés dès leur publication officielle.
        </p>
      )}

      {detailSections.financial && (
        <section class="grid-financial-section" aria-labelledby="grid-financial-title">
          <div class="section-heading">
            <div>
              <span class="eyebrow">BILAN VIRTUEL</span>
              <h2 id="grid-financial-title">Bilan de la grille</h2>
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
                  <span class="sr-only">
                    {currencyFormatter.format(settlement.stakeCents / 100)}
                  </span>
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
                    {currencyFormatter.format((settlement.returnCents ?? 0) / 100)}
                  </span>
                  <span class="sr-only">
                    {currencyFormatter.format((settlement.returnCents ?? 0) / 100)}
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
                <dt>Meilleur score</dt>
                <dd>
                  <strong>
                    {bestScore}/{publication.matches.length}
                  </strong>
                  <small>
                    {formatCorrectAnswerScore(bestScore ?? 0, publication.matches.length)}
                  </small>
                </dd>
              </div>
            </dl>
          </MotionSection>
        </section>
      )}

      {detailSections.results && result && (
        <section class="official-results-section" aria-labelledby="official-results-title">
          <MotionSection kind="result" class="official-result-board">
            <header class="official-result-heading">
              <div>
                <span class="eyebrow">RÉSULTATS</span>
                <h2 id="official-results-title">Résultats officiels</h2>
              </div>
              <p>
                Suite officielle dans l’ordre des matchs.
                <time dateTime={result.settledAt}>
                  Enregistrés le {dateFormatter.format(new Date(result.settledAt))}
                </time>
              </p>
            </header>
            <ol class="official-result-sequence" aria-label="Suite officielle des résultats">
              {result.matches.map((matchResult) => (
                <li data-result-pill key={matchResult.position}>
                  <small>{String(matchResult.position).padStart(2, "0")}</small>
                  <strong>{matchResult.selection}</strong>
                </li>
              ))}
            </ol>
          </MotionSection>
        </section>
      )}

      {detailSections.payouts && result && (
        <section class="official-payouts-section" aria-labelledby="official-payouts-title">
          <div class="section-heading">
            <div>
              <span class="eyebrow">RAPPORTS OFFICIELS</span>
              <h2 id="official-payouts-title">Rapports de la grille</h2>
            </div>
          </div>
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
        </section>
      )}

      <section class="tickets-section" aria-labelledby="tickets-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">COMBINAISONS PUBLIÉES</span>
            <h2 id="tickets-title">Choix 1, N, 2</h2>
          </div>
          <span class="count-badge">
            {publication.tickets.length}{" "}
            {publication.tickets.length === 1 ? "combinaison" : "combinaisons"}
          </span>
        </div>
        <ul class="selection-legend" aria-label="Légende des choix">
          <li>
            <span class="choice-symbol symbol-published" aria-hidden="true">
              ●
            </span>
            Choix publié
          </li>
          {result && (
            <>
              <li>
                <span class="choice-symbol symbol-official" aria-hidden="true">
                  ◎
                </span>
                Résultat officiel
              </li>
              <li>
                <span class="choice-symbol symbol-correct" aria-hidden="true">
                  ✓
                </span>
                Choix correct
              </li>
              <li>
                <span class="choice-symbol symbol-incorrect" aria-hidden="true">
                  ×
                </span>
                Choix incorrect
              </li>
            </>
          )}
        </ul>
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
                  {ticketSettlement && (
                    <div class="ticket-scoreline">
                      <strong>
                        {formatCorrectAnswerScore(
                          ticketSettlement.correctSelections,
                          publication.matches.length,
                        )}
                      </strong>
                      <span>
                        Gain officiel:{" "}
                        {currencyFormatter.format(ticketSettlement.payoutCents / 100)}
                      </span>
                    </div>
                  )}
                </header>

                <table class="ticket-choice-table">
                  <caption class="sr-only">Choix publiés pour {ticket.label}</caption>
                  <thead>
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Match</th>
                      {LOTO_FOOT_SELECTIONS.map((selection) => (
                        <th scope="col" key={selection}>
                          {selection}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {publication.matches.map((match, matchIndex) => {
                      const publishedSelection = ticket.selections[matchIndex];
                      const officialSelection = result?.matches[matchIndex].selection;
                      const selectedIsCorrect =
                        officialSelection === undefined
                          ? undefined
                          : getSelectionPresentation(
                              publishedSelection,
                              publishedSelection,
                              officialSelection,
                            ).verdict === "correct";
                      const matchVerdict = getMatchVerdictLabel(
                        publishedSelection,
                        officialSelection,
                      );

                      return (
                        <tr
                          class={{
                            "choice-row-correct": selectedIsCorrect === true,
                            "choice-row-incorrect": selectedIsCorrect === false,
                          }}
                          key={match.position}
                        >
                          <th scope="row">{String(match.position).padStart(2, "0")}</th>
                          <td class="ticket-match">
                            <span class="match-teams">
                              {match.homeTeam} contre {match.awayTeam}
                            </span>
                            {matchVerdict && (
                              <small
                                class={{
                                  "match-verdict": true,
                                  "verdict-correct": selectedIsCorrect === true,
                                  "verdict-incorrect": selectedIsCorrect === false,
                                }}
                              >
                                <span aria-hidden="true">{selectedIsCorrect ? "✓" : "×"}</span>{" "}
                                {matchVerdict}
                              </small>
                            )}
                          </td>
                          {LOTO_FOOT_SELECTIONS.map((displayedSelection) => {
                            const choice = getSelectionPresentation(
                              publishedSelection,
                              displayedSelection,
                              officialSelection,
                            );
                            const symbol = getSelectionSymbolPresentation(choice);
                            const accessibleState = choice.isSelected
                              ? choice.verdict === "correct"
                                ? "choix publié correct et résultat officiel"
                                : choice.verdict === "incorrect"
                                  ? "choix publié incorrect"
                                  : "choix publié"
                              : choice.isOfficial
                                ? "résultat officiel"
                                : "non sélectionné";

                            return (
                              <td
                                aria-label={`${displayedSelection} : ${accessibleState}`}
                                class={{
                                  "choice-cell": true,
                                  "choice-selected": choice.isSelected,
                                  "choice-official": choice.isOfficial,
                                  "choice-correct": choice.verdict === "correct",
                                  "choice-incorrect": choice.verdict === "incorrect",
                                }}
                                key={displayedSelection}
                              >
                                <span
                                  class={{
                                    "choice-symbol": true,
                                    [`symbol-${symbol.state}`]: true,
                                  }}
                                  aria-hidden="true"
                                >
                                  {symbol.symbol}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p class="ticket-rationale">{ticket.rationale}</p>
              </article>
            );
          })}
        </MotionSection>
      </section>

      <section class="analyses-section" aria-labelledby="analyses-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">ANALYSES</span>
            <h2 id="analyses-title">Analyse des matchs</h2>
          </div>
        </div>
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
                      {match.homeTeam} contre {match.awayTeam}
                    </strong>
                  </span>
                  {officialResult && (
                    <span class="summary-result">Résultat : {officialResult.selection}</span>
                  )}
                  <span class="summary-action">Afficher l’analyse</span>
                </summary>
                <div class="analysis-details-body">
                  {officialResult && officialResult.homeScore !== undefined && (
                    <p class="official-score">
                      Score final : {officialResult.homeScore}-{officialResult.awayScore}
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
          <span class="eyebrow">SOURCES</span>
          <h2 id="sources-title">Sources et transparence</h2>
        </div>
        <div class="sources-layout">
          <div class="result-sources">
            {result ? (
              <>
                <h3>Sources officielles</h3>
                <ul class="source-list">
                  {result.sources.map((source) => (
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
                <a class="official-link" href={result.officialUrl} target="_blank" rel="noreferrer">
                  Résultat officiel <span aria-hidden="true">↗</span>
                </a>
              </>
            ) : (
              <>
                <h3>Grille officielle</h3>
                <a
                  class="official-link"
                  href={publication.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir la grille officielle <span aria-hidden="true">↗</span>
                </a>
              </>
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
    `${getLotoFootFormulaLabel(publication.formula)} : grille n°${publication.gridNumber}`,
    `Résultats, rapports officiels et performances des combinaisons de la grille n° ${publication.gridNumber}.`,
    getLotoFootGridPath(publication),
  );
};
