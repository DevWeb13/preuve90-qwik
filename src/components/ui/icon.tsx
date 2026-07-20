import { component$ } from "@builder.io/qwik";
import type { NavigationIcon } from "~/config/site";

type IconName = NavigationIcon | "arrow" | "check" | "clock" | "proof" | "warning";

interface IconProps {
  name: IconName;
  size?: number;
}

export const Icon = component$<IconProps>(({ name, size = 20 }) => {
  const paths: Record<IconName, string> = {
    home: "M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z",
    history: "M4 5v5h5M5.2 16.8A8 8 0 1 0 4 10",
    chart: "M4 20V10m6 10V4m6 16v-7m5 7H2",
    method: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    check: "m5 12 4 4L19 6",
    clock: "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9m0 5v5l3 2",
    proof: "M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6zM9 12l2 2 4-5",
    warning: "M12 4 3 20h18zM12 9v5m0 3v.01",
  };

  return (
    <svg
      aria-hidden="true"
      class="icon"
      fill={name === "home" ? "currentColor" : "none"}
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d={paths[name]}
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
      />
    </svg>
  );
});
