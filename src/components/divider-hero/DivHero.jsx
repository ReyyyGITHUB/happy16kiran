import React from "react";
import { PenLine } from "lucide-react";

export default function DivHero() {
  return (
    <div className="w-full border-t border-subtle bg-bgSecondary/60">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-2 py-4 text-caption text-textMuted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-textSecondary">Made onli for kiran:p</p>
        <div className="flex flex-col items-end gap-1 sm:items-end">
          <p className="flex items-center justify-end gap-2 text-right text-sm sm:max-w-[520px]">
            <PenLine className="h-4 w-4 text-textMuted" />
            <span className="hidden sm:inline">
              Website ini dibuat pelan-pelan, because you were always on my
              mind.
            </span>
            <span className="sm:hidden">Website ini dibuat dengan...</span>
          </p>
          <button className="text-xs text-pink sm:hidden">
            Lihat selengkapnya
          </button>
        </div>
      </div>
    </div>
  );
}
