"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { Theme } from "@/types";

interface City {
  location: string;
  coordinates: string;
}

interface LocationMapProps {
  cities?: City[];
  intervalMs?: number;
  className?: string;
  theme?: Theme;
}

const DEFAULT_CITIES: City[] = [
  { location: "San Francisco, CA", coordinates: "37.7749° N, 122.4194° W" },
  { location: "London, UK",        coordinates: "51.5074° N, 0.1278° W"   },
  { location: "Tokyo, JP",         coordinates: "35.6762° N, 139.6503° E" },
  { location: "Sydney, AUS",       coordinates: "33.8688° S, 151.2093° E" },
  { location: "Paris, France",    coordinates: "48.8566° N, 2.3522° E"    },
  { location: "Berlin, Germany",  coordinates: "52.5200° N, 13.4050° E"  },
  { location: "Dubai, UAE",       coordinates: "25.2048° N, 55.2708° E"   },
  { location: "Singapore",        coordinates: "1.3521° N, 103.8198° E"   },
  { location: "Mumbai, India",    coordinates: "19.0760° N, 72.8777° E"   },
  { location: "São Paulo, Brazil", coordinates: "23.5505° S, 46.6333° W"  },
  { location: "Mexico City, MX",  coordinates: "19.4326° N, 99.1332° W"  },
  { location: "Toronto, Canada", coordinates: "43.6532° N, 79.3832° W"  },
  { location: "Seoul, South Korea", coordinates: "37.5665° N, 126.9780° E" },
  { location: "Cape Town, SA",   coordinates: "33.9249° S, 18.4241° E"  },
];

// Unique building patterns for each city
const CITY_BUILDING_PATTERNS = [
  // San Francisco - dense urban
  [
    { top: '40%', left: '10%', w: '15%', h: '20%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '15%', left: '35%', w: '12%', h: '15%', bg: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.15)' },
    { top: '70%', left: '75%', w: '18%', h: '18%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '20%', right: '10%', w: '10%', h: '25%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.15)' },
    { top: '55%', left: '5%', w: '8%', h: '12%', bg: 'rgba(148,163,184,0.20)', border: 'rgba(148,163,184,0.12)' },
    { top: '8%', left: '75%', w: '14%', h: '10%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.15)' },
  ],
  // London - spread out
  [
    { top: '30%', left: '15%', w: '20%', h: '15%', bg: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.18)' },
    { top: '60%', left: '40%', w: '15%', h: '20%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.20)' },
    { top: '25%', right: '20%', w: '12%', h: '18%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.14)' },
    { top: '75%', left: '10%', w: '10%', h: '10%', bg: 'rgba(148,163,184,0.20)', border: 'rgba(148,163,184,0.12)' },
    { top: '45%', right: '8%', w: '14%', h: '12%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.16)' },
  ],
  // Tokyo - very dense, tall
  [
    { top: '20%', left: '8%', w: '10%', h: '30%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '35%', left: '25%', w: '8%', h: '25%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '15%', left: '45%', w: '12%', h: '35%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '50%', left: '65%', w: '10%', h: '28%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '65%', left: '80%', w: '8%', h: '20%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '10%', right: '10%', w: '14%', h: '22%', bg: 'rgba(148,163,184,0.27)', border: 'rgba(148,163,184,0.17)' },
    { top: '75%', left: '20%', w: '12%', h: '15%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
  ],
  // Sydney - coastal spread
  [
    { top: '25%', left: '30%', w: '18%', h: '18%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '55%', left: '15%', w: '14%', h: '22%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '40%', right: '20%', w: '16%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '70%', left: '55%', w: '12%', h: '14%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '15%', right: '35%', w: '10%', h: '12%', bg: 'rgba(148,163,184,0.20)', border: 'rgba(148,163,184,0.10)' },
  ],
  // Paris - elegant, medium density
  [
    { top: '35%', left: '20%', w: '14%', h: '18%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '55%', left: '45%', w: '16%', h: '20%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '20%', right: '25%', w: '12%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '70%', left: '15%', w: '10%', h: '12%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '45%', right: '15%', w: '14%', h: '14%', bg: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.15)' },
  ],
  // Berlin - industrial, spread
  [
    { top: '25%', left: '12%', w: '18%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '50%', left: '35%', w: '14%', h: '22%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '65%', left: '60%', w: '16%', h: '18%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '30%', right: '20%', w: '12%', h: '14%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '75%', left: '8%', w: '10%', h: '10%', bg: 'rgba(148,163,184,0.20)', border: 'rgba(148,163,184,0.10)' },
  ],
  // Dubai - modern, tall towers
  [
    { top: '15%', left: '25%', w: '10%', h: '35%', bg: 'rgba(148,163,184,0.34)', border: 'rgba(148,163,184,0.24)' },
    { top: '30%', left: '45%', w: '8%', h: '40%', bg: 'rgba(148,163,184,0.36)', border: 'rgba(148,163,184,0.26)' },
    { top: '20%', left: '60%', w: '12%', h: '32%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '55%', left: '35%', w: '14%', h: '25%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '70%', left: '70%', w: '10%', h: '20%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '10%', right: '15%', w: '8%', h: '28%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
  ],
  // Singapore - compact, dense
  [
    { top: '25%', left: '15%', w: '12%', h: '28%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '40%', left: '35%', w: '10%', h: '32%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '20%', left: '55%', w: '14%', h: '26%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '60%', left: '25%', w: '8%', h: '24%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '70%', left: '65%', w: '12%', h: '18%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '15%', right: '20%', w: '10%', h: '22%', bg: 'rgba(148,163,184,0.27)', border: 'rgba(148,163,184,0.17)' },
  ],
  // Mumbai - chaotic, dense
  [
    { top: '20%', left: '10%', w: '10%', h: '25%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '35%', left: '25%', w: '8%', h: '30%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '15%', left: '40%', w: '12%', h: '28%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '50%', left: '55%', w: '10%', h: '26%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '65%', left: '70%', w: '8%', h: '22%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '75%', left: '20%', w: '12%', h: '16%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '10%', right: '15%', w: '14%', h: '20%', bg: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.15)' },
  ],
  // São Paulo - sprawling, varied
  [
    { top: '30%', left: '18%', w: '16%', h: '18%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '55%', left: '40%', w: '14%', h: '22%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '25%', right: '22%', w: '12%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '70%', left: '12%', w: '10%', h: '14%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '45%', right: '10%', w: '18%', h: '20%', bg: 'rgba(148,163,184,0.27)', border: 'rgba(148,163,184,0.17)' },
    { top: '15%', left: '60%', w: '8%', h: '12%', bg: 'rgba(148,163,184,0.20)', border: 'rgba(148,163,184,0.10)' },
  ],
  // Mexico City - dense, layered
  [
    { top: '22%', left: '15%', w: '14%', h: '24%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '45%', left: '35%', w: '12%', h: '28%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '18%', left: '55%', w: '10%', h: '32%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '60%', left: '20%', w: '16%', h: '20%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '72%', left: '65%', w: '12%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '12%', right: '18%', w: '8%', h: '26%', bg: 'rgba(148,163,184,0.27)', border: 'rgba(148,163,184,0.17)' },
  ],
  // Toronto - organized, modern
  [
    { top: '28%', left: '20%', w: '14%', h: '20%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '52%', left: '42%', w: '16%', h: '24%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '22%', right: '25%', w: '12%', h: '18%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '68%', left: '10%', w: '10%', h: '14%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '40%', right: '12%', w: '14%', h: '16%', bg: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.15)' },
  ],
  // Seoul - high-density, vertical
  [
    { top: '18%', left: '12%', w: '10%', h: '32%', bg: 'rgba(148,163,184,0.32)', border: 'rgba(148,163,184,0.22)' },
    { top: '32%', left: '28%', w: '8%', h: '38%', bg: 'rgba(148,163,184,0.34)', border: 'rgba(148,163,184,0.24)' },
    { top: '15%', left: '48%', w: '12%', h: '35%', bg: 'rgba(148,163,184,0.30)', border: 'rgba(148,163,184,0.20)' },
    { top: '55%', left: '62%', w: '10%', h: '30%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '70%', left: '78%', w: '8%', h: '24%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '8%', right: '12%', w: '14%', h: '28%', bg: 'rgba(148,163,184,0.29)', border: 'rgba(148,163,184,0.19)' },
    { top: '75%', left: '22%', w: '12%', h: '18%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
  ],
  // Cape Town - coastal, mixed
  [
    { top: '35%', left: '25%', w: '16%', h: '18%', bg: 'rgba(148,163,184,0.26)', border: 'rgba(148,163,184,0.16)' },
    { top: '58%', left: '45%', w: '14%', h: '22%', bg: 'rgba(148,163,184,0.28)', border: 'rgba(148,163,184,0.18)' },
    { top: '28%', right: '20%', w: '12%', h: '16%', bg: 'rgba(148,163,184,0.24)', border: 'rgba(148,163,184,0.14)' },
    { top: '72%', left: '15%', w: '10%', h: '14%', bg: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.12)' },
    { top: '45%', right: '10%', w: '18%', h: '20%', bg: 'rgba(148,163,184,0.27)', border: 'rgba(148,163,184,0.17)' },
  ],
];

const themeAccentColors: Record<Theme, string> = {
  purple: '#a855f7',
  green: '#22c55e',
  blue: '#3b82f6',
};

export function LocationMap({
  cities = DEFAULT_CITIES,
  intervalMs = 4000,
  className,
  theme = 'purple',
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-trigger expand when in viewport (resets on scroll away)
  const inView = useInView(containerRef, { amount: 0.1 });
  useEffect(() => {
    setIsExpanded(inView);
  }, [inView]);

  // Cycle through cities
  useEffect(() => {
    if (cities.length <= 1) return;
    const id = setInterval(() => {
      setCityIndex((i) => (i + 1) % cities.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [cities.length, intervalMs]);

  const { location, coordinates } = cities[cityIndex];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${className ?? ""}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
          willChange: "transform, width, height",
        }}
        animate={{
          width: isExpanded ? 440 : 320,
          height: isExpanded ? 360 : 180,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.08]" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-[var(--bg-hover)]" />

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {/* Main roads */}
                <motion.line
                  x1="0%" y1="35%" x2="100%" y2="35%"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <motion.line
                  x1="0%" y1="65%" x2="100%" y2="65%"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />

                {/* Vertical main roads */}
                <motion.line
                  x1="30%" y1="0%" x2="30%" y2="100%"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
                <motion.line
                  x1="70%" y1="0%" x2="70%" y2="100%"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />

                {/* Secondary streets */}
                {[20, 50, 80].map((y, i) => (
                  <motion.line
                    key={`h-${i}`}
                    x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  />
                ))}
                {[15, 45, 55, 85].map((x, i) => (
                  <motion.line
                    key={`v-${i}`}
                    x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  />
                ))}
              </svg>

              {/* Buildings */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`buildings-${cityIndex}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {CITY_BUILDING_PATTERNS[cityIndex]?.map((building, i) => {
                    const delays = [0.5, 0.6, 0.7, 0.55, 0.65, 0.75];
                    return (
                      <motion.div
                        key={i}
                        className="absolute rounded-sm"
                        style={{
                          top: building.top,
                          left: building.left,
                          right: (building as any).right,
                          width: building.w,
                          height: building.h,
                          background: building.bg,
                          border: `1px solid ${building.border}`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: delays[i] || 0.5 + i * 0.05 }}
                      />
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Pin marker — re-animates whenever the city changes */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={location}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: -10, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-lg"
                    style={{ filter: `drop-shadow(0 0 10px ${themeAccentColors[theme]}80)` }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={themeAccentColors[theme]} />
                    <circle cx="12" cy="9" r="2.5" fill="var(--bg-card)" />
                  </svg>
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern — only show when collapsed */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          animate={{ opacity: isExpanded ? 0 : 0.03 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="expand-map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#expand-map-grid)" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          {/* Top section */}
          <div className="flex items-start justify-between">
            <div className="relative">
              <motion.div
                className="relative"
                animate={{ opacity: isExpanded ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Map Icon SVG */}
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: themeAccentColors[theme] }}
                  animate={{
                    filter: isHovered
                      ? `drop-shadow(0 0 8px ${themeAccentColors[theme]}99)`
                      : `drop-shadow(0 0 4px ${themeAccentColors[theme]}4D)`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" x2="9" y1="3" y2="18" />
                  <line x1="15" x2="15" y1="6" y2="21" />
                </motion.svg>
              </motion.div>
            </div>

            {/* Status indicator */}
            <motion.div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm"
              animate={{
                scale: isHovered ? 1.05 : 1,
                backgroundColor: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeAccentColors[theme] }} />
              <span className="text-[10px] font-medium text-[var(--text-muted)] tracking-wide uppercase">Live</span>
            </motion.div>
          </div>

          {/* Bottom section */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              <motion.h3
                key={location}
                className="text-[var(--text-main)] font-medium text-sm tracking-tight"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, x: isHovered ? 4 : 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                {location}
              </motion.h3>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.p
                  key={coordinates}
                  className="text-[var(--text-muted)] text-xs font-mono"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Animated underline */}
            <motion.div
              className="h-px"
              style={{
                background: `linear-gradient(to right, ${themeAccentColors[theme]}80, ${themeAccentColors[theme]}4D, transparent)`,
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
