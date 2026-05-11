'use client';

import { useState } from 'react';
import { Plus, X, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What is Loksewa AI and how is it different from other preparation apps?",
    answer: "Loksewa AI is Nepal's first AI powered PSC exam preparation platform that works with your own study materials. Unlike generic apps or YouTube channels, Loksewa AI analyzes your specific syllabus, creates a personalized day by day study plan based on your exam date, and generates notes and quizzes from the documents you upload. The Loksewa Guru chatbot answers questions specifically from your own notes — not generic internet content. It is like having a personal tutor who has read all your study materials and is available 24 hours a day."
  },
  {
    question: "I have already bought printed notes. Can I still use Loksewa AI?",
    answer: "Absolutely yes. In fact that is exactly how Loksewa AI is designed to be used. Simply photograph your printed notes or scan them as a PDF and upload them to the platform. Loksewa AI will process your existing notes and make them interactive — you can chat with them, generate quizzes from them, create flashcards, and get AI generated summaries. Your existing investment in study materials becomes even more powerful with Loksewa AI on top."
  },
  {
    question: "Does Loksewa AI support Nepali language?",
    answer: "Yes. Loksewa Guru can understand and respond in both Nepali and English. You can ask questions in Nepali and receive answers in Nepali. You can upload study materials in Nepali script and the AI will process and understand them. The platform is designed specifically for Nepal PSC aspirants and understands the Nepal administrative context, Constitution 2072, and Nepali governance structure."
  },
  {
    question: "Which PSC exam categories does Loksewa AI support?",
    answer: "Loksewa AI supports all PSC exam categories including Kharidar, Nayab Subba, Section Officer, Sakha Adhikrit, Technical gazetted positions in Engineering and Health and Agriculture, Teaching service exams, and all other Loksewa Ayog examination categories. Simply upload your specific syllabus and the AI adapts entirely to your exam requirements."
  },
  {
    question: "How does the payment work? Is it safe?",
    answer: "Payment is done through Nepal's trusted digital payment systems including eSewa, Khalti, IME Pay, or any Nepali bank QR code. After making payment you upload a screenshot of your successful payment confirmation in the app along with your name and phone number. Our team verifies your payment and activates your plan within 24 hours. We never collect your bank credentials or card details — only the payment confirmation screenshot."
  },
  {
    question: "What happens to my data and uploaded documents?",
    answer: "Your uploaded documents and study materials are stored securely and privately. Only you can access your own files. We never share your documents with other users or third parties. Your data is stored using industry standard encrypted cloud storage. You can export all your data at any time from Settings and you can delete your account and all associated data permanently at any time. Read our full Privacy Policy in the Settings page for complete details."
  },
  {
    question: "Can I use Loksewa AI on my phone?",
    answer: "Yes. Loksewa AI is fully optimized for mobile use and works on all smartphones and tablets. You can also install it on your Android or iOS home screen as an app by tapping Add to Home Screen in your browser. The app works partially offline for already loaded content like your study plan and notes."
  },
  {
    question: "How is the study plan generated? Is it really personalized?",
    answer: "Yes it is genuinely personalized to you. When you upload your syllabus the AI analyzes every topic, assigns priority scores based on how important each topic is for PSC exams, estimates how many hours each topic needs, and then builds a day by day plan using your exam date and how many hours you can study daily. The plan automatically reserves the last 7 days for revision, includes rest days, and schedules revision sessions every 7 days. No two study plans are the same."
  },
  {
    question: "Is my subscription automatically renewed?",
    answer: "No. Loksewa AI does not use automatic subscription renewal. Your plan is active for the period you paid for and then returns to the free tier. To continue with a paid plan you simply make a new payment and submit the confirmation screenshot. This means you are always in complete control of your spending with no surprise charges."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Frequently Asked Questions</h2>
          <p className="mt-4 text-gray-600 font-medium">Everything you need to know about Loksewa AI.</p>
        </div>

        <div className="space-y-4 mb-20">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-all"
              >
                <span className="font-bold text-[#1e3a5f] pr-4 leading-relaxed">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  className={`flex-shrink-0 h-8 w-8 rounded-full ${openIndex === i ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/5 text-[#1e3a5f]'} flex items-center justify-center transition-colors`}
                >
                  <Plus className="h-5 w-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 bg-white">
                      <div className="h-px bg-gray-100 w-full mb-6"></div>
                      <p className="text-gray-600 leading-relaxed text-sm font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Still have questions block */}
        <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-[2.5rem] p-10 text-center">
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Still have questions?</h3>
          <p className="text-gray-500 mb-8 font-medium">We are here to help you ace your exams.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:loksewagkdose@gmail.com?subject=Loksewa AI Question"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#1e3a5f] text-white font-bold rounded-2xl hover:bg-[#1e3a5f]/90 transition-all shadow-lg shadow-[#1e3a5f]/20"
            >
              <Mail className="h-5 w-5" />
              Contact via Email
            </a>
            <a
              href="https://wa.me/9779808493504"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-bold rounded-2xl hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
