"use client";

import React, { useMemo } from "react";
import {
  FaMicrosoft,
  FaApple,
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { SiNike } from "react-icons/si";

const BRANDS = [
  { name: "Microsoft", Icon: FaMicrosoft },
  { name: "Apple", Icon: FaApple },
  { name: "Discord", Icon: FaDiscord },
  { name: "Nike", Icon: SiNike },
  { name: "GitHub", Icon: FaGithub },
  { name: "LinkedIn", Icon: FaLinkedin },
  { name: "WhatsApp", Icon: FaWhatsapp },
];

const repeatedIcons = (icons: typeof BRANDS, repeat = 4) =>
  Array.from({ length: repeat }).flatMap(() => icons);

export const BrandScroller = () => {
  // Randomize the 7 brands once per mount, then repeat them 4x for the strip.
  const shuffled = useMemo(
    () => [...BRANDS].sort(() => Math.random() - 0.5),
    []
  );

  return (
    <div
      className="group flex overflow-hidden py-3 [--gap:2rem] [gap:var(--gap)] flex-row max-w-full [--duration:40s] [mask-image:linear-gradient(to_right,rgba(0,0,0,0),rgba(0,0,0,1)_10%,rgba(0,0,0,1)_90%,rgba(0,0,0,0))]"
    >
      <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-brand-scroll flex-row text-[var(--text-main)]">
        {repeatedIcons(shuffled, 4).map(({ name, Icon }, i) => (
          <div
            key={`${name}-${i}`}
            className="h-14 w-14 flex-shrink-0 rounded-full bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex items-center justify-center"
            title={name}
          >
            <Icon size={28} title={name} />
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes brand-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-brand-scroll {
              animation: brand-scroll var(--duration, 40s) linear infinite;
              will-change: transform;
            }
          `,
        }}
      />
    </div>
  );
};
