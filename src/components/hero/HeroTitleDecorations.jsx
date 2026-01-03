import React from "react";

export default function HeroTitleDecorations() {
  const decorations = [
    // Left area
    {
      src: "/assets/hero/conffeti1.svg",
      className:
        "absolute left-[6%] top-[34%] h-6 w-6 -rotate-[18deg] opacity-100 hidden sm:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },
    {
      src: "/assets/hero/conffeti1.svg",
      className:
        "absolute left-[10%] top-[52%] h-6 w-6 rotate-[14deg] opacity-100 hidden sm:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },

    // Top around title
    {
      src: "/assets/hero/conffeti1.svg",
      className:
        "absolute left-[42%] top-[10%] h-6 w-6 -rotate-12 opacity-90 hidden md:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },
    {
      src: "/assets/hero/confetti2.svg",
      className:
        "absolute left-[58%] top-[14%] h-6 w-6 rotate-[10deg] opacity-70 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },

    // Right area
    {
      src: "/assets/hero/conffeti3.svg",
      className:
        "absolute right-[18%] top-[18%] h-6 w-6 rotate-[16deg] opacity-70 hidden sm:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },
    {
      src: "/assets/hero/confetti4.svg",
      className:
        "absolute right-[8%] top-[44%] h-6 w-6 rotate-[22deg] opacity-100 hidden sm:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },

    // Near subtitle words
    {
      src: "/assets/hero/confetti5.svg",
      className:
        "absolute right-[12%] top-[64%] h-6 w-6 -rotate-[8deg] opacity-95 hidden md:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },

    // Bottom corners (keep minimal, like Figma)
    {
      src: "/assets/hero/confetti6.svg",
      className:
        "absolute left-[22%] bottom-[14%] h-6 w-6 rotate-[18deg] opacity-90 hidden md:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },
    {
      src: "/assets/hero/confetti5.svg",
      className:
        "absolute right-[22%] bottom-[16%] h-6 w-6 -rotate-[14deg] opacity-90 hidden md:block sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9",
      alt: "confetti",
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0">
      {decorations.map((item, index) => (
        <img
          key={`${item.src}-${index}`}
          src={item.src}
          alt={item.alt}
          className={item.className}
          draggable={false}
        />
      ))}
    </div>
  );
}
