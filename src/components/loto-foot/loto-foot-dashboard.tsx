import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { MotionSection } from "~/components/motion/motion";
import { Breadcrumbs } from "~/components/navigation/breadcrumbs";
import { EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { LOTO_FOOT_FORMULAS, type LotoFootFormula } from "~/content/loto-foot/model";
import { lotoFootPublications } from "~/content/loto-foot/publications";
import { lotoFootResults } from "~/content/loto-foot/results";
import { calculateLotoFootStatistics } from "~/content/loto-foot/statistics";
import {
  formatCorrectAnswerScore,
  getBestTicketPerformance,
  getDashboardPresentation,
  getLotoFootFormulaLabel,
  getNetPresentation,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
} from "~/lib/formatting/loto-foot-presentation";
import { getLotoFootGridPath } from "~/lib/routing/loto-foot-grid";

interface LotoFootDashboardProps {
  formula?: LotoFootFormula;
}

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

const percentageFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const formatNet = (netCents?: number) =>
  netCents === undefined
    ? "-"
    : netCents === 0
      ? currencyFormatter.format(0)
      : signedCurrencyFormatter.format(netCents / 100);

export const LotoFootDashboard = component$<LotoFootDashboardProps>(({ formula }) => {
  const statistics = calculateLotoFootStatistics(lotoFootPublications, lotoFootResults, formula);
  const presentation = getDashboardPresentation(statistics, formula !== undefined);
  const cumulativeNet = getNetPresentation(statistics.settledNetCents);
  const bestTicketPerformance = getBestTicketPerformance(statistics.settlements);
  const formulaLabel = formula === undefined ? undefined : getLotoFootFormulaLabel(formula);

  return (
    <div class="home-dashboard">
      <div class={{ "formula-page-intro": formula !== undefined }}>
        {formula !== undefined && formulaLabel && (
          <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: formulaLabel }]} />
        )}
        <header class="dashboard-heading">
          <div>
            <span class="eyebrow">
              {formulaLabel
                ? `PREUVE90 · ${formulaLabel.toUpperCase()}`
                : "PREUVE90 · VUE D’ENSEMBLE"}
            </span>
            <h1>{formulaLabel ?? SITE_CONFIG.tagline}</h1>
          </div>
          <p>
            {formulaLabel
              ? "Grilles publiées, résultats officiels et bilan de la formule."
              : "Chaque combinaison est publiée avant la clôture, puis comparée aux résultats et rapports officiels."}
          </p>
        </header>
      </div>

      {formula !== undefined && (
        <nav class="formula-navigation formula-navigation-compact" aria-label="Formules Loto Foot">
          <Link class="formula-overview-link" href="/">
            Vue d’ensemble
          </Link>
          {LOTO_FOOT_FORMULAS.map((availableFormula) => (
            <Link
              aria-current={formula === availableFormula ? "page" : undefined}
              class={{
                "formula-compact-link": true,
                active: formula === availableFormula,
              }}
              href={`/loto-foot/${availableFormula}/`}
              key={availableFormula}
            >
              LF{availableFormula}
            </Link>
          ))}
        </nav>
      )}

      {presentation.isEmptyFormula ? (
        <EmptyState
          title={`Aucune grille Loto Foot ${formula} publiée pour le moment.`}
          message="Les prochaines grilles apparaîtront ici après leur publication avant clôture."
        />
      ) : (
        <>
          <section class="financial-section" aria-labelledby="financial-title">
            <div class="section-heading financial-heading">
              <div>
                <span class="eyebrow">BILAN VIRTUEL</span>
                <h2 id="financial-title">Bilan des grilles terminées</h2>
              </div>
            </div>

            {presentation.financialState === "settled" ? (
              <MotionSection kind="finance" class="financial-stage">
                <span class="hud-corner hud-corner-top" aria-hidden="true" />
                <span class="hud-corner hud-corner-bottom" aria-hidden="true" />
                <span class="technical-sweep" data-motion-line aria-hidden="true" />
                <dl class="financial-readout financial-readout-simplified">
                  <div
                    class={`financial-value financial-net tone-${cumulativeNet.tone}`}
                    data-finance-item
                  >
                    <dt>Résultat net</dt>
                    <dd>
                      <span class="net-state-label">{cumulativeNet.label}</span>
                      <span
                        class="animated-amount net-amount"
                        data-count-cents={statistics.settledNetCents}
                        data-count-signed="true"
                        aria-hidden="true"
                      >
                        {formatNet(statistics.settledNetCents)}
                      </span>
                      <span class="sr-only">{formatNet(statistics.settledNetCents)}</span>
                    </dd>
                  </div>
                  <div class="financial-value financial-settled-stake" data-finance-item>
                    <dt>Mises terminées</dt>
                    <dd>
                      <span
                        class="animated-amount"
                        data-count-cents={statistics.settledStakeCents}
                        aria-hidden="true"
                      >
                        {currencyFormatter.format(statistics.settledStakeCents / 100)}
                      </span>
                      <span class="sr-only">
                        {currencyFormatter.format(statistics.settledStakeCents / 100)}
                      </span>
                    </dd>
                  </div>
                  <div class="financial-value financial-return" data-finance-item>
                    <dt>Retours officiels</dt>
                    <dd>
                      <span
                        class="animated-amount"
                        data-count-cents={statistics.settledReturnCents}
                        aria-hidden="true"
                      >
                        {currencyFormatter.format(statistics.settledReturnCents / 100)}
                      </span>
                      <span class="sr-only">
                        {currencyFormatter.format(statistics.settledReturnCents / 100)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </MotionSection>
            ) : (
              <div class="financial-empty-state">
                <strong>Aucune grille terminée pour le moment.</strong>
              </div>
            )}

            {statistics.pendingStakeCents > 0 && (
              <p class="pending-stake-note">
                {currencyFormatter.format(statistics.pendingStakeCents / 100)} de mises sont encore
                en attente de résultats.
              </p>
            )}
          </section>

          <section class="performance-section" aria-labelledby="performance-title">
            <div class="section-heading">
              <div>
                <span class="eyebrow">PERFORMANCES</span>
                <h2 id="performance-title">Résultats des pronostics</h2>
              </div>
            </div>

            <MotionSection kind="stats" class="performance-deck">
              <div class="yield-readout" data-stat-item>
                <span class="technical-index">RDT / {formula ? `LF${formula}` : "GLOBAL"}</span>
                <strong>
                  {statistics.settledYieldPercentage === undefined
                    ? "-"
                    : `${percentageFormatter.format(statistics.settledYieldPercentage)} %`}
                </strong>
                <span>
                  {statistics.settledYieldPercentage === undefined
                    ? "Aucun rendement définitif"
                    : "Rendement des grilles terminées"}
                </span>
                <i data-motion-line aria-hidden="true" />
              </div>

              <dl class="performance-cluster publication-cluster" data-stat-item>
                <div class="cluster-heading">
                  <dt>Grilles publiées</dt>
                  <dd>{statistics.publicationCount}</dd>
                </div>
                <div>
                  <dt>Terminées</dt>
                  <dd>{statistics.settledCount}</dd>
                </div>
                <div>
                  <dt>En attente</dt>
                  <dd>{statistics.pendingCount}</dd>
                </div>
              </dl>

              <dl class="performance-cluster ticket-cluster" data-stat-item>
                <div>
                  <dt>Combinaisons publiées</dt>
                  <dd>{statistics.ticketCount}</dd>
                </div>
                <div>
                  <dt>Combinaisons gagnantes</dt>
                  <dd>{statistics.winningTicketCount}</dd>
                </div>
              </dl>

              <div class="best-score-readout" data-stat-item>
                <span class="technical-index">MEILLEUR SCORE</span>
                {bestTicketPerformance ? (
                  <>
                    <strong>
                      {bestTicketPerformance.correctSelections}
                      <span>/{bestTicketPerformance.totalSelections}</span>
                    </strong>
                    <p>
                      {formatCorrectAnswerScore(
                        bestTicketPerformance.correctSelections,
                        bestTicketPerformance.totalSelections,
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <strong>-</strong>
                    <p>Aucune grille terminée</p>
                  </>
                )}
              </div>
            </MotionSection>
          </section>

          {formula === undefined && (
            <nav class="formula-navigation" aria-label="Formules Loto Foot">
              {LOTO_FOOT_FORMULAS.map((availableFormula) => (
                <Link
                  class="formula-link"
                  href={`/loto-foot/${availableFormula}/`}
                  key={availableFormula}
                >
                  <span>LF{availableFormula}</span>
                  <strong>{getLotoFootFormulaLabel(availableFormula)}</strong>
                  <small>Voir les grilles</small>
                </Link>
              ))}
            </nav>
          )}

          <section class="publication-section" aria-labelledby="publications-title">
            <div class="section-heading">
              <div>
                <span class="eyebrow">GRILLES PUBLIÉES</span>
                <h2 id="publications-title">
                  {formulaLabel ? `Grilles ${formulaLabel}` : "Toutes les grilles"}
                </h2>
              </div>
              <span class="count-badge">
                {statistics.publicationCount}{" "}
                {statistics.publicationCount === 1 ? "grille" : "grilles"}
              </span>
            </div>

            {statistics.publicationCount === 0 ? (
              <EmptyState
                title="Aucune grille Loto Foot publiée pour le moment."
                message="Les prochaines grilles apparaîtront ici après leur publication avant clôture."
              />
            ) : (
              <MotionSection kind="archive" class="publication-grid">
                {statistics.settlements.map((settlement) => {
                  const displayStatus = getPublicationDisplayStatus(
                    settlement.publication,
                    settlement.result,
                  );
                  const net = getNetPresentation(settlement.netCents);
                  const bestScore =
                    settlement.status === "settled"
                      ? Math.max(
                          ...settlement.ticketSettlements.map(
                            ({ correctSelections }) => correctSelections,
                          ),
                        )
                      : undefined;

                  return (
                    <article
                      class="publication-card"
                      data-archive-item
                      key={settlement.publication.id}
                    >
                      <div class="card-topline">
                        <span class="grid-number">GRILLE {settlement.publication.gridNumber}</span>
                        <span class={`status-chip status-${displayStatus}`}>
                          <span aria-hidden="true" />
                          {getPublicationStatusLabel(displayStatus)}
                        </span>
                      </div>
                      <h3>{getLotoFootFormulaLabel(settlement.publication.formula)}</h3>
                      <p class="archive-deadline">
                        <span>Clôture</span>
                        {dateFormatter.format(new Date(settlement.publication.validationDeadline))}
                      </p>

                      <dl class="archive-finance">
                        <div>
                          <dt>Mise virtuelle</dt>
                          <dd>{currencyFormatter.format(settlement.stakeCents / 100)}</dd>
                        </div>
                        <div>
                          <dt>Retour officiel</dt>
                          <dd>
                            {settlement.returnCents === undefined
                              ? "En attente"
                              : currencyFormatter.format(settlement.returnCents / 100)}
                          </dd>
                        </div>
                        <div
                          class={`archive-net tone-${
                            settlement.netCents === undefined ? "neutral" : net.tone
                          }`}
                        >
                          <dt>Résultat net</dt>
                          <dd>{formatNet(settlement.netCents)}</dd>
                        </div>
                      </dl>

                      <div class="archive-score">
                        <span>Meilleur score</span>
                        {bestScore === undefined ? (
                          <strong>-</strong>
                        ) : (
                          <strong>
                            {bestScore}/{settlement.publication.matches.length}
                            <small>
                              {formatCorrectAnswerScore(
                                bestScore,
                                settlement.publication.matches.length,
                              )}
                            </small>
                          </strong>
                        )}
                      </div>

                      <Link class="card-link" href={getLotoFootGridPath(settlement.publication)}>
                        Voir la grille <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  );
                })}
              </MotionSection>
            )}
          </section>

          <aside class="disclaimer-panel compact-disclaimer" aria-labelledby="disclaimer-title">
            <span class="eyebrow">TRANSPARENCE</span>
            <h2 id="disclaimer-title">Des simulations sans argent réel</h2>
            <p>
              Aucun argent réel n’est joué. Les pronostics peuvent être faux et les performances
              passées ne garantissent aucun résultat futur. Preuve90 n’est affilié ni à FDJ ni à
              Parions Sport.
            </p>
          </aside>
        </>
      )}
    </div>
  );
});
