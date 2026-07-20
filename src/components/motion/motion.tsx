import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { MarketOutcome, PredictionStatus } from "~/types/prediction";

export const DashboardIntro = component$(() => {
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    let context: { revert: () => void } | undefined;
    cleanup(() => context?.revert());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    void import("~/lib/client/gsap.client").then(async ({ loadGsap }) => {
      if (!root.value) return;
      const gsap = await loadGsap();
      context = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .from("[data-intro-title]", { opacity: 0, y: 16, duration: 0.35 })
          .from(
            "[data-intro-panel]",
            { opacity: 0, y: 20, duration: 0.42, stagger: 0.06 },
            "-=0.18",
          )
          .from("[data-intro-scan]", { opacity: 0, xPercent: -100, duration: 0.28 }, 0);
      }, root.value);
    });
  });

  return (
    <section ref={root} class="dashboard-intro">
      <span aria-hidden="true" class="intro-scan" data-intro-scan />
      <Slot />
    </section>
  );
});

interface OutcomeReelProps {
  outcomes: MarketOutcome[];
  selectionName: string;
}

export const OutcomeReel = component$<OutcomeReelProps>(({ outcomes, selectionName }) => {
  const root = useSignal<HTMLDivElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    let context: { revert: () => void } | undefined;
    cleanup(() => context?.revert());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    void import("~/lib/client/gsap.client").then(async ({ loadGsap }) => {
      if (!root.value) return;
      const gsap = await loadGsap();
      const options = root.value.querySelectorAll("[data-reel-option]");
      const finalOption = root.value.querySelector("[data-selected='true']");
      context = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .fromTo(
            options,
            { opacity: 0.18, y: -8 },
            { opacity: 0.42, y: 0, duration: 0.12, stagger: 0.08 },
          )
          .to(options, { opacity: 0.18, duration: 0.12 })
          .to(finalOption, { opacity: 1, scale: 1.08, duration: 0.22 });
      }, root.value);
    });
  });

  return (
    <div ref={root} class="prediction-reel" aria-label={`Issue sélectionnée : ${selectionName}`}>
      {outcomes.map((outcome) => (
        <span
          key={outcome.name}
          aria-hidden="true"
          class={{ "reel-option": true, "is-selected": outcome.name === selectionName }}
          data-reel-option
          data-selected={outcome.name === selectionName ? "true" : "false"}
        >
          <strong>{outcome.name}</strong>
          <small>{outcome.odds}</small>
        </span>
      ))}
      <span class="sr-only">Issue finale {selectionName}</span>
    </div>
  );
});

interface AnimatedNumberProps {
  value: number;
  format: "integer" | "money" | "percent";
  finalText: string;
}

export const AnimatedNumber = component$<AnimatedNumberProps>(({ value, format, finalText }) => {
  const output = useSignal<HTMLSpanElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    let tween: { kill: () => void } | undefined;
    cleanup(() => tween?.kill());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !output.value) return;

    void import("~/lib/client/gsap.client").then(async ({ loadGsap }) => {
      if (!output.value) return;
      const gsap = await loadGsap();
      const counter = { value: 0 };
      const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
      const percent = new Intl.NumberFormat("fr-FR", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      tween = gsap.to(counter, {
        value,
        duration: 0.65,
        ease: "power2.out",
        onUpdate: () => {
          if (!output.value) return;
          output.value.textContent =
            format === "money"
              ? money.format(counter.value / 100)
              : format === "percent"
                ? percent.format(counter.value)
                : Math.round(counter.value).toLocaleString("fr-FR");
        },
        onComplete: () => {
          if (output.value) output.value.textContent = finalText;
        },
      });
    });
  });

  return (
    <span aria-label={finalText} class="animated-number">
      <span ref={output} aria-hidden="true">
        {finalText}
      </span>
    </span>
  );
});

interface ResultMotionProps {
  status: PredictionStatus;
}

export const ResultMotion = component$<ResultMotionProps>(({ status }) => {
  const root = useSignal<HTMLDivElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    let context: { revert: () => void } | undefined;
    cleanup(() => context?.revert());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    void import("~/lib/client/gsap.client").then(async ({ loadGsap }) => {
      if (!root.value) return;
      const gsap = await loadGsap();
      const element = root.value;
      context = gsap.context(() => {
        gsap.fromTo(
          element,
          { opacity: 0.72, scale: status === "LOST" ? 0.985 : 0.97 },
          {
            opacity: 1,
            scale: 1,
            duration: status === "PENDING" ? 0.7 : 0.36,
            ease: "power2.out",
          },
        );
      }, element);
    });
  });

  return (
    <div ref={root} class={`result-motion status-${status.toLowerCase()}`} data-status={status}>
      <Slot />
    </div>
  );
});
