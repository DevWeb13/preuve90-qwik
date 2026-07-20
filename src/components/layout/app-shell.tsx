import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { SITE_CONFIG } from "~/config/site";
import { Icon } from "~/components/ui/icon";

export const AppShell = component$(() => {
  const location = useLocation();
  const isActive = (href: string) =>
    href === "/"
      ? location.url.pathname === "/"
      : location.url.pathname.startsWith(href) ||
        (href === "/historique/" && location.url.pathname.startsWith("/pronostic/"));

  return (
    <>
      <a class="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <header class="site-header">
        <div class="site-header-inner">
          <Link aria-label="Preuve90 — accueil" class="brand" href="/">
            <span class="brand-mark">P90</span>
            <span>
              <strong>PREUVE90</strong>
              <small>{SITE_CONFIG.signature}</small>
            </span>
          </Link>
          <nav aria-label="Navigation principale" class="desktop-nav">
            {SITE_CONFIG.navigation.map((item) => (
              <Link
                key={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                class={{ "nav-link": true, active: isActive(item.href) }}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span class="live-indicator">
            <span aria-hidden="true" /> PROTOCOLE PUBLIC
          </span>
        </div>
      </header>

      <main id="main-content" class="page-shell" tabIndex={-1}>
        <Slot />
      </main>

      <footer class="site-footer">
        <div class="footer-grid">
          <div>
            <strong>PREUVE90</strong>
            <p>Une expérience de pronostics multisports publics, mesurés et vérifiables.</p>
          </div>
          <nav aria-label="Informations légales">
            <Link href="/mentions-legales/">Mentions légales</Link>
            <Link href="/confidentialite/">Confidentialité</Link>
          </nav>
        </div>
        <p class="legal-warning">
          Preuve90 est une expérience publique. Aucun pari réel n’est placé. Les performances
          passées ne garantissent aucun résultat futur. Les jeux d’argent comportent des risques et
          sont interdits aux mineurs.
        </p>
      </footer>

      <nav aria-label="Navigation principale mobile" class="mobile-nav">
        {SITE_CONFIG.navigation.map((item) => (
          <Link
            key={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            class={{ "mobile-nav-link": true, active: isActive(item.href) }}
            href={item.href}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
});
