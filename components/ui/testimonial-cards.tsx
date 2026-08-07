"use client";

import * as React from 'react';
import { motion, PanInfo } from 'framer-motion';

export interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: string;
  position: 'front' | 'middle' | 'back';
  id: number;
  author: string;
  image?: string;
  role?: string;
}

export function TestimonialCard({
  handleShuffle,
  testimonial,
  position,
  id,
  author,
  image,
  role,
}: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === 'front';

  const handleDragStart = (_: unknown, info: PanInfo) => {
    dragRef.current = info.point.x;
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (dragRef.current - info.point.x > 150) {
      handleShuffle();
    }
    dragRef.current = 0;
  };

  return (
    <motion.div
      style={{
        zIndex: position === 'front' ? 2 : position === 'middle' ? 1 : 0,
      }}
      animate={{
        rotate: position === 'front' ? '-6deg' : position === 'middle' ? '0deg' : '6deg',
        x: position === 'front' ? '0%' : position === 'middle' ? '33%' : '66%',
      }}
      drag
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[360px] w-[280px] sm:h-[450px] sm:w-[350px] select-none place-content-center space-y-5 sm:space-y-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xl overflow-hidden ${
        isFront ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <img
        src={image || `https://i.pravatar.cc/128?img=${id}`}
        alt={`Avatar of ${author}`}
        loading="lazy"
        decoding="async"
        className="pointer-events-none mx-auto h-24 w-24 sm:h-32 sm:w-32 rounded-full border-2 border-[var(--border)] bg-[var(--bg-hover)] object-cover"
      />
      <span className="text-center text-base sm:text-lg italic text-[var(--text-muted)] line-clamp-6">
        &ldquo;{testimonial}&rdquo;
      </span>
      <div className="text-center">
        <span className="block text-sm font-medium text-[var(--primary)]">{author}</span>
        {role && <span className="block text-xs text-[var(--text-muted)]">{role}</span>}
      </div>
    </motion.div>
  );
}
