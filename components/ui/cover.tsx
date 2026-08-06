import React, { useEffect, useId, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

export const Cover = ({
  children,
  className,
  lightMode = false,
  disableHover = false,
  active,
}: {
  children?: React.ReactNode;
  className?: string;
  lightMode?: boolean;
  disableHover?: boolean;
  active?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  const isActive = active !== undefined ? active : hovered;
  const canHover = !disableHover && active === undefined;

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const update = () => {
      const { clientWidth, clientHeight } = el;
      setContainerWidth(clientWidth);
      const numberOfBeams = Math.max(0, Math.floor(clientHeight / 10));
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (clientHeight / (numberOfBeams + 1))
      );
      setBeamPositions(positions);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      onMouseEnter={canHover ? () => setHovered(true) : undefined}
      onMouseLeave={canHover ? () => setHovered(false) : undefined}
      ref={ref}
      className="relative group/cover inline-block px-2 py-2 transition duration-200 rounded-sm"
      style={{ backgroundColor: lightMode ? '#ffffff' : '#171717' }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.2 } }}
            className="h-full w-full overflow-hidden absolute inset-0"
          >
            <motion.div
              animate={{ translateX: ["-50%", "0%"] }}
              transition={{ translateX: { duration: 10, ease: "linear", repeat: Infinity } }}
              className="w-[200%] h-full flex"
            >
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={120}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={120}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={isActive}
          duration={Math.random() * 2 + 1}
          delay={Math.random() * 2 + 1}
          width={containerWidth || 600}
          style={{ top: `${position}px` }}
        />
      ))}
      <motion.span
        key={String(isActive)}
        initial={{ scale: 1, x: 0, y: 0 }}
        animate={{
          scale: isActive ? 0.8 : 1,
          x: isActive ? [0, -30, 30, -30, 30, 0] : 0,
          y: isActive ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        exit={{ filter: "none", scale: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.2,
          x: { duration: 0.2, repeat: Infinity, repeatType: "loop" },
          y: { duration: 0.2, repeat: Infinity, repeatType: "loop" },
          scale: { duration: 0.2 },
          filter: { duration: 0.2 },
        }}
        className={cn(
          "inline-block relative z-20 transition duration-200",
          className
        )}
        style={{ color: lightMode ? '#0f172a' : '#ffffff' }}
      >
        {children}
      </motion.span>
      <CircleIcon active={isActive} className="absolute -right-[2px] -top-[2px]" />
      <CircleIcon active={isActive} className="absolute -bottom-[2px] -right-[2px]" delay={0.4} />
      <CircleIcon active={isActive} className="absolute -left-[2px] -top-[2px]" delay={0.8} />
      <CircleIcon active={isActive} className="absolute -bottom-[2px] -left-[2px]" delay={1.6} />
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();
  const safeWidth = width > 0 ? width : 600;

  return (
    <motion.svg
      width={safeWidth}
      height="1"
      viewBox={`0 0 ${safeWidth} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path d={`M0 0.5H${safeWidth}`} stroke={`url(#svgGradient-${id})`} />
      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: hovered ? 0.5 : duration ?? 2,
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : delay ?? 1,
          }}
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({
  className,
  delay,
  active,
}: {
  className?: string;
  delay?: number;
  active?: boolean;
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none h-2 w-2 rounded-full bg-neutral-900 dark:bg-white transition-opacity duration-200",
        active ? "opacity-100" : "opacity-20",
        className
      )}
    />
  );
};
