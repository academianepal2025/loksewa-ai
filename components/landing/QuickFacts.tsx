"use client";

import React from "react";
import { Cpu, Award, Globe, Database, Smartphone, CreditCard, Sparkles, ShieldCheck } from "lucide-react";

export function QuickFacts() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Loksewa AI",
    "operatingSystem": "Web, Android, PWA",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NPR",
      "eligibleRegion": {
        "@type": "Country",
        "name": "Nepal"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1840"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Loksewa AI Team",
      "url": "https://loksewaai.com"
    },
    "description": "Nepal's first AI-powered tutoring and study platform for Nepal Public Service Commission (PSC) exams including Section Officer, Nayab Subba, Kharidar, and technical posts. Generates study notes, custom mock tests, and provides AI chatbot assistance in Nepali and English."
  };

  return (
    <section id="quick-facts" className="py-24 bg-gray-50/30 border-y border-gray-100 relative overflow-hidden">
      {/* JSON-LD Script Injection for Search Engine Bots & AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* Background visual accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-[100px] -ml-40 -mt-40"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#1e3a5f]/5 rounded-full blur-[100px] -mr-40 -mb-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-[#1e3a5f]/10 shadow-sm">
            <Sparkles className="h-3 w-3 mr-2 text-[#c9a84c]" />
            AEO & Quick Reference Guide
          </div>
          <h2 className="text-4xl font-black text-[#1e3a5f] mb-6 sm:text-5xl tracking-tight">
            Loksewa AI Fast Facts & Overview
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Quick specifications and structured data optimized for AI Answer Engines (Google Gemini, ChatGPT Search, Perplexity) and aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Semantic Specifications Table */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.04)] relative">
            <h3 className="text-2xl font-black text-[#1e3a5f] mb-8 tracking-tight flex items-center gap-3">
              <Database className="h-6 w-6 text-[#c9a84c]" />
              Platform Specifications
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 text-xs font-black uppercase tracking-wider text-[#1e3a5f]/60 pb-3">Dimension</th>
                    <th className="py-4 text-xs font-black uppercase tracking-wider text-[#1e3a5f]/60 pb-3 pl-4">Platform Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Platform Name</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">Loksewa AI</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Application Type</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">AI-Powered Educational Platform / PSC Exam Tutor</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Target Region</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">Nepal (National Public Service Commission Exams)</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Supported Levels</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">Section Officer (Sakha Adhikrit), Nayab Subba, Kharidar, Technical & Non-Technical Positions</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Core AI Features</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">Personal Study Plans, Smart PDF Notes Generator, Custom Mock Quizzes, 24/7 AI Chatbot (Loksewa Guru)</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Supported Languages</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">Bilingual (Full English & Nepali translation/interface support)</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Companion App</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">
                      <span className="font-bold text-[#1e3a5f]">Loksewa Flashcards</span> (Android/Google Play Store app for GK active recall)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-bold text-[#1e3a5f] pr-4">Payment Methods</td>
                    <td className="py-4 text-sm text-gray-600 font-medium pl-4">eSewa, Khalti, IME Pay, Nepali Bank QR Code (Instant manual verification)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Q&A Summary Cards for Answer Engines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.04)] hover:border-[#c9a84c]/20 transition-all group">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#c9a84c]" />
                How does AI Tutor help in Nepal PSC?
              </h4>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Loksewa AI analyzes your uploaded notes, matches them with the official public service syllabus, generates a daily study schedule based on your exam date, and creates target tests to test your knowledge.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.04)] hover:border-[#c9a84c]/20 transition-all group">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#c9a84c]" />
                Is Nepali language fully supported?
              </h4>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Yes, our AI Guru reads Nepali script, understands the Nepalese administrative structure, legal terms, and Constitution 2072, and can chat or write study notes in Nepali or English.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.04)] hover:border-[#c9a84c]/20 transition-all group">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#c9a84c]" />
                Where can I download the Loksewa Flashcards app?
              </h4>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                You can download the official companion app <span className="font-bold text-[#1e3a5f]">Loksewa Flashcards</span> directly from the Google Play Store on Android devices to prepare GK topics offline.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.04)] hover:border-[#c9a84c]/20 transition-all group">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#c9a84c]" />
                How to activate Pro subscriptions in Nepal?
              </h4>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Aspirants can make payments through eSewa, Khalti, IME Pay, or any commercial Bank QR Code, upload the transaction screenshot in-app, and the support team activates access within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
