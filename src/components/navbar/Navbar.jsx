import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import NavbarBrand from "./NavbarBrand";
import NavbarLinks from "./NavbarLinks";
import NavbarCta from "./NavbarCta";
import NavbarMobileLinks from "./NavbarMobileLinks";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 12);
      if (current === 0) {
        setHidden(false);
      } else if (current > lastScrollY.current) {
        setHidden(true);
      } else if (current < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = current;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToId = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className="px-4 sm:px-6 pt-3">
        {/* Gradient border wrapper */}
        <div className="mx-auto max-w-245 rounded-2xl bg-linear-to-r from-pinkSoft via-blueSoft to-pinkSoft p-px">
          <nav
            className={[
              "rounded-2xl px-4 py-3",
              "bg-white/65 backdrop-blur-md",
              "border border-subtle",
              "transition-all duration-200",
              scrolled ? "shadow-sm" : "shadow-none",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <NavbarBrand />
              <NavbarLinks onScrollTo={scrollToId} />
              <div className="hidden sm:flex">
                <NavbarCta onScrollTo={scrollToId} />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-subtle bg-white/70 p-2 text-textPrimary transition sm:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile quick links */}
            {mobileOpen && <NavbarMobileLinks onScrollTo={scrollToId} />}
          </nav>
        </div>
      </div>
    </header>
  );
}
