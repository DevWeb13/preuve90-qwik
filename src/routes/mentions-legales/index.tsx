import { component$ } from "@builder.io/qwik";
import { PageHeader, Panel } from "~/components/ui/primitives";
import { SITE_CONFIG } from "~/config/site";
import { createDocumentHead } from "~/lib/formatting/seo";

export default component$(() => (
  <div class="route-stack legal-page">
    <PageHeader
      eyebrow="INFORMATIONS"
      title="Mentions légales et avertissements"
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
        Preuve90 documente une expérience publique sur des pronostics de football produits par une
        IA. Le site présente des publications horodatées, leurs règlements et des statistiques
        dérivées.
      </p>
      <h2>Aucun pari réel</h2>
      <p>
        La mise affichée est entièrement virtuelle. Le site ne reçoit aucun dépôt, ne place aucun
        pari, ne propose aucun compte joueur et ne fournit aucun lien commercial vers un bookmaker.
      </p>
      <h2>Prévention et absence de garantie</h2>
      <p>
        Les jeux d’argent comportent des risques financiers et d’addiction et sont interdits aux
        mineurs. Les performances passées ne garantissent aucun résultat futur. Les informations du
        site ne constituent ni un conseil financier ni une incitation à parier.
      </p>
      <h2>Limites des cotes observées</h2>
      <p>
        Une cote enregistrée est une observation horodatée chez Betclic (FR). Elle ne prouve ni sa
        disponibilité ultérieure ni son acceptation pour une personne donnée.
      </p>
      <h2>Contenu</h2>
      <p>
        La structure, les textes et les éléments graphiques originaux de Preuve90 sont protégés par
        les règles applicables à la propriété intellectuelle. Les marques citées appartiennent à
        leurs titulaires respectifs.
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
  "Informations légales, avertissements et limites de l’expérience publique Preuve90.",
  "/mentions-legales/",
  true,
);
