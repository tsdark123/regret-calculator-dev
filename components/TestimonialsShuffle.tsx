"use client";

import * as React from 'react';
import { TestimonialCard } from '@/components/ui/testimonial-cards';

interface Testimonial {
  id: number;
  testimonial: string;
  author: string;
  role: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    testimonial: "I had $340/month in forgotten subscriptions. The calculator showed me that's over $660k in missed S&P 500 returns over 25 years.",
    author: 'Jordan M.',
    role: 'Software Engineer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces',
  },
  {
    id: 2,
    testimonial: 'Ran my chai and snack habit through it. Seeing 30 years of compound growth visualized was the financial wake-up call I needed at 23.',
    author: 'Priya S.',
    role: 'Product Designer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces',
  },
  {
    id: 3,
    testimonial: 'The stock comparison feature is the star. Benchmarking my Starbucks habit against QQQ makes the opportunity cost viscerally real.',
    author: 'Marcus T.',
    role: 'Investment Analyst',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces',
  },
];

export function TestimonialsShuffle() {
  const [positions, setPositions] = React.useState(['front', 'middle', 'back']);

  const handleShuffle = React.useCallback(() => {
    setPositions((prev) => {
      const next = [...prev];
      next.unshift(next.pop() as string);
      return next;
    });
  }, []);

  // Auto-cycle every 4 seconds; resets if the user drags
  React.useEffect(() => {
    const id = setTimeout(handleShuffle, 4000);
    return () => clearTimeout(id);
  }, [positions, handleShuffle]);

  return (
    <div className="grid place-content-center overflow-hidden w-full h-[400px] sm:h-[500px]">
      <div className="relative h-[360px] w-[280px] sm:h-[450px] sm:w-[350px] -ml-12 sm:-ml-20">
        {testimonials.map((item, index) => (
          <React.Fragment key={item.id}>
            <TestimonialCard
              id={item.id}
              testimonial={item.testimonial}
              author={item.author}
              role={item.role}
              image={item.image}
              handleShuffle={handleShuffle}
              position={positions[index] as 'front' | 'middle' | 'back'}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
