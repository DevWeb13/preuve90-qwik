import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { MotionSection } from "~/components/motion/motion";
import { EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { LOTO_FOOT_FORMULAS, type LotoFootFormula } from "~/content/loto-foot/model";
import { lotoFootPublications } from "~/content/loto-foot/publications";
import { lotoFootResults } from "~/content/loto-foot/results";
import { calculateLotoFootStatistics } from "~/content/loto-foot/statistics";
import {
  formatCorrectAnswerScore,
  getBestTicketPerformance,
  getLotoFootFormulaLabel,
  getNetPresentation,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
} from "~/lib/formatting/loto-foot-presentation";

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

const formatNet = (netCents: number) =>
  netCents === 0 ? currencyFormatter.format(0) : signedCurrencyFormatter.format(netCents / 100);

export const LotoFootDashboard = component$<LotoFootDashboardProps>(({ formula }) => {
  const statistics = calculateLotoFootStatistics(lotoFootPublications, lotoFootResults, formula);
  const cumulativeNet = getNetPresentation(statistics.netCents);
  const bestTicketPerformance = getBestTicketPerformance(statistics.settlements);
  const formulaLabel = formula === undefined ? undefined : getLotoFootFormulaLabel(formula);

  return (
    <div class="home-dashboard">
      <header class="dashboard-heading">
        <div>
          <span class="eyebrow">
            PREUVE90 ·{" "}
            {formulaLabel ? `TABLEAU DE CONTRÔLE ${formulaLabel.toUpperCase()}` : "TABLEAU GLOBAL"}
          </span>
          <h1>{formulaLabel ?? SITE_CONFIG.tagline}</h1>
        </div>
        <p>
          {formulaLabel
            ? `Statistiques, publications et règlements ${formulaLabel}, tous calculés depuis les données horodatées.`
            : "Chaque combinaison est publiée avant la clôture, puis confrontée aux résultats et rapports officiels des quatre formules."}
        </p>
      </header>

      <section class="financial-section" aria-labelledby="financial-title">
        <div class="section-heading financial-heading">
          <div>
            <span class="eyebrow">BILAN FINANCIER VIRTUEL</span>
            <h2 id="financial-title">Le résultat, en un regard</h2>
          </div>
          <span class="live-proof">
            <span aria-hidden="true" /> Calculé sur {statistics.publicationCount} grille
            {statistics.publicationCount > 1 ? "s" : ""}
          </span>
        </div>

        <MotionSection kind="finance" class="financial-stage">
          <span class="hud-corner hud-corner-top" aria-hidden="true" />
          <span class="hud-corner hud-corner-bottom" aria-hidden="true" />
          <span class="technical-sweep" data-motion-line aria-hidden="true" />
          <dl class="financial-readout">
            <div class="financial-value financial-stake" data-finance-item>
              <dt>Mise virtuelle cumulée</dt>
              <dd>
                <span
                  class="animated-amount"
                  data-count-cents={statistics.stakeCents}
                  aria-hidden="true"
                >
                  {currencyFormatter.format(statistics.stakeCents / 100)}
                </span>
                <span class="sr-only">{currencyFormatter.format(statistics.stakeCents / 100)}</span>
              </dd>
              <small>Capital simulé engagé</small>
            </div>
            <div class="financial-value financial-return" data-finance-item>
              <dt>Retours cumulés</dt>
              <dd>
                <span
                  class="animated-amount"
                  data-count-cents={statistics.returnCents}
                  aria-hidden="true"
                >
                  {currencyFormatter.format(statistics.returnCents / 100)}
                </span>
                <span class="sr-only">
                  {currencyFormatter.format(statistics.returnCents / 100)}
                </span>
              </dd>
              <small>Rapports obtenus au total</small>
            </div>
            <div
              class={`financial-value financial-net tone-${cumulativeNet.tone}`}
              data-finance-item
            >
              <dt>Résultat net cumulé</dt>
              <dd>
                <span class="net-state-label">{cumulativeNet.label}</span>
                <span
                  class="animated-amount net-amount"
                  data-count-cents={statistics.netCents}
                  data-count-signed="true"
                  aria-hidden="true"
                >
                  {formatNet(statistics.netCents)}
                </span>
                <span class="sr-only">{formatNet(statistics.netCents)}</span>
              </dd>
              <small>Mises déduites des retours</small>
            </div>
          </dl>
        </MotionSection>
      </section>

      <section class="performance-section" aria-labelledby="performance-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">SIGNAL DE PERFORMANCE</span>
            <h2 id="performance-title">Statistiques secondaires</h2>
          </div>
        </div>

        <MotionSection kind="stats" class="performance-deck">
          <div class="yield-readout" data-stat-item>
            <span class="technical-index">RDT / {formula ? `LF${formula}` : "GLOBAL"}</span>
            <strong>
              {statistics.yieldPercentage === undefined
                ? "—"
                : `${percentageFormatter.format(statistics.yieldPercentage)} %`}
            </strong>
            <span>Rendement virtuel</span>
            <i data-motion-line aria-hidden="true" />
          </div>

          <dl class="performance-cluster publication-cluster" data-stat-item>
            <div class="cluster-heading">
              <dt>Grilles publiées</dt>
              <dd>{statistics.publicationCount}</dd>
            </div>
            <div>
              <dt>Réglées</dt>
              <dd>{statistics.settledCount}</dd>
            </div>
            <div>
              <dt>En attente</dt>
              <dd>{statistics.pendingCount}</dd>
            </div>
          </dl>

          <dl class="performance-cluster ticket-cluster" data-stat-item>
            <div>
              <dt>Combinaisons jouées</dt>
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
                <strong>—</strong>
                <p>Aucune grille réglée</p>
              </>
            )}
          </div>
        </MotionSection>
      </section>

      <nav class="formula-navigation" aria-label="Tableaux de contrôle par formule">
        {LOTO_FOOT_FORMULAS.map((availableFormula) => (
          <Link
            class={{ "formula-link": true, active: formula === availableFormula }}
            href={`/loto-foot/${availableFormula}/`}
            key={availableFormula}
          >
            <span>LF{availableFormula}</span>
            <strong>{getLotoFootFormulaLabel(availableFormula)}</strong>
            <small>Voir les statistiques et les grilles</small>
          </Link>
        ))}
      </nav>

      <section class="publication-section" aria-labelledby="publications-title">
        <div class="section-heading">
          <div>
            <span class="eyebrow">ARCHIVES HORODATÉES</span>
            <h2 id="publications-title">
              {formulaLabel ? `Grilles ${formulaLabel}` : "Toutes les grilles Loto Foot"}
            </h2>
          </div>
          <span class="count-badge">{statistics.publicationCount} publication(s)</span>
        </div>

        {statistics.publicationCount === 0 ? (
          <EmptyState
            title={`Aucune grille ${formulaLabel ?? "Loto Foot"} publiée`}
            message={
              formulaLabel
                ? `Les premières analyses ${formulaLabel} apparaîtront ici après leur publication avant clôture.`
                : "La première analyse apparaîtra ici dès qu’une grille ouverte aura été étudiée et publiée avant sa date limite."
            }
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
                <article class="publication-card" data-archive-item key={settlement.publication.id}>
                  <div class="card-topline">
                    <span class="grid-number">GRILLE {settlement.publication.gridNumber}</span>
                    <span class={`status-chip status-${displayStatus}`}>
                      <span aria-hidden="true" />
                      {getPublicationStatusLabel(displayStatus)}
                    </span>
                  </div>
                  <h3>{getLotoFootFormulaLabel(settlement.publication.formula)}</h3>
                  <p class="archive-deadline">
                    <span>Date limite</span>
                    {dateFormatter.format(new Date(settlement.publication.validationDeadline))}
                  </p>

                  <dl class="archive-finance">
                    <div>
                      <dt>Mise</dt>
                      <dd>{currencyFormatter.format(settlement.stakeCents / 100)}</dd>
                    </div>
                    <div>
                      <dt>Retour</dt>
                      <dd>{currencyFormatter.format(settlement.returnCents / 100)}</dd>
                    </div>
                    <div class={`archive-net tone-${net.tone}`}>
                      <dt>{net.label}</dt>
                      <dd>{formatNet(settlement.netCents)}</dd>
                    </div>
                  </dl>

                  <div class="archive-score">
                    <span>Meilleur score</span>
                    {bestScore === undefined ? (
                      <strong>En attente des résultats</strong>
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

                  <Link
                    class="card-link"
                    href={`/grille/${encodeURIComponent(settlement.publication.id)}/`}
                  >
                    Ouvrir le tableau de la grille <span aria-hidden="true">→</span>
                  </Link>
                </article>
              );
            })}
          </MotionSection>
        )}
      </section>

      <aside class="disclaimer-panel compact-disclaimer" aria-labelledby="disclaimer-title">
        <span class="eyebrow">TRANSPARENCE</span>
        <h2 id="disclaimer-title">Des simulations, jamais une promesse de gain</h2>
        <p>
          Aucun argent réel n’est joué. Les pronostics peuvent être faux et les performances passées
          ne garantissent aucun résultat futur. Preuve90 n’est affilié ni à FDJ ni à Parions Sport.
        </p>
      </aside>
    </div>
  );
});
