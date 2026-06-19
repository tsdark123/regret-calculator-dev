import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "I had $340/month in forgotten subscriptions. The calculator showed me that's over $660k in missed S&P 500 returns over 25 years. Cancelled everything that same night.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Jordan M.",
    role: "Software Engineer",
  },
  {
    text: "Ran my chai and snack habit through it. Seeing 30 years of compound growth visualized was the financial wake-up call I needed at 23. Sent it to every friend immediately.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Priya S.",
    role: "Product Designer",
  },
  {
    text: "The stock comparison feature is the star. Benchmarking my Starbucks habit against QQQ makes the opportunity cost viscerally real — not just abstract math.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    name: "Marcus T.",
    role: "Investment Analyst",
  },
  {
    text: "I teach accounting at a university in São Paulo. I now start every personal finance lecture with this tool. It's more convincing than any textbook chapter on compounding.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    name: "Sofia R.",
    role: "Accounting Professor",
  },
  {
    text: "I've tried six compound interest calculators. This is the only one I finished. Clean UI, honest numbers, and the results hit you right in the gut.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    name: "Kenji A.",
    role: "Data Scientist",
  },
  {
    text: "Made my investment team run their personal habits through this before our Q3 planning session. The conversation around opportunity cost completely shifted.",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    name: "Aaliya H.",
    role: "Portfolio Manager",
  },
  {
    text: "Monthly ritual now: run last month's 'wants' through the regret calc before setting next month's budget. It's the accountability loop I never knew I needed.",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    name: "Noah B.",
    role: "Marketing Director",
  },
  {
    text: "My husband and I modeled our dining-out habit ($280/mo) against Microsoft over 30 years. We switched to meal prep that week. Haven't looked back.",
    image: "https://randomuser.me/api/portraits/women/17.jpg",
    name: "Chiara F.",
    role: "Operations Lead",
  },
  {
    text: "Modeling my rideshare budget against NVIDIA over 10 years was humbling. No other calculator lets you compare against real historical stock CAGR. Genuinely unique.",
    image: "https://randomuser.me/api/portraits/men/59.jpg",
    name: "Ethan C.",
    role: "Tech Entrepreneur",
  },
  {
    text: "The 78-asset catalog with transparent CAGR sourcing is what sets this apart from hobby tools. This is serious financial education. I recommend it to every client.",
    image: "https://randomuser.me/api/portraits/women/36.jpg",
    name: "Leila K.",
    role: "Financial Advisor",
  },
  {
    text: "I cover personal finance on YouTube with 200k subscribers. This is the one external tool I mention in every video. The clean export and real return data seal the deal.",
    image: "https://randomuser.me/api/portraits/men/83.jpg",
    name: "Dante W.",
    role: "Finance Content Creator",
  },
  {
    text: "My rideshare bill was $220/month. The calc showed $430k in 30-year Amazon-equivalent returns. I bought a bike three days later and hit my first $5k in savings six months after.",
    image: "https://randomuser.me/api/portraits/women/72.jpg",
    name: "Yuki N.",
    role: "Software Developer",
  },
];

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-10 rounded-3xl border border-[var(--border)] shadow-lg shadow-[var(--primary)]/10 max-w-xs w-full bg-[var(--bg-card)]" key={i}>
                  <div className="text-sm text-[var(--text-muted)] leading-relaxed">{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5 text-[var(--text-main)]">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight text-[var(--text-muted)]">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const firstColumn = TESTIMONIALS.slice(0, 4);
const secondColumn = TESTIMONIALS.slice(4, 8);
const thirdColumn = TESTIMONIALS.slice(8, 12);

export const TestimonialsSection: React.FC = () => (
  <section className="hidden md:block w-full py-12 select-none">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
      >
        <div className="flex justify-center">
          <div className="border border-[var(--border)] py-1 px-4 rounded-lg text-xs text-[var(--text-muted)]">Testimonials</div>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-[var(--text-main)]">
          What our users say
        </h2>
        <p className="text-center mt-5 opacity-75 text-[var(--text-muted)]">
          See how we're bringing smarter spending awareness worldwide.
        </p>
      </motion.div>

      <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[540px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={15} />
        <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
        <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
      </div>
    </div>
  </section>
);
