import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { STATUS_LABELS } from "~/config/product";
import { formatMoney, formatPercent } from "~/lib/formatting/format";
import type { PredictionStatus } from "~/types/prediction";
import { AnimatedNumber } from "~/components/motion/motion";
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

export const Card = component$<ClassProps>(({ class: className }) => (
  <article class={`card ${className ?? ""}`}>
    <Slot />
  </article>
));

export const Panel = component$<ClassProps>(({ class: className }) => (
  <section class={`panel ${className ?? ""}`}>
    <Slot />
  </section>
));

export const Badge = component$<ClassProps>(({ class: className }) => (
  <span class={`badge ${className ?? ""}`}>
    <Slot />
  </span>
));

export const StatusBadge = component$<{ status: PredictionStatus }>(({ status }) => (
  <span class={`status-badge status-${status.toLowerCase()}`}>
    <span aria-hidden="true" class="status-dot" />
    {STATUS_LABELS[status]}
  </span>
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

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export const SectionHeader = component$<SectionHeaderProps>(({ eyebrow, title, description }) => (
  <header class="section-header">
    {eyebrow && <span class="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </header>
));

interface StatCardProps {
  label: string;
  value: number;
  format?: "integer" | "money" | "percent";
  note?: string;
  tone?: "default" | "positive" | "negative";
}

export const StatCard = component$<StatCardProps>(
  ({ label, value, format = "integer", note, tone = "default" }) => {
    const finalText =
      format === "money"
        ? formatMoney(value)
        : format === "percent"
          ? formatPercent(value)
          : value.toLocaleString("fr-FR");
    return (
      <article class={`stat-card tone-${tone}`} data-intro-panel>
        <span class="stat-label">{label}</span>
        <strong>
          <AnimatedNumber value={value} format={format} finalText={finalText} />
        </strong>
        {note && <span class="stat-note">{note}</span>}
      </article>
    );
  },
);

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

export const DemoBanner = component$(() => (
  <aside class="demo-banner" role="status">
    <Icon name="warning" size={18} />
    <strong>MODE DÉMONSTRATION</strong>
    <span>Ces données ne sont pas des pronostics publiés.</span>
  </aside>
));

export const DataError = component$<{ message: string }>(({ message }) => (
  <div class="empty-state error-state" role="alert">
    <Icon name="warning" size={30} />
    <h2>Données indisponibles</h2>
    <p>{message}</p>
  </div>
));
