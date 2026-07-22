import { component$ } from "@builder.io/qwik";
import { PageHeader, Panel } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => (
  <div class="route-stack legal-page">
    <PageHeader
      eyebrow="INFORMATIONS"
      title="Mentions légales"
      description="Les informations d’édition ci-dessous doivent être finalisées avant toute ouverture publique."
    />
    <Panel class="completion-panel">
      <h2>Informations à compléter</h2>
      <dl>
        <div>
          <dt>Éditeur</dt>
          <dd>{SITE_CONFIG.legal.publisherName}</dd>
        </div>
        <div>
          <dt>Adresse</dt>
          <dd>{SITE_CONFIG.legal.publisherAddress}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{SITE_CONFIG.legal.contactEmail}</dd>
        </div>
        <div>
          <dt>Hébergement</dt>
          <dd>{SITE_CONFIG.legal.hostName}</dd>
        </div>
      </dl>
    </Panel>
    <section class="legal-copy">
      <h2>Objet du site</h2>
      <p>
        Preuve90 prépare une nouvelle expérience publique de pronostics football produits par une
        IA. Le service est actuellement en cours de conception.
      </p>
      <h2>Contenu</h2>
      <p>
        La structure, les textes, le logo et les éléments graphiques originaux de Preuve90 sont
        protégés par les règles applicables à la propriété intellectuelle.
      </p>
      <h2>Hébergement</h2>
      <p>
        L’application est hébergée par Vercel. Les coordonnées juridiques complètes de l’éditeur
        devront être ajoutées et vérifiées avant le lancement public.
      </p>
    </section>
  </div>
));

export const head = createDocumentHead(
  "Mentions légales",
  "Informations légales relatives au site Preuve90.",
  "/mentions-legales/",
  true,
);
