"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const screenshots = [
  {
    src: "/screenshot-1.jpg",
    alt: "Loksewa Flashcards study topics screen",
  },
  {
    src: "/screenshot-2.jpg",
    alt: "Loksewa Flashcards welcome screen",
  },
  {
    src: "/screenshot-3.jpg",
    alt: "Loksewa Flashcards daily study companion screen",
  },
  {
    src: "/screenshot-4.jpg",
    alt: "Loksewa Flashcards smart cards active recall screen",
  },
];

export function CompanionAppScreenshots() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setExitingIndex(activeIndex);
      // Wait for exit animation to complete before changing active index
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % screenshots.length);
        setExitingIndex(null);
      }, 600); // Match transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleCardClick = (idx: number) => {
    if (exitingIndex !== null) return;
    if (idx === activeIndex) {
      // If clicking the front card, cycle to the next
      setExitingIndex(activeIndex);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % screenshots.length);
        setExitingIndex(null);
      }, 600);
    } else {
      // Bring the clicked background card to front
      setExitingIndex(activeIndex);
      setTimeout(() => {
        setActiveIndex(idx);
        setExitingIndex(null);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-full h-[520px] flex items-center justify-center overflow-visible">
        {/* Dynamic Background Glow */}
        <div className="absolute w-72 h-72 bg-[#c9a84c]/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>

        <div className="relative w-[280px] h-[500px] md:w-[300px] md:h-[530px]">
          {screenshots.map((shot, idx) => {
            // Calculate relative position from activeIndex
            let offset = (idx - activeIndex + screenshots.length) % screenshots.length;
            const isExiting = idx === exitingIndex;

            // If someone is exiting, we treat them specially
            let inlineStyle: React.CSSProperties = {};

            if (isExiting) {
              // Card slides out to the left, rotates, and fades out
              inlineStyle = {
                transform: "translateX(-150%) rotate(-15deg) scale(0.85)",
                opacity: 0,
                zIndex: 50,
              };
            } else if (idx === activeIndex && exitingIndex === null) {
              // Front Card
              inlineStyle = {
                transform: "translateX(0px) translateY(0px) rotate(0deg) scale(1)",
                opacity: 1,
                zIndex: 40,
              };
            } else {
              // Adjust offset for cards behind when one is exiting
              if (exitingIndex !== null) {
                offset = (idx - ((activeIndex + 1) % screenshots.length) + screenshots.length) % screenshots.length;
              }

              // Cards in the stack
              const zIndex = 30 - offset * 10;
              const translateY = -offset * 16; // Stack going upwards
              const translateX = offset * 16;  // Stack going rightwards
              const scale = 1 - offset * 0.06;
              const rotate = offset * 2.5;     // Slight tilt
              const opacity = 1 - offset * 0.25;

              inlineStyle = {
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                opacity: Math.max(0, opacity),
                zIndex: zIndex,
              };
            }

            return (
              <div
                key={shot.src}
                className="absolute inset-0 transition-all duration-700 ease-out cursor-pointer"
                style={inlineStyle}
                onClick={() => handleCardClick(idx)}
              >
                {/* Phone Frame Mockup */}
                <div className="w-full h-full bg-slate-950 p-[10px] rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(30,58,95,0.25)] border-[5px] border-slate-900 relative overflow-hidden group hover:border-[#c9a84c]/40 transition-colors duration-300">
                  {/* Phone Speaker Notch / Dynamic Island */}
                  <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30"></div>
                  
                  {/* Screen Container */}
                  <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-white relative">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(max-width: 768px) 280px, 300px"
                      className="object-cover"
                      priority={idx === 0}
                    />
                    {/* Subtle inner glass shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/5 pointer-events-none z-20"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2.5 mt-8 relative z-20">
        {screenshots.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (exitingIndex !== null || i === activeIndex) return;
              setExitingIndex(activeIndex);
              setTimeout(() => {
                setActiveIndex(i);
                setExitingIndex(null);
              }, 600);
            }}
            className={`h-2 transition-all duration-300 rounded-full ${
              i === activeIndex 
                ? "w-8 bg-[#c9a84c]" 
                : "w-2 bg-[#1e3a5f]/15 hover:bg-[#1e3a5f]/30"
            }`}
            aria-label={`Go to screenshot ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
