import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";

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
          .from("[data-intro-line]", { opacity: 0, xPercent: -100, duration: 0.28 }, 0);
      }, root.value);
    });
  });

  return (
    <section ref={root} class="dashboard-intro">
      <span aria-hidden="true" class="intro-line" data-intro-line />
      <Slot />
    </section>
  );
});
