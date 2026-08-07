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

const BRANDS = [
  { name: "Microsoft", icon: FaMicrosoft },
  { name: "Apple", icon: FaApple },
  { name: "Discord", icon: FaDiscord },
  { name: "Nike", icon: SiNike },
  { name: "GitHub", icon: FaGithub },
  { name: "LinkedIn", icon: FaLinkedin },
  { name: "WhatsApp", icon: FaWhatsapp },
];

export default function IntegrationHero() {
  // index.html hides the page to prevent theme flash; reveal once the component mounts.
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);

  // Randomize order once per mount, then repeat the strip 4x for the marquee.
  const shuffled = useMemo(
    () => [...BRANDS].sort(() => Math.random() - 0.5),
    []
  );
  const repeated = useMemo(
    () => Array.from({ length: 4 }).flatMap(() => shuffled),
    [shuffled]
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-white flex flex-col justify-center">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes integration-scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .integration-scroll-left {
              animation: integration-scroll-left 30s linear infinite;
            }
          `,
        }}
      />

      {/* Light grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <span className="inline-block px-3 py-1 mb-4 text-sm rounded-full border border-gray-200 bg-white text-black">
          Integrations
        </span>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-black">
          Integrate with favorite tools
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          250+ top apps are available to integrate seamlessly with your workflow.
        </p>
        <Button
          variant="default"
          size="lg"
          className="mt-8 h-auto px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Get started
        </Button>

        {/* Single cohesive brand strip */}
        <div className="mt-12 overflow-hidden relative [--gap:2.5rem]">
          <div className="flex [gap:var(--gap)] integration-scroll-left">
            {repeated.map((brand, i) => {
              const Icon = brand.icon;
              return (
                <div
                  key={`${brand.name}-${i}`}
                  className="flex shrink-0 items-center gap-3 px-5 py-3 rounded-full bg-white shadow-md border border-gray-100"
                >
                  <Icon className="h-8 w-8 text-black" aria-hidden="true" />
                  <span className="text-lg font-semibold text-black/80 whitespace-nowrap">
                    {brand.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fade overlays */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
