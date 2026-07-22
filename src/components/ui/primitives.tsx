import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Icon } from "./icon";

interface ClassProps {
  class?: string;
}

interface ButtonLinkProps extends ClassProps {
  href: string;
  label?: string;
}

export const ButtonLink = component$<ButtonLinkProps>(({ href, label, class: className }) => (
  <Link class={`button-link ${className ?? ""}`} href={href}>
    <Slot />
    {label}
    <Icon name="arrow" size={17} />
  </Link>
));

export const Panel = component$<ClassProps>(({ class: className }) => (
  <section class={`panel ${className ?? ""}`}>
    <Slot />
  </section>
));

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const PageHeader = component$<PageHeaderProps>(({ eyebrow, title, description }) => (
  <header class="page-header">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    <p>{description}</p>
  </header>
));

interface EmptyStateProps {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  headingLevel?: "h1" | "h2";
}

export const EmptyState = component$<EmptyStateProps>(
  ({ title, message, actionHref, actionLabel, headingLevel = "h2" }) => (
    <div class="empty-state">
      <Icon name="proof" size={30} />
      {headingLevel === "h1" ? <h1>{title}</h1> : <h2>{title}</h2>}
      <p>{message}</p>
      {actionHref && actionLabel && <ButtonLink href={actionHref} label={actionLabel} />}
    </div>
  ),
);
