export const isNavigationItemActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);
