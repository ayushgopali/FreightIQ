import React from "react";
import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const MaskedLine = ({ children, delay = 0, className = "" }) => (
  <span className={`mask-line ${className}`}>
    <motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

export const SectionHead = ({ index, eyebrow, title, sub }) => (
  <div className="mb-12 md:mb-16">
    <Reveal>
      <p className="mono-label mb-4">
        <span className="text-radar">{index}</span>{" "}
        <span className="mx-2 text-ink-600">/</span> {eyebrow}
      </p>
    </Reveal>
    <Reveal delay={0.08}>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] max-w-3xl">
        {title}
      </h2>
    </Reveal>
    {sub ? (
      <Reveal delay={0.16}>
        <p className="mt-5 max-w-2xl text-fog text-base leading-relaxed">{sub}</p>
      </Reveal>
    ) : null}
  </div>
);
