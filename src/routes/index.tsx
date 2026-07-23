import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { DashboardIntro } from "~/components/motion/motion";
import { EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { lotoFootPublications } from "~/content/loto-foot/publications";
import { lotoFootResults } from "~/content/loto-foot/results";
import { calculateLotoFootStatistics } from "~/content/loto-foot/statistics";
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

const percentageFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const statistics = calculateLotoFootStatistics(lotoFootPublications, lotoFootResults);

export default component$(() => (
  <DashboardIntro>
    <header class="home-hero" data-intro-title>
      <span class="eyebrow">PREUVE90 · PRONOSTICS HORODATÉS</span>
      <h1>{SITE_CONFIG.tagline}</h1>
      <p>
        Preuve90 conserve avant la clôture les analyses, probabilités et combinaisons simulées de
        chaque grille Loto Foot 7. Leur publication préalable permet de juger la méthode sur des
        traces publiques, pas sur des pronostics réécrits après les matchs.
      </p>
    </header>

    <section class="statistics-panel" aria-labelledby="statistics-title" data-intro-panel>
      <div class="section-heading">
        <div>
          <span class="eyebrow">BILAN CALCULÉ</span>
          <h2 id="statistics-title">Statistiques cumulées</h2>
        </div>
      </div>
      <dl class="statistics-grid">
        <div>
          <dt>Mise virtuelle cumulée</dt>
          <dd>{currencyFormatter.format(statistics.stakeCents / 100)}</dd>
        </div>
        <div>
          <dt>Retours cumulés</dt>
          <dd>{currencyFormatter.format(statistics.returnCents / 100)}</dd>
        </div>
        <div>
          <dt>Résultat net cumulé</dt>
          <dd>{currencyFormatter.format(statistics.netCents / 100)}</dd>
        </div>
        <div>
          <dt>Rendement</dt>
          <dd>
            {statistics.yieldPercentage === undefined
              ? "—"
              : `${percentageFormatter.format(statistics.yieldPercentage)} %`}
          </dd>
        </div>
        <div>
          <dt>Grilles publiées</dt>
          <dd>{statistics.publicationCount}</dd>
        </div>
        <div>
          <dt>Réglées / en attente</dt>
          <dd>
            {statistics.settledCount} / {statistics.pendingCount}
          </dd>
        </div>
        <div>
          <dt>Combinaisons jouées</dt>
          <dd>{statistics.ticketCount}</dd>
        </div>
        <div>
          <dt>Combinaisons gagnantes</dt>
          <dd>{statistics.winningTicketCount}</dd>
        </div>
      </dl>
      {statistics.bestSettledGrid && (
        <p class="best-grid">
          Meilleure grille réglée : n° {statistics.bestSettledGrid.publication.gridNumber}, résultat
          net {currencyFormatter.format(statistics.bestSettledGrid.netCents / 100)}.
        </p>
      )}
    </section>

    <section class="publication-section" aria-labelledby="publications-title" data-intro-panel>
      <div class="section-heading">
        <div>
          <span class="eyebrow">ARCHIVES PUBLIQUES</span>
          <h2 id="publications-title">Grilles Loto Foot 7</h2>
        </div>
        <span class="count-badge">{lotoFootPublications.length} publication(s)</span>
      </div>

      {lotoFootPublications.length === 0 ? (
        <EmptyState
          title="Aucune grille publiée"
          message="La première analyse apparaîtra ici dès qu’une grille Loto Foot 7 ouverte aura été étudiée et publiée avant sa date limite."
        />
      ) : (
        <div class="publication-grid">
          {statistics.settlements.map((settlement) => (
            <article class="publication-card" key={settlement.publication.id}>
              <div class="card-topline">
                <span class="product-label">Loto Foot 7</span>
                <span class={settlement.status === "settled" ? "settled-status" : "pending-status"}>
                  {settlement.status === "settled" ? "Réglée" : "En attente"}
                </span>
              </div>
              <h3>Grille n° {settlement.publication.gridNumber}</h3>
              <dl class="publication-facts">
                <div>
                  <dt>Date limite</dt>
                  <dd>
                    {dateFormatter.format(new Date(settlement.publication.validationDeadline))}
                  </dd>
                </div>
                <div>
                  <dt>Combinaisons</dt>
                  <dd>{settlement.publication.tickets.length}</dd>
                </div>
                <div>
                  <dt>Mise virtuelle</dt>
                  <dd>{currencyFormatter.format(settlement.stakeCents / 100)}</dd>
                </div>
                {settlement.status === "settled" && (
                  <>
                    <div>
                      <dt>Retour</dt>
                      <dd>{currencyFormatter.format(settlement.returnCents / 100)}</dd>
                    </div>
                    <div>
                      <dt>Résultat net</dt>
                      <dd>{currencyFormatter.format(settlement.netCents / 100)}</dd>
                    </div>
                  </>
                )}
              </dl>
              <Link
                class="card-link"
                href={`/grille/${encodeURIComponent(settlement.publication.id)}/`}
              >
                Voir le détail <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>

    <section class="disclaimer-panel" aria-labelledby="disclaimer-title" data-intro-panel>
      <span class="eyebrow">À LIRE AVANT TOUT</span>
      <h2 id="disclaimer-title">Des simulations, pas une promesse de gain</h2>
      <ul>
        <li>Aucun argent réel n’est joué : toutes les combinaisons sont virtuelles.</li>
        <li>Les pronostics peuvent être faux.</li>
        <li>Les performances passées ne garantissent aucun résultat futur.</li>
        <li>Preuve90 n’est affilié ni à FDJ ni à Parions Sport.</li>
      </ul>
    </section>
  </DashboardIntro>
));

export const head = createDocumentHead(
  "Preuve90 — Publications Loto Foot 7",
  SITE_CONFIG.description,
  "/",
);
