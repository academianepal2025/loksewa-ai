'use client';

import { useState } from 'react';
import { Plus, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FAQItem {
  question: string;
  rawAnswer: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What is Loksewa AI and how is it different from other preparation apps?",
    rawAnswer: "Loksewa AI is Nepal's first AI-powered PSC exam preparation platform that works with your own study materials. Unlike generic apps, it creates a personalized study plan and generates smart notes.",
    answer: (
      <span>
        Loksewa AI is Nepal's first AI-powered PSC exam preparation platform that works with your own study materials. Unlike generic apps or YouTube channels, Loksewa AI analyzes your specific syllabus, creates a personalized day-by-day study plan based on your exam date, and generates notes and quizzes from the documents you upload. Read our <Link href="/blog/how-to-use-loksewa-ai" className="text-indigo-600 hover:underline font-semibold">Ultimate Mastery Guide</Link> to learn how to get the most out of our features.
      </span>
    )
  },
  {
    question: "I have already bought printed notes. Can I still use Loksewa AI?",
    rawAnswer: "Absolutely yes. Photograph your printed notes or scan them as a PDF and upload them to the platform. Loksewa AI will process your existing notes and make them interactive.",
    answer: (
      <span>
        Absolutely yes. In fact, that is exactly how Loksewa AI is designed to be used. Simply photograph your printed notes or scan them as a PDF and upload them to the platform. Loksewa AI will process your existing notes and make them interactive — you can chat with them, generate quizzes from them, and get AI-generated summaries. You can <Link href="/auth/signup" className="text-indigo-600 hover:underline font-semibold">sign up for free</Link> to test it with your files.
      </span>
    )
  },
  {
    question: "Does Loksewa AI support Nepali language?",
    rawAnswer: "Yes. Loksewa Guru can understand and respond in both Nepali and English. You can ask questions in Nepali and receive answers in Nepali. It understands the Nepal administrative context and Constitution 2072.",
    answer: (
      <span>
        Yes. Loksewa Guru can understand and respond in both Nepali and English. You can ask questions in Nepali and receive answers in Nepali. You can upload study materials in Nepali script and the AI will process them. The platform is designed specifically for Nepal PSC aspirants and understands the Nepal administrative context, Constitution 2072, and Nepali governance structure. Check out our <Link href="/blog/how-to-prepare-loksewa-with-ai" className="text-indigo-600 hover:underline font-semibold">AI Preparation Guide</Link> for tips on writing subjective answers in Nepali.
      </span>
    )
  },
  {
    question: "Which PSC exam categories does Loksewa AI support?",
    rawAnswer: "Loksewa AI supports all PSC exam categories including Kharidar, Nayab Subba, Section Officer, Technical gazetted positions, Teaching service exams, and all other Loksewa Ayog examinations.",
    answer: (
      <span>
        Loksewa AI supports all PSC exam categories including Kharidar, Nayab Subba, Section Officer, Sakha Adhikrit, Technical gazetted positions in Engineering, Health, and Agriculture, Teaching service exams, and all other Loksewa Ayog examination categories. Simply <Link href="/auth/signup" className="text-indigo-600 hover:underline font-semibold">create a free account</Link> and upload your specific syllabus to initialize.
      </span>
    )
  },
  {
    question: "How does the payment work? Is it safe?",
    rawAnswer: "Payment is done through Nepal's trusted digital payment systems including eSewa, Khalti, IME Pay, or Nepali bank QR code. Our team verifies your payment screenshot and activates your plan within 24 hours.",
    answer: (
      <span>
        Payment is done through Nepal's trusted digital payment systems including eSewa, Khalti, IME Pay, or any Nepali bank QR code. After making payment you upload a screenshot of your successful payment confirmation in the app along with your name and phone number. Our team verifies your payment and activates your plan within 24 hours. We never collect bank credentials or card details.
      </span>
    )
  },
  {
    question: "What happens to my data and uploaded documents?",
    rawAnswer: "Your uploaded documents and study materials are stored securely and privately. Only you can access your own files. We never share your documents with other users or third parties.",
    answer: (
      <span>
        Your uploaded documents and study materials are stored securely and privately. Only you can access your own files. We never share your documents with other users or third parties. Your data is stored using industry-standard encrypted cloud storage. You can delete your account and all associated data permanently at any time.
      </span>
    )
  },
  {
    question: "Can I use Loksewa AI on my phone?",
    rawAnswer: "Yes. Loksewa AI is fully optimized for mobile use and works on all smartphones and tablets. You can also install it on your home screen as an app.",
    answer: (
      <span>
        Yes. Loksewa AI is fully optimized for mobile use and works on all smartphones and tablets. You can install it on your Android or iOS home screen as an app by tapping Add to Home Screen in your browser.
      </span>
    )
  },
  {
    question: "How is the study plan generated? Is it really personalized?",
    rawAnswer: "Yes. When you upload your syllabus, the AI analyzes every topic, assigns priority scores, and builds a day-by-day plan using your exam date and daily study hours.",
    answer: (
      <span>
        Yes, it is genuinely personalized to you. When you upload your syllabus, the AI analyzes every topic, assigns priority scores based on how important each topic is for PSC exams, estimates how many hours each topic needs, and then builds a day-by-day plan using your exam date and how many hours you can study daily.
      </span>
    )
  },
  {
    question: "Is my subscription automatically renewed?",
    rawAnswer: "No. Loksewa AI does not use automatic subscription renewal. Your plan is active for the period you paid for and then returns to the free tier.",
    answer: (
      <span>
        No. Loksewa AI does not use automatic subscription renewal. Your plan is active for the period you paid for and then returns to the free tier. To continue with a paid plan, you simply make a new payment and submit the confirmation screenshot. This means you are always in complete control of your spending.
      </span>
    )
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.rawAnswer
      }
    }))
  };

  return (
    <section id="faq" className="py-20 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
                      <div className="text-gray-600 leading-relaxed text-sm font-medium">
                        {faq.answer}
                      </div>
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
