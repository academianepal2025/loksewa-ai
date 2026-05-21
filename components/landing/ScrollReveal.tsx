"use client";

import React, { createContext, useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  scaleOffset?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  yOffset = 40,
  xOffset = 0,
  scaleOffset = 1,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: yOffset,
        x: xOffset,
        scale: scaleOffset,
      }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : yOffset,
        x: isInView ? 0 : xOffset,
        scale: isInView ? 1 : scaleOffset,
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Premium custom cubic-bezier (easeOutExpo)
      }}
    >
      {children}
    </motion.div>
  );
}

const StaggerContext = createContext({ index: 0, staggerDelay: 0.1 });

export function StaggerContainer({
  children,
  staggerDelay = 0.12,
  className = "",
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <StaggerContext.Provider value={{ index: idx, staggerDelay }}>
            {child}
          </StaggerContext.Provider>
        );
      })}
    </div>
  );
}

export function StaggerItem({
  children,
  className = "",
  yOffset = 40,
}: {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}) {
  const { index, staggerDelay } = useContext(StaggerContext);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : yOffset }}
      transition={{
        duration: 0.8,
        delay: index * staggerDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
