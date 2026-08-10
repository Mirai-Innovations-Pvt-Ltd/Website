import Link from "next/link";
import MiraiWordmark from "@/components/MiraiWordmark";
import ThemeToggle from "@/components/ThemeToggle";

/* Section anchors are written as "/#…" (rather than the
   prototype's bare "#…") so they also work from /privacy and
   /terms — the only adaptation needed now that the site has
   more than one route. On the home page the behavior is
   identical: fragment navigation with CSS smooth scrolling. */
const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#behind-the-build", label: "Behind the Build" },
  { href: "/#team", label: "Team" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <nav className="nav" aria-label="Primary">
          <Link className="nav-mark" href="/" aria-label="Mirai — home">
            <MiraiWordmark />
          </Link>

          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>

          {/* Native <details> disclosure — no JS, keyboard-operable
              out of the box, no custom animation (per the prototype). */}
          <details className="nav-menu">
            <summary aria-label="Open navigation menu">Menu</summary>
            <div className="nav-menu-panel">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <div className="nav-actions">
            <ThemeToggle />
            <Link className="btn-primary" href="/#contact">
              Talk to us
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
