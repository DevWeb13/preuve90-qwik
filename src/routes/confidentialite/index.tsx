import { component$ } from "@builder.io/qwik";
import { PageHeader, Panel } from "~/components/ui/primitives";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => (
  <div class="route-stack legal-page">
    <PageHeader
      eyebrow="VIE PRIVÉE"
      title="Politique de confidentialité"
      description="Le site est volontairement minimal et ne crée aucun profil utilisateur."
    />
    <Panel class="privacy-summary">
      <h2>Ce que Preuve90 ne collecte pas volontairement</h2>
      <ul>
        <li>aucun compte ni donnée de profil ;</li>
        <li>aucun moyen de paiement ;</li>
        <li>aucun cookie marketing ou outil publicitaire ;</li>
        <li>aucune newsletter, commentaire ou notification.</li>
      </ul>
    </Panel>
    <section class="legal-copy">
      <h2>Journaux techniques</h2>
      <p>
        L’hébergeur Vercel peut produire des journaux techniques nécessaires à la sécurité, au
        diagnostic et au fonctionnement du service, par exemple l’adresse IP, la date de la requête
        ou le type de navigateur. Leur traitement relève des politiques et durées applicables chez
        l’hébergeur et l’éditeur.
      </p>
      <h2>Cookies</h2>
      <p>
        L’application n’installe aucun outil marketing ou dispositif nécessitant un consentement.
        Une bannière de cookies n’est donc pas affichée actuellement. Cette position devra être
        revue avant l’ajout de tout outil de mesure ou service tiers.
      </p>
      <h2>Contact et droits</h2>
      <p>
        L’adresse de contact de l’éditeur reste à compléter dans les mentions légales avant le
        lancement public. Elle permettra d’exercer les droits prévus par la réglementation
        applicable.
      </p>
    </section>
  </div>
));

export const head = createDocumentHead(
  "Politique de confidentialité",
  "Données collectées, journaux techniques et absence de cookies marketing sur Preuve90.",
  "/confidentialite/",
  true,
);
