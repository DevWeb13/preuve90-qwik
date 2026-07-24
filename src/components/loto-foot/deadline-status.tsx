import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { getDeadlineStatus } from "~/lib/formatting/deadline-status";

interface DeadlineStatusProps {
  validationDeadline: string;
}

export const DeadlineStatus = component$<DeadlineStatusProps>(({ validationDeadline }) => {
  const currentTime = useSignal(Date.now());

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const timer = window.setInterval(() => {
      currentTime.value = Date.now();
    }, 60_000);

    cleanup(() => window.clearInterval(timer));
  });

  const status = getDeadlineStatus(validationDeadline, new Date(currentTime.value));

  return (
    <div class={`deadline-status deadline-${status.phase}`}>
      <strong>{status.primary}</strong>
      {status.secondary && <span>{status.secondary}</span>}
    </div>
  );
});
