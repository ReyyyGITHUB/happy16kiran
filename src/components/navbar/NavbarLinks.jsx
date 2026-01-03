import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Images } from "lucide-react";

export default function NavbarLinks({ onScrollTo }) {
  return (
    <div className="hidden sm:flex items-center gap-2 ">
      <a
        href="#about"
        onClick={onScrollTo("about")}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base text-textSecondary transition hover:text-textPrimary hover:bg-bgSecondary hover:underline hover:underline-offset-4 active:bg-bgSecondary/80 active:text-textPrimary text-center "
      >
        <Sparkles className="h-4 w-4 text-textMuted " />
        About
      </a>

      <a
        href="#gallery"
        onClick={onScrollTo("gallery")}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base text-textSecondary transition hover:text-textPrimary hover:bg-bgSecondary hover:underline hover:underline-offset-4 active:bg-bgSecondary/80 active:text-textPrimary"
      >
        <Images className="h-4 w-4 text-textMuted" />
        Memories
      </a>

      <Link
        to="/story"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base text-center text-textSecondary transition hover:text-textPrimary hover:bg-bgSecondary hover:underline hover:underline-offset-4 active:bg-bgSecondary/80 active:text-textPrimary"
      >
        Story
      </Link>
    </div>
  );
}
