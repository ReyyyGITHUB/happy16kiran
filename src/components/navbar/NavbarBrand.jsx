import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function NavbarBrand() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-pinkSoft">
        <Heart className="h-5 w-5 text-pink" />
      </span>

      <Link
        to="/"
        className="font-heading text-strong text-textPrimary tracking-tight"
      >
        Happy16Kiran
      </Link>
    </div>
  );
}
