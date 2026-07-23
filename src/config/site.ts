export const SITE_CONFIG = {
  name: "Preuve90",
  signature: "AI FOOTBALL LAB",
  tagline: "Des pronostics publiés avant le coup d’envoi.",
  description:
    "Preuve90 publie des analyses et des combinaisons virtuelles Loto Foot, horodatées avant leur date limite.",
  publicOrigin: import.meta.env.PUBLIC_ORIGIN?.replace(/\/$/, "") ?? "",
  navigation: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/loto-foot/7/", label: "LF7", icon: "grid" },
    { href: "/loto-foot/8/", label: "LF8", icon: "grid" },
    { href: "/loto-foot/12/", label: "LF12", icon: "grid" },
    { href: "/loto-foot/15/", label: "LF15", icon: "grid" },
  ],
  footerNavigation: [
    { href: "/mentions-legales/", label: "Mentions légales" },
    { href: "/confidentialite/", label: "Confidentialité" },
  ],
  legal: {
    publisherName: "À compléter avant le lancement public",
    publisherAddress: "À compléter avant le lancement public",
    contactEmail: "À compléter avant le lancement public",
    hostName: "Vercel Inc.",
  },
} as const;

export type NavigationIcon = (typeof SITE_CONFIG.navigation)[number]["icon"];
