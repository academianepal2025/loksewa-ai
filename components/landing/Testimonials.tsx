'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Ramesh Adhikari",
    category: "Nayab Subba aspirant",
    location: "Kathmandu",
    quote: "Loksewa AI ko study plan le mero preparation completely change garyo. Syllabus upload garesi automatically prioritize garidincha which topics are important. Loksewa Guru chatbot le jati pani questions sodhxu sabai answer diyो mero notes bata nai. Highly recommend!",
    initials: "RA"
  },
  {
    name: "Sunita Thapa",
    category: "Section Officer aspirant",
    location: "Pokhara",
    quote: "The AI generated notes are incredibly detailed and exam focused. Every note follows the exact format needed for PSC preparation with key facts highlighted and previous year question patterns included. I cleared my Section Officer written exam in my first attempt after using this platform for just 6 weeks.",
    initials: "ST"
  },
  {
    name: "Bikash Sharma",
    category: "Kharidar aspirant",
    location: "Butwal",
    quote: "Free ma try gareko thiyo, ekdam useful lagyo. Pro plan liyesi unlimited notes generate garna paincha. Constitution ko notes aile samma ko best notes ho mero lagi. Gap analysis feature le exactly show garcha kasto topics ma thulo gap cha mero preparation ma.",
    initials: "BS"
  },
  {
    name: "Priya Maharjan",
    category: "Engineering gazetted",
    location: "Lalitpur",
    quote: "As someone preparing for a technical PSC exam, I was worried if this platform would work for my specific syllabus. But the AI perfectly analyzed my engineering syllabus and created a study plan that covers every topic systematically. The quiz generation from my own notes is brilliant.",
    initials: "PM"
  },
  {
    name: "Dipendra KC",
    category: "Nayab Subba aspirant",
    location: "Dharan",
    quote: "Loksewa Guru is like having a personal tutor available 24 hours. I ask questions late at night and it answers perfectly from my own uploaded notes. The weekly feedback report is very specific — it tells me exactly which topics I am weak in and what to focus on next week.",
    initials: "DK"
  },
  {
    name: "Anita Rai",
    category: "Health officer aspirant",
    location: "Biratnagar",
    quote: "Maine pahile coaching institute ma NPR 15000 tireko thiyo but Loksewa AI le NPR 499 ma coaching institute bhanda धेरai better experience dincha. Study plan, notes, quizzes, chat — everything in one place. Mero exam 45 days baaki cha and I feel fully prepared now.",
    initials: "AR"
  }
];

const stats = [
  "10,000+ aspirants preparing",
  "95% satisfaction rate",
  "50,000+ notes generated",
  "200,000+ quiz questions answered",
  "Available 24 hours 7 days",
  "Supports Nepali and English"
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const autoPlayRef = useRef<(() => void) | null>(null);

  const handleNext = () => {
    if (exitingIndex !== null) return;
    setDirection("next");
    setExitingIndex(activeIndex);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
      setExitingIndex(null);
    }, 600);
  };

  const handlePrev = () => {
    if (exitingIndex !== null) return;
    setDirection("prev");
    setExitingIndex(activeIndex);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setExitingIndex(null);
    }, 600);
  };

  // Keep auto-play function reference updated
  useEffect(() => {
    autoPlayRef.current = handleNext;
  });

  // Autoplay effect
  useEffect(() => {
    const play = () => {
      if (autoPlayRef.current) autoPlayRef.current();
    };
    const interval = setInterval(play, 6000); // 6 seconds auto-rotate
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-[#1e3a5f] relative inline-block tracking-tight">
            What Our Students Say
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-[#c9a84c] rounded-full"></span>
          </h2>
          <p className="mt-8 text-gray-500 max-w-2xl mx-auto font-medium text-lg">
            Join thousands of Loksewa aspirants who are preparing smarter with AI.
          </p>
        </div>

        {/* Stack Carousel Container */}
        <div className="relative w-full max-w-2xl h-[420px] md:h-[360px] mx-auto flex items-center justify-center select-none overflow-visible px-4">
          
          {/* Dynamic Background Glow */}
          <div className="absolute w-80 h-80 bg-[#1e3a5f]/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>

          <div className="relative w-full h-[320px] md:h-[280px]">
            {testimonials.map((t, idx) => {
              let offset = (idx - activeIndex + testimonials.length) % testimonials.length;
              const isExiting = idx === exitingIndex;

              let inlineStyle: React.CSSProperties = {};

              if (isExiting) {
                // Card slides out depending on direction
                const translateX = direction === "next" ? "-150%" : "150%";
                const rotate = direction === "next" ? "-15deg" : "15deg";
                inlineStyle = {
                  transform: `translateX(${translateX}) rotate(${rotate}) scale(0.85)`,
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
                // Adjust offsets for items behind the exiting item
                if (exitingIndex !== null) {
                  offset = (idx - ((activeIndex + 1) % testimonials.length) + testimonials.length) % testimonials.length;
                }

                // Stacking calculations
                const zIndex = 30 - offset * 10;
                const translateY = -offset * 14; 
                const translateX = offset * 14;
                const scale = 1 - offset * 0.05;
                const rotate = offset * 1.5;
                const opacity = 1 - offset * 0.25;

                inlineStyle = {
                  transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                  opacity: Math.max(0, opacity),
                  zIndex: zIndex,
                };
              }

              return (
                <div
                  key={t.name}
                  className="absolute inset-0 transition-all duration-700 ease-out"
                  style={inlineStyle}
                >
                  <div className="w-full h-full bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(30,58,95,0.08)] border border-gray-100 hover:border-[#c9a84c]/20 transition-colors duration-300 flex flex-col justify-between relative group">
                    {/* Giant background quote icon */}
                    <Quote className="absolute top-6 right-8 h-20 w-20 text-gray-50/70 group-hover:text-gray-100/80 transition-colors pointer-events-none -z-0" />

                    <div className="relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating Stars */}
                        <div className="flex mb-4 gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-4 w-4 text-[#c9a84c] fill-[#c9a84c]" />
                          ))}
                        </div>
                        {/* Quote Text */}
                        <p className="text-gray-600 mb-6 italic leading-relaxed text-sm md:text-base font-medium">
                          "{t.quote}"
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-50 mt-auto">
                        <div className="h-12 w-12 rounded-full bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 flex items-center justify-center text-[#1e3a5f] font-black shrink-0">
                          {t.initials}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-black text-[#1e3a5f] text-sm md:text-base truncate">{t.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 bg-[#1e3a5f]/5 text-[#1e3a5f] text-[9px] font-black uppercase tracking-wider rounded-full border border-[#1e3a5f]/10 truncate max-w-[150px] md:max-w-none">
                              {t.category}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider shrink-0">{t.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation and Indicators */}
        <div className="flex flex-col items-center gap-6 mt-10 relative z-20">
          {/* Arrow Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={exitingIndex !== null}
              className="h-12 w-12 rounded-full bg-[#1e3a5f]/5 hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white border border-[#1e3a5f]/10 transition-all flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-slate-100"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={exitingIndex !== null}
              className="h-12 w-12 rounded-full bg-[#1e3a5f]/5 hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white border border-[#1e3a5f]/10 transition-all flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-slate-100"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (exitingIndex !== null || i === activeIndex) return;
                  setDirection(i > activeIndex ? "next" : "prev");
                  setExitingIndex(activeIndex);
                  setTimeout(() => {
                    setActiveIndex(i);
                    setExitingIndex(null);
                  }, 600);
                }}
                className={`h-2 transition-all duration-300 rounded-full ${
                  i === activeIndex 
                    ? "w-8 bg-[#c9a84c]" 
                    : "w-2 bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/30"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Animated Ticker */}
      <div className="bg-[#1e3a5f] py-6 relative overflow-hidden mt-16">
        <div className="flex animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
          {[1, 2].map((loop) => (
            <div key={loop} className="flex items-center gap-12 px-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#c9a84c]"></div>
                  <span className="text-white font-bold tracking-wide uppercase text-xs sm:text-sm">
                    {stat}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
