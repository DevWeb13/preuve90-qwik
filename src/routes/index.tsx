import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { DashboardIntro } from "~/components/motion/motion";
import { EmptyState } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { calculateVirtualStakeCents } from "~/content/loto-foot/model";
import { lotoFootPublications } from "~/content/loto-foot/publications";
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
          {lotoFootPublications.map((publication) => (
            <article class="publication-card" key={publication.id}>
              <div class="card-topline">
                <span class="product-label">Loto Foot 7</span>
                <span class="pending-status">En attente</span>
              </div>
              <h3>Grille n° {publication.gridNumber}</h3>
              <dl class="publication-facts">
                <div>
                  <dt>Date limite</dt>
                  <dd>{dateFormatter.format(new Date(publication.validationDeadline))}</dd>
                </div>
                <div>
                  <dt>Combinaisons</dt>
                  <dd>{publication.tickets.length}</dd>
                </div>
                <div>
                  <dt>Mise virtuelle</dt>
                  <dd>
                    {currencyFormatter.format(
                      calculateVirtualStakeCents(publication.tickets.length) / 100,
                    )}
                  </dd>
                </div>
              </dl>
              <Link class="card-link" href={`/grille/${encodeURIComponent(publication.id)}/`}>
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
