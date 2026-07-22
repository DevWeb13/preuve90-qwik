export const SITE_CONFIG = {
  name: "Preuve90",
  signature: "AI FOOTBALL LAB",
  tagline: "Une nouvelle expérience se prépare.",
  description:
    "Preuve90 prépare une nouvelle expérience publique de pronostics football produits par une IA.",
  publicOrigin: import.meta.env.PUBLIC_ORIGIN?.replace(/\/$/, "") ?? "",
  navigation: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/mentions-legales/", label: "Mentions légales", icon: "legal" },
    { href: "/confidentialite/", label: "Confidentialité", icon: "privacy" },
  ],
  legal: {
    publisherName: "À compléter avant le lancement public",
    publisherAddress: "À compléter avant le lancement public",
    contactEmail: "À compléter avant le lancement public",
    hostName: "Vercel Inc.",
  },
} as const;

export type NavigationIcon = (typeof SITE_CONFIG.navigation)[number]["icon"];
