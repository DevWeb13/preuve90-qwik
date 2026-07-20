export const SITE_CONFIG = {
  name: "Preuve90",
  signature: "AI MATCH LAB",
  tagline: "Les pronostics de l’IA, résultats compris.",
  description:
    "Une expérience publique et vérifiable sur la capacité d’une IA à pronostiquer des matchs de football.",
  publicOrigin: import.meta.env.PUBLIC_ORIGIN?.replace(/\/$/, "") ?? "",
  navigation: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/historique/", label: "Historique", icon: "history" },
    { href: "/statistiques/", label: "Statistiques", icon: "chart" },
    { href: "/methode/", label: "Méthode", icon: "method" },
  ],
  legal: {
    publisherName: "À compléter avant le lancement public",
    publisherAddress: "À compléter avant le lancement public",
    contactEmail: "À compléter avant le lancement public",
    hostName: "Vercel Inc.",
  },
} as const;

export type NavigationIcon = (typeof SITE_CONFIG.navigation)[number]["icon"];
