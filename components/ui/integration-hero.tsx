"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo } from "react";
import {
  FaMicrosoft,
  FaApple,
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { SiNike } from "react-icons/si";

const ICONS = [
  { name: "Microsoft", Icon: FaMicrosoft },
  { name: "Apple", Icon: FaApple },
  { name: "Discord", Icon: FaDiscord },
  { name: "Nike", Icon: SiNike },
  { name: "GitHub", Icon: FaGithub },
  { name: "LinkedIn", Icon: FaLinkedin },
  { name: "WhatsApp", Icon: FaWhatsapp },
];

// Utility to repeat icons enough times for the infinite marquee.
const repeatedIcons = (icons: typeof ICONS, repeat = 4) =>
  Array.from({ length: repeat }).flatMap(() => icons);

export default function IntegrationHero() {
  // index.html hides the page to prevent theme flash; reveal once the component mounts.
  useEffect(() => {
    document.documentElement.style.visibility = "visible";
  }, []);

  // Randomize the 7 brands once per mount, then repeat them 4x for the strip.
  const shuffled = useMemo(
    () => [...ICONS].sort(() => Math.random() - 0.5),
    []
  );

  return (
    <section className="relative py-32 overflow-hidden bg-white dark:bg-black min-h-screen flex flex-col justify-center">
      {/* Light grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <span className="inline-block px-3 py-1 mb-4 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white">
          ⚡ Integrations
        </span>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
          Integrate with favorite tools
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-white max-w-xl mx-auto">
          250+ top apps are available to integrate seamlessly with your workflow.
        </p>
        <Button
          variant="default"
          className="mt-8 h-auto px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition"
        >
          Get started
        </Button>

        {/* Single cohesive brand strip */}
        <div className="mt-12 overflow-hidden relative pb-2">
          <div className="flex gap-10 whitespace-nowrap animate-scroll-left">
            {repeatedIcons(shuffled, 4).map(({ name, Icon }, i) => (
              <div
                key={`${name}-${i}`}
                className="h-16 w-16 flex-shrink-0 rounded-full bg-white dark:bg-gray-300 shadow-md flex items-center justify-center"
                title={name}
              >
                <Icon size={40} title={name} />
              </div>
            ))}
          </div>

          {/* Fade overlays */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none" />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll-left {
              animation: scroll-left 30s linear infinite;
            }
          `,
        }}
      />
    </section>
  );
}
