import React, { useMemo, useState } from "react";

const WISHES = [
  { id: "wish-1", label: "tap me", title: "more laughs.", subtitle: "for your 16th year." },
  { id: "wish-2", label: "a small wish", title: "gentle mornings.", subtitle: "and soft nights." },
  { id: "wish-3", label: "this one", title: "brave little steps.", subtitle: "that feel easy." },
  { id: "wish-4", label: "for you", title: "warm friends.", subtitle: "the kind that stay." },
  { id: "wish-5", label: "one more", title: "quiet confidence.", subtitle: "in your own pace." },
  { id: "wish-6", label: "just this", title: "kind surprises.", subtitle: "sprinkled often." },
  { id: "wish-7", label: "tiny note", title: "light-hearted days.", subtitle: "and soft smiles." },
];

const BALLOON_POSITIONS = [
  { x: 18, y: 22 },
  { x: 65, y: 18 },
  { x: 38, y: 34 },
  { x: 72, y: 46 },
  { x: 22, y: 52 },
  { x: 52, y: 64 },
  { x: 32, y: 72 },
];

const BALLOON_COLORS = ["#F7B7D2", "#F3A6C5", "#DCCBFF", "#BFE3FF", "#FFD7C2"];

export default function WishIn16() {
  const [openedIds, setOpenedIds] = useState([]);
  const [activeWish, setActiveWish] = useState(null);
  const [poppedId, setPoppedId] = useState(null);

  const remainingWishes = useMemo(
    () => WISHES.filter((wish) => !openedIds.includes(wish.id)),
    [openedIds]
  );

  const handleOpenWish = (wish) => {
    if (openedIds.includes(wish.id)) return;
    setPoppedId(wish.id);
    setTimeout(() => {
      setOpenedIds((prev) => [...prev, wish.id]);
      setActiveWish(wish);
      setPoppedId(null);
    }, 260);
  };

  const handleClose = () => setActiveWish(null);

  const isComplete = remainingWishes.length === 0;

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#FFF7FB] text-[#2B2B2B]">
      <style>{`
        @keyframes float-soft {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
          100% { transform: translate(-50%, -50%) translateY(0px); }
        }
        @keyframes pop-away {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(1.08); opacity: 0; }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffe9f3,transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[540px] flex-col px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7A6F77]">
          for your 16th birthday
        </p>
        <p className="mt-2 text-xs text-[#7A6F77]">tap a balloon</p>

        <div className="relative mt-10 flex-1">
          {!isComplete &&
            remainingWishes.map((wish, index) => {
              const pos = BALLOON_POSITIONS[index] || { x: 50, y: 50 };
              const color = BALLOON_COLORS[index % BALLOON_COLORS.length];
              const isPopping = poppedId === wish.id;
              return (
                <button
                  key={wish.id}
                  type="button"
                  onClick={() => handleOpenWish(wish)}
                  className="absolute flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-[#2B2B2B]/75 focus:outline-none"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: "140px",
                    height: "110px",
                    background: color,
                    opacity: 0.82,
                    boxShadow: "0 12px 26px rgba(243, 166, 197, 0.25)",
                    backdropFilter: "blur(2px)",
                    animation: isPopping
                      ? "pop-away 0.26s ease-out forwards"
                      : "float-soft 5.5s ease-in-out infinite",
                  }}
                >
                  <span className="border-b border-transparent transition hover:border-[#F3A6C5]/60">
                    {wish.label}
                  </span>
                </button>
              );
            })}

          {isComplete && (
            <div className="mt-20 text-center text-lg font-medium text-[#2B2B2B]">
              that’s all.
              <span className="mt-2 block text-base font-normal text-[#7A6F77]">
                happy 16, kiran.
              </span>
            </div>
          )}
        </div>
      </div>

      {activeWish && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FFF7FB]/85 backdrop-blur-sm">
          <div className="w-[86%] max-w-[360px] rounded-[26px] bg-white px-6 py-8 text-center shadow-[0_18px_40px_rgba(247,183,210,0.25)]">
            <div
              className="text-2xl font-medium tracking-wide text-[#2B2B2B]"
              style={{ animation: "fade-up 0.45s ease-out" }}
            >
              {activeWish.title}
            </div>
            <div
              className="mt-2 text-sm text-[#7A6F77]"
              style={{ animation: "fade-up 0.45s ease-out 0.12s both" }}
            >
              {activeWish.subtitle}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 text-xs uppercase tracking-[0.2em] text-[#7A6F77] transition hover:text-[#2B2B2B]"
            >
              close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
