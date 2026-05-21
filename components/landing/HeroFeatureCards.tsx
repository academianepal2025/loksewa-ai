"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, MessageSquareCode, FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

const features = [
  {
    id: 1,
    title: "AI Study Plans",
    tagline: "Syllabus-based structured planning",
    colorClass: "border-indigo-100",
    badge: "Personalized Roadmap",
    icon: GraduationCap,
    iconColor: "text-[#1e3a5f] bg-indigo-50",
    content: (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#c9a84c] animate-pulse"></div>
            <div>
              <p className="text-xs font-black text-[#1e3a5f] uppercase tracking-wide">Current Goal</p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">Constitution of Nepal - Part 3</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100">80% Done</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
            <span>Syllabus Progress</span>
            <span>24 / 30 Topics Complete</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#c9a84c] rounded-full" style={{ width: "80%" }}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Next Topic</span>
            <span className="text-xs font-bold text-[#1e3a5f] mt-1.5 truncate">Geography of Nepal</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Daily Limit</span>
            <span className="text-xs font-bold text-[#1e3a5f] mt-1.5">3 Study Sessions</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Loksewa Guru",
    tagline: "24/7 AI tutor specialized in PSC syllabus",
    colorClass: "border-[#c9a84c]/20",
    badge: "Smart AI Assistant",
    icon: MessageSquareCode,
    iconColor: "text-[#c9a84c] bg-[#c9a84c]/10",
    content: (
      <div className="space-y-4">
        {/* Chat bubble 1 */}
        <div className="flex items-start gap-2.5 max-w-[85%] self-end ml-auto">
          <div className="bg-[#1e3a5f] text-white p-3 rounded-2xl rounded-tr-sm text-xs font-medium leading-relaxed shadow-sm">
            National Assembly ko composition kasto hunchha?
          </div>
        </div>
        {/* Chat bubble 2 */}
        <div className="flex items-start gap-2.5 max-w-[90%]">
          <div className="h-7 w-7 rounded-lg bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] shrink-0 border border-[#c9a84c]/20 font-black text-xs">
            G
          </div>
          <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl rounded-tl-sm text-xs text-gray-600 leading-relaxed font-medium shadow-sm">
            <p className="font-bold text-[#1e3a5f] mb-1">Loksewa Guru:</p>
            Article 86 anusar National Assembly ma total <span className="font-black text-[#1e3a5f]">59 members</span> hunchhan. Jas madhye 56 members state assembly ra local levels ko voters bata elect hunchhan (8 from each province) ra 3 members President le nominate garne chhan.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Smart Practice",
    tagline: "AI-generated mock tests & instant feedback",
    colorClass: "border-emerald-100",
    badge: "Mock Tests & Quizzes",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 bg-emerald-50",
    content: (
      <div className="space-y-3.5">
        <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
          <p className="text-xs font-black text-[#1e3a5f] leading-snug">Q: Nepal ko current Constitution kahile promulgate bhayeko ho?</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              <span>A) 2072 Ashwin 3</span>
              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md">Correct</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl text-xs font-bold">
              <span>B) 2072 Ashwin 25</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 px-1">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
            Answer Evaluation: 100% Accurate
          </span>
          <span className="text-gray-400 font-medium">Time spent: 14s</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Smart Notes",
    tagline: "Auto-summarized PSC study notes",
    colorClass: "border-indigo-100",
    badge: "Instant Summary",
    icon: FileText,
    iconColor: "text-[#1e3a5f] bg-indigo-50",
    content: (
      <div className="space-y-3.5">
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
          <div className="bg-[#1e3a5f] p-3 text-white flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase">Topic: Local Government Operation Act</span>
            <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-md uppercase">GK / Legal</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <h5 className="text-xs font-black text-[#1e3a5f]">Key Highlights:</h5>
              <ul className="text-[11px] text-gray-500 font-bold space-y-1 pl-3 list-disc">
                <li>Passed by parliament in 2074.</li>
                <li>Defines functions, duties, and rights of municipalities and rural municipalities.</li>
                <li>Clasifies local authorities into metropolitan, sub-metropolitan, municipality, and rural municipality.</li>
              </ul>
            </div>
            <div className="h-px bg-gray-100"></div>
            <p className="text-[10px] text-gray-400 font-medium italic">High probability question trends detected for Section Officer exam.</p>
          </div>
        </div>
      </div>
    ),
  },
];

export function HeroFeatureCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setExitingIndex(activeIndex);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % features.length);
        setExitingIndex(null);
      }, 600);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="relative w-full h-[400px] md:h-[450px] flex flex-col items-center justify-center overflow-visible">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-[#c9a84c]/20 rounded-full blur-[100px] -z-20"></div>
      <div className="absolute -bottom-16 -left-16 h-60 w-60 bg-[#1e3a5f]/10 rounded-full blur-[100px] -z-20"></div>

      {/* Main Stack */}
      <div className="relative w-full max-w-[380px] h-[340px] md:max-w-[420px] md:h-[370px] px-4">
        {features.map((feature, idx) => {
          let offset = (idx - activeIndex + features.length) % features.length;
          const isExiting = idx === exitingIndex;

          let inlineStyle: React.CSSProperties = {};

          if (isExiting) {
            inlineStyle = {
              transform: "translateX(-150%) rotate(-15deg) scale(0.85)",
              opacity: 0,
              zIndex: 50,
            };
          } else if (idx === activeIndex && exitingIndex === null) {
            inlineStyle = {
              transform: "translateX(0px) translateY(0px) rotate(0deg) scale(1)",
              opacity: 1,
              zIndex: 40,
            };
          } else {
            if (exitingIndex !== null) {
              offset = (idx - ((activeIndex + 1) % features.length) + features.length) % features.length;
            }

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

          const FeatureIcon = feature.icon;

          return (
            <div
              key={feature.id}
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={inlineStyle}
            >
              <div className={`w-full h-full bg-white p-6 rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(30,58,95,0.12)] border ${feature.colorClass} flex flex-col justify-between group`}>
                
                {/* Header of Mockup Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${feature.iconColor} shadow-sm shrink-0`}>
                      <FeatureIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1e3a5f]">{feature.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{feature.tagline}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#1e3a5f] bg-[#c9a84c]/20 border border-[#c9a84c]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {feature.badge}
                  </span>
                </div>

                {/* Inner Mockup UI */}
                <div className="my-5 flex-1 bg-white rounded-2xl relative overflow-hidden">
                  {feature.content}
                </div>

                {/* Footer bar */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] font-black text-[#1e3a5f] uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Live System Demo
                  </span>
                  <span className="text-gray-400 flex items-center gap-0.5 hover:text-[#c9a84c] transition-colors cursor-pointer">
                    Get Started
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs / Slide Indicators below */}
      <div className="flex gap-2.5 mt-8">
        {features.map((feature, i) => (
          <button
            key={feature.id}
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
            aria-label={`Go to feature ${feature.title}`}
          />
        ))}
      </div>
    </div>
  );
}
