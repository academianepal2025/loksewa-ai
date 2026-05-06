'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] relative inline-block">
            What Our Students Say
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#c9a84c] rounded-full"></span>
          </h2>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Join thousands of Loksewa aspirants who are preparing smarter with AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-[#c9a84c] border-t border-r border-b border-gray-100 transition-all duration-300"
            >
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 text-[#c9a84c] fill-[#c9a84c]" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 flex items-center justify-center text-[#1e3a5f] font-bold">
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-[#1e3a5f]">{t.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-[#1e3a5f]/5 text-[#1e3a5f] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#1e3a5f]/10">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{t.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Animated Ticker */}
      <div className="bg-[#1e3a5f] py-6 relative overflow-hidden">
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
