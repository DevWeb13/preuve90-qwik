export const SITE_CONFIG = {
  name: "Preuve90",
  signature: "AI VALUE LAB",
  tagline: "La valeur estimée par l’IA, résultats compris.",
  description:
    "Une expérience publique et vérifiable qui recherche un candidat multisport à valeur estimée positive parmi les prochains événements analysés.",
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
