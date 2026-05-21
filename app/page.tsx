import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Globe, GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CompanionAppScreenshots } from "@/components/landing/CompanionAppScreenshots";
import { HeroFeatureCards } from "@/components/landing/HeroFeatureCards";
import { Metadata } from "next";



export const metadata: Metadata = {
  title: "Loksewa AI | Nepal's First AI Tutor for PSC Exam Preparation",
  description: "Prepare for Loksewa Ayog (Nepal PSC) exams with Loksewa AI. Generate smart study notes, take custom mock tests, and get real-time syllabus guidance from Loksewa Guru.",
  keywords: [
    "Loksewa", 
    "Loksewa AI", 
    "Loksewa Tayari", 
    "PSC Nepal", 
    "Loksewa Ayog", 
    "Kharidar Tayari", 
    "Nayab Subba Tayari", 
    "Section Officer", 
    "लोकसेवा तयारी", 
    "Nepal Public Service Commission"
  ],
  alternates: {
    canonical: 'https://loksewaai.com',
  },
  openGraph: {
    title: "Loksewa AI | Nepal's First AI Tutor for PSC Exam Preparation",
    description: "Prepare for Loksewa Ayog (Nepal PSC) exams with Loksewa AI. Generate smart study notes, take custom mock tests, and get real-time syllabus guidance from Loksewa Guru.",
    url: 'https://loksewaai.com',
    siteName: 'Loksewa AI',
    images: [
      {
        url: 'https://loksewaai.com/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Loksewa AI Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const getStartedHref = session ? "/dashboard" : "/auth/signup";

  return (
    <div className="light flex flex-col min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <GraduationCap className="h-6 w-6 text-[#c9a84c]" />
              </div>
              <span className="text-2xl font-black text-[#1e3a5f] tracking-tight">Loksewa <span className="text-[#c9a84c]">AI</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <Link href="#features" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">Features</Link>
              <Link href="#testimonials" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">Testimonials</Link>
              <Link href="#pricing" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">Pricing</Link>
              <Link href="#faq" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">FAQ</Link>
              <Link href="/blog" className="text-sm font-bold text-indigo-600 hover:text-[#1e3a5f] transition-all">Blog</Link>
              <Link href="/auth/signin" className="text-sm font-bold text-[#1e3a5f] hover:opacity-70 transition-all">Sign In</Link>
              <Link href={getStartedHref} className="px-7 py-3 text-sm font-black text-[#1e3a5f] bg-[#c9a84c] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#c9a84c]/20 uppercase tracking-widest">
                {session ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <Link href={getStartedHref} className="text-sm font-black text-[#c9a84c] uppercase tracking-widest bg-[#1e3a5f] px-4 py-2 rounded-xl">Start</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-28 overflow-hidden lg:pt-36 lg:pb-36 bg-gradient-to-b from-background to-gray-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#c9a84c] mr-3 animate-pulse"></span>
                  Nepal's First AI Tutor for PSC
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#1e3a5f] leading-[0.95] mb-8 tracking-tighter">
                  Ace Loksewa with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a5f] to-[#c9a84c]">AI Power</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Your personal AI tutor specialized in the Nepal PSC syllabus. Personalized study plans, smart notes, and unlimited practice.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                  <Link href={getStartedHref} className="w-full sm:w-auto px-10 py-5 text-lg font-black text-[#1e3a5f] bg-[#c9a84c] rounded-[2rem] hover:scale-105 transition-all shadow-2xl shadow-[#c9a84c]/20 flex items-center justify-center group uppercase tracking-widest">
                    Start Preparing Free
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/auth/signin" className="w-full sm:w-auto px-10 py-5 text-lg font-bold text-[#1e3a5f] bg-white border-2 border-gray-100 rounded-[2rem] hover:border-[#c9a84c] transition-all flex items-center justify-center">
                    Sign in to Account
                  </Link>
                </div>
                
                <div className="mt-16 flex items-center justify-center lg:justify-start space-x-12">
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-black text-[#1e3a5f] text-3xl">10,000+</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Aspirants</span>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-black text-[#1e3a5f] text-3xl">95%</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Success Rate</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 lg:mt-0 relative w-full flex justify-center overflow-visible">
                <HeroFeatureCards />
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-28 bg-background border-y border-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-[#1e3a5f] mb-6 sm:text-5xl tracking-tight">Everything You Need to Succeed</h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                We combine artificial intelligence with academic expertise to provide the best Loksewa preparation platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Smart Practice",
                  desc: "Practice with AI-generated questions tailored to your specific weakness areas.",
                  icon: BookOpen,
                  color: "bg-indigo-50 text-[#1e3a5f]"
                },
                {
                  title: "Personal AI Mentor",
                  desc: "Ask any question to Loksewa Guru, your 24/7 AI tutor specialized in Loksewa syllabus.",
                  icon: Globe,
                  color: "bg-[#c9a84c]/10 text-[#c9a84c]"
                },
                {
                  title: "Verified Content",
                  desc: "All content is updated based on the latest Loksewa notifications and exam patterns.",
                  icon: ShieldCheck,
                  color: "bg-emerald-50 text-emerald-600"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-[#c9a84c]/30 transition-all hover:-translate-y-2 shadow-sm group">
                  <div className={`h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1e3a5f] mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section id="mobile-app" className="py-28 bg-gray-50/50 border-t border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              
              {/* Left Column: Text Content */}
              <div className="lg:col-span-6 space-y-8">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] border border-[#1e3a5f]/10 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#c9a84c] mr-3"></span>
                  Companion Mobile App
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-[#1e3a5f] tracking-tight leading-tight animate-fade-in">
                  Master GK for Loksewa with <span className="text-[#c9a84c]">Loksewa Flashcards</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  Download the Loksewa Flashcards companion app from the Google Play Store to ace the General Knowledge (GK) exams of Loksewa. Specifically built for active recall and spaced repetition practice for all levels of Nepal Public Service Commission (Loksewa) preparation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wider mb-1">Spaced Repetition</h4>
                      <p className="text-xs text-gray-500 font-medium">Systematic review intervals to lock facts in your long-term memory.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wider mb-1">10,000+ GK Questions</h4>
                      <p className="text-xs text-gray-500 font-medium">Comprehensive coverage of history, geography, constitution, and current affairs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wider mb-1">Offline Mode</h4>
                      <p className="text-xs text-gray-500 font-medium">Practice and review flashcards even without an active internet connection.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wider mb-1">Progress Tracking</h4>
                      <p className="text-xs text-gray-500 font-medium">Visual metrics to identify weak spots and track daily streaks.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <a 
                    href="https://play.google.com/store/apps/details?id=app.lovable.fc6eeb197a144f488639eefd563fc26f&pcampaignid=web_share" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#1e3a5f] hover:bg-[#152a46] text-[#c9a84c] font-black rounded-2xl transition-all shadow-xl hover:scale-105 uppercase tracking-widest text-xs"
                  >
                    <svg className="h-5 w-5 fill-[#c9a84c]" viewBox="0 0 24 24">
                      <path d="M5.244 3.07a1.996 1.996 0 0 0-.25 1.026v15.808c.002.39.09.77.258 1.11L14.73 12 5.244 3.07zM15.71 11.08l2.67-1.54-3.66-2.12-2.11 3.66 3.1 1.8-1.57-1.8zm-7.61-6.19l9.31 5.37-2.6 1.5-6.71-6.87zM8.1 18.25L14.81 11.4l2.6 1.5-9.31 5.35z"/>
                    </svg>
                    Download on Google Play
                  </a>
                </div>
              </div>

              {/* Right Column: Sliding Screenshots & QR Code Card */}
              <div className="lg:col-span-6 mt-16 lg:mt-0 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12 overflow-visible">
                {/* Sliding Screenshots Deck */}
                <div className="shrink-0">
                  <CompanionAppScreenshots />
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(30,58,95,0.06)] text-center relative max-w-[220px] w-full group hover:border-[#c9a84c]/20 transition-all duration-300 shrink-0">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#c9a84c]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Scan to Download</p>
                    
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 inline-block relative overflow-hidden group-hover:bg-gray-50/50 transition-colors">
                      <Image 
                        src="/loksewa-flashcards-qr.png" 
                        alt="Scan QR code to download Loksewa Flashcards" 
                        width={130} 
                        height={130}
                        className="mx-auto rounded-lg relative z-10 transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-black text-[#1e3a5f] text-sm uppercase tracking-tight">Loksewa Flashcards</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Google Play Store</p>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-2"></div>
                    
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      Point your phone's camera here to download the Android app.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Pricing */}
        <Pricing />

        {/* FAQ */}
        <FAQ />

        {/* Call to Action */}
        <section className="py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1e3a5f] rounded-[4rem] p-16 lg:p-28 relative overflow-hidden text-center text-white shadow-[0_50px_100px_-20px_rgba(30,58,95,0.3)]">
              <div className="max-w-3xl mx-auto relative z-10">
                <h2 className="text-5xl md:text-6xl font-black mb-10 leading-[1.1] tracking-tighter">Ready to start your journey towards a government job?</h2>
                <p className="text-[#c9a84c] mb-12 text-xl font-bold uppercase tracking-[0.3em]">Join 10,000+ candidates today</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link href={getStartedHref} className="px-12 py-6 bg-[#c9a84c] text-[#1e3a5f] font-black rounded-3xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest">
                    Create Free Account
                  </Link>
                  <Link href="/auth/signin" className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-3xl hover:bg-white/10 transition-all">
                    Sign In
                  </Link>
                </div>
              </div>
              {/* Background Glows */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[500px] w-[500px] bg-[#c9a84c] rounded-full blur-[150px] opacity-10"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[500px] w-[500px] bg-white rounded-full blur-[150px] opacity-5"></div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
