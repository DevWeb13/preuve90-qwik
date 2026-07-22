import { component$ } from "@builder.io/qwik";
import type { NavigationIcon } from "~/config/site";

type IconName = NavigationIcon | "arrow" | "proof";

interface IconProps {
  name: IconName;
  size?: number;
}

export const Icon = component$<IconProps>(({ name, size = 20 }) => {
  const paths: Record<IconName, string> = {
    home: "M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z",
    legal: "M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4",
    privacy: "M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6zM9.5 12l1.7 1.7 3.6-4",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    proof: "M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6zM9 12l2 2 4-5",
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
