import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";

type MotionKind = "archive" | "comparison" | "finance" | "payouts" | "result" | "stats" | "tickets";

interface MotionSectionProps {
  kind: MotionKind;
  class?: string;
}

const itemSelectors: Record<MotionKind, string> = {
  archive: "[data-archive-item]",
  comparison: "[data-comparison-row]",
  finance: "[data-finance-item]",
  payouts: "[data-payout-item]",
  result: "[data-result-pill]",
  stats: "[data-stat-item]",
  tickets: "[data-ticket-item]",
};

export const MotionSection = component$<MotionSectionProps>(({ kind, class: className }) => {
  const root = useSignal<HTMLElement>();

  // Each instance becomes active only when its own section reaches the viewport.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    let cancelled = false;
    let context: { revert: () => void } | undefined;

    cleanup(() => {
      cancelled = true;
      context?.revert();
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    void import("~/lib/client/gsap.client")
      .then(async ({ loadGsap }) => {
        const element = root.value;
        if (!element || cancelled) return;

        const gsap = await loadGsap();
        if (cancelled) return;

        context = gsap.context(() => {
          const items = element.querySelectorAll(itemSelectors[kind]);
          const lines = element.querySelectorAll("[data-motion-line]");

          if (items.length > 0) {
            gsap.from(items, {
              autoAlpha: 0,
              y: kind === "result" ? 10 : 18,
              duration: 0.38,
              stagger: 0.07,
              ease: "power2.out",
              clearProps: "opacity,transform,visibility",
            });
          }

          if (lines.length > 0) {
            gsap.from(lines, {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.46,
              stagger: 0.08,
              ease: "power2.inOut",
              clearProps: "transform",
            });
          }

          element.querySelectorAll<HTMLElement>("[data-count-cents]").forEach((counter, index) => {
            const cents = Number(counter.dataset.countCents);
            if (!Number.isFinite(cents)) return;

            const formatter = new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              signDisplay:
                counter.dataset.countSigned === "true" && cents !== 0 ? "always" : "auto",
            });
            const state = { cents: 0 };

            gsap.to(state, {
              cents,
              duration: 0.72,
              delay: index * 0.07,
              ease: "power2.out",
              onUpdate: () => {
                counter.textContent = formatter.format(Math.round(state.cents) / 100);
              },
              onComplete: () => {
                counter.textContent = formatter.format(cents / 100);
              },
            });
          });
        }, element);
      })
      .catch(() => context?.revert());
  });

  return (
    <div ref={root} class={className} data-motion-section={kind}>
      <Slot />
    </div>
  );
});
