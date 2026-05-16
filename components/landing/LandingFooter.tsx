'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, X } from 'lucide-react';
import { PRIVACY_POLICY, TERMS_OF_USE } from '@/lib/legal-data';

export function LandingFooter() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="bg-background border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="h-10 w-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-[#c9a84c]" />
                   </div>
                   <span className="text-2xl font-black text-[#1e3a5f]">Loksewa AI</span>
                </div>
                <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                   Empowering the next generation of civil servants in Nepal with advanced artificial intelligence. Preparation simplified, success amplified.
                </p>
             </div>
             <div>
                <h4 className="font-black text-[#1e3a5f] uppercase tracking-widest text-xs mb-6">Platform</h4>
                <ul className="space-y-4">
                   <li><Link href="#features" className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">Features</Link></li>
                   <li><Link href="#pricing" className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">Pricing</Link></li>
                   <li><Link href="#faq" className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">FAQ</Link></li>
                   <li><Link href="/blog" className="text-sm font-bold text-indigo-400 hover:text-[#1e3a5f] transition-all">Blog</Link></li>
                </ul>
             </div>
              <div>
                 <h4 className="font-black text-[#1e3a5f] uppercase tracking-widest text-xs mb-6">Company</h4>
                 <ul className="space-y-4">
                    <li><button onClick={() => setShowPrivacy(true)} className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">Privacy Policy</button></li>
                    <li><button onClick={() => setShowTerms(true)} className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">Terms of Use</button></li>
                    <li><Link href="mailto:loksewagkdose@gmail.com" className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-all">Contact Us</Link></li>
                 </ul>
              </div>
          </div>
          <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Loksewa AI. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
               <span className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">Made in Nepal</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] bg-[#1e3a5f]/40 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto relative border border-indigo-50" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPrivacy(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-[#1e3a5f]"><X className="h-6 w-6" /></button>
            <div className="mb-10">
              <span className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest block mb-2">Legal Information</span>
              <h3 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-tighter">Privacy Policy</h3>
              <p className="text-sm text-gray-400 font-bold mt-2">Last updated: {PRIVACY_POLICY.lastUpdated}</p>
            </div>
            <div className="space-y-8 pr-4">
              {PRIVACY_POLICY.sections.map((section, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest mb-3">{section.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-[#1e3a5f]/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto relative border border-indigo-50" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowTerms(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-[#1e3a5f]"><X className="h-6 w-6" /></button>
            <div className="mb-8">
              <span className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest block mb-2">Legal Information</span>
              <h3 className="text-2xl font-black text-[#1e3a5f] uppercase tracking-tighter">Terms of Use</h3>
            </div>
            <div className="space-y-6">
              <p className="text-gray-500 font-medium leading-relaxed">{TERMS_OF_USE.introduction}</p>
              <div className="space-y-5">
                {TERMS_OF_USE.points.map((point, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[#1e3a5f]">{i + 1}</div>
                    <div>
                      <h5 className="text-[11px] font-black text-[#1e3a5f] uppercase tracking-widest mb-1">{point.title}</h5>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{point.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
