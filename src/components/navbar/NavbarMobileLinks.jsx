import React from "react";
import { Link } from "react-router-dom";

export default function NavbarMobileLinks({ onScrollTo }) {
  return (
    <div className="mt-3 flex w-full flex-row gap-2 sm:hidden">
      <a
        href="#about"
        onClick={onScrollTo("about")}
        className="w-full rounded-xl border border-subtle bg-white/70 px-3 py-2 text-base text-textSecondary transition active:bg-bgSecondary active:text-textPrimary text-center"
      >
        About
      </a>
      <a
        href="#gallery"
        onClick={onScrollTo("gallery")}
        className="w-full rounded-xl border border-subtle bg-white/70 px-3 py-2 text-base text-textSecondary transition active:bg-bgSecondary active:text-textPrimary text-center"
      >
        Memories
      </a>
      <Link
        to="/story"
        className="w-full rounded-xl border border-subtle bg-white/70 px-3 py-2 text-base text-textSecondary transition active:bg-bgSecondary active:text-textPrimary text-center"
      >
        Story
      </Link>
    </div>
  );
}
