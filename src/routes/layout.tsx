import { component$, Slot } from "@builder.io/qwik";
import { AppShell } from "~/components/layout/app-shell";

export default component$(() => (
  <AppShell>
    <Slot />
  </AppShell>
));
