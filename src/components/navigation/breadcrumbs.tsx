import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

export const Breadcrumbs = component$<BreadcrumbsProps>(({ items }) => (
  <nav class="breadcrumbs" aria-label="Fil d’Ariane">
    <ol>
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <li aria-current={isCurrent ? "page" : undefined} key={item.label}>
            {!isCurrent && item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          </li>
        );
      })}
    </ol>
  </nav>
));
