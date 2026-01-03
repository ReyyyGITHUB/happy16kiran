import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function AboutHeader() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="relative flex flex-col gap-4 max-w-[520px]">
        <h1 className="text-l text-textDark">About Us</h1>
        <div className="h-[2px] w-10 rounded-full bg-pinkSoft" />
        <p className="text-caption text-textSecondary">
          It started simple. We didn’t think it would mean this much.
        </p>
        <span className="pointer-events-none absolute -top-1 left-24 -rotate-6 text-pink/60">
          <Heart className="h-3.5 w-3.5" />
        </span>
      </div>
      <Link
        to="/story"
        className="h-fit rounded-md border border-subtle bg-white px-4 py-2 text-caption text-textPrimary"
      >
        More Detail
      </Link>
    </div>
  );
}
