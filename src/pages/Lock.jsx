import React, { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";

const TARGET_TS = Date.UTC(2026, 0, 12, 17, 0, 0);

const getRemaining = () => {
  const diff = Math.max(0, TARGET_TS - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const pad = (value) => String(value).padStart(2, "0");

export default function LockScreen() {
  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeItems = useMemo(
    () => [
      { label: "days", value: pad(remaining.days) },
      { label: "hours", value: pad(remaining.hours) },
      { label: "minutes", value: pad(remaining.minutes) },
      { label: "seconds", value: pad(remaining.seconds) },
    ],
    [remaining]
  );

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#FFF7FB] text-[#2B2B2B]">
      <style>{`
        @keyframes float-soft {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffe9f3,transparent_55%)]" />
      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center gap-6 px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(247,183,210,0.4)]">
          <Lock className="h-7 w-7 text-[#F3A6C5]" />
        </div>
        <div className="space-y-2" style={{ animation: "fade-up 0.6s ease-out" }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7A6F77]">
            your birthday unlocks soon
          </p>
          <h1 className="text-2xl font-medium text-[#2B2B2B]">
            Waiting for 13 January 2026
          </h1>
          <p className="text-sm text-[#7A6F77]">
            This website automatic open at 00:00 WIB - 13 Januari 2026
          </p>
        </div>

        <div className="mt-4 grid w-full grid-cols-2 gap-4 rounded-[28px] bg-white/80 p-6 shadow-[0_18px_40px_rgba(247,183,210,0.25)] backdrop-blur-sm sm:grid-cols-4">
          {timeItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-[#FFF0F7] px-4 py-3 text-2xl font-semibold text-[#2B2B2B] shadow-[0_8px_20px_rgba(243,166,197,0.2)]">
                {item.value}
              </div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#7A6F77]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#7A6F77]">
          sabar yasss ;{'] i lawf u sm <3'}
        </p>
      </div>
    </section>
  );
}
