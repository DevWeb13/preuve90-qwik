import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { EmptyState } from "~/components/ui/primitives";
import { createDocumentHead } from "~/lib/formatting/seo";

export const useNotFound = routeLoader$(({ status }) => {
  status(404);
  return true;
});

export default component$(() => {
  useNotFound();
  return (
    <div class="not-found-page">
      <span aria-hidden="true" class="error-code">
        404
      </span>
      <EmptyState
        title="Signal introuvable"
        message="Cette route ne correspond à aucune zone publique de Preuve90."
        actionHref="/"
        actionLabel="Retour au tableau de bord"
        headingLevel="h1"
      />
    </div>
  );
});

export const head = createDocumentHead(
  "Page introuvable",
  "La page demandée n’existe pas sur Preuve90.",
  "/",
  true,
);
