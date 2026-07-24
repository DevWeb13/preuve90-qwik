import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { SITE_CONFIG } from "~/config/site";
import { Icon } from "~/components/ui/icon";
import { isNavigationItemActive } from "~/lib/routing/navigation";
import Preuve90Mark from "../../../public/favicon.svg?jsx";

export const AppShell = component$(() => {
  const location = useLocation();
  const isActive = (href: string) => isNavigationItemActive(location.url.pathname, href);

  return (
    <>
      <a class="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <header class="site-header">
        <div class="site-header-inner">
          <Link aria-label="Preuve90 : accueil" class="brand" href="/">
            <Preuve90Mark aria-hidden="true" class="brand-mark" />
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
          <span class="site-status">
            <span aria-hidden="true" /> PUBLICATIONS VÉRIFIABLES
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
            <p>Des analyses football publiques, datées et vérifiables.</p>
          </div>
          <nav aria-label="Informations légales">
            {SITE_CONFIG.footerNavigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p class="footer-note">
          Simulations uniquement · Aucun argent réel joué · Aucun lien avec FDJ ou Parions Sport.
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
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
});
