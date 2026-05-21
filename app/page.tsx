import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Globe, GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
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
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
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

              <div className="mt-20 lg:mt-0 relative">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(30,58,95,0.25)] border border-indigo-50 aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/40 to-transparent mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-12 bg-[#1e3a5f]">
                     <div className="w-full space-y-6">
                        <div className="h-6 w-3/4 bg-white/20 rounded-full animate-pulse"></div>
                        <div className="h-6 w-1/2 bg-white/10 rounded-full animate-pulse delay-75"></div>
                        <div className="h-6 w-5/6 bg-white/20 rounded-full animate-pulse delay-150"></div>
                        <div className="h-28 w-full bg-[#c9a84c] rounded-3xl flex items-center justify-center shadow-lg">
                          <span className="text-[#1e3a5f] font-black uppercase tracking-widest text-sm">Generating Your Study Plan...</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="h-40 bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col justify-end">
                              <div className="h-4 w-1/2 bg-[#c9a84c] rounded-full mb-3"></div>
                              <div className="h-4 w-3/4 bg-[#c9a84c]/50 rounded-full"></div>
                           </div>
                           <div className="h-40 bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col justify-end">
                              <div className="h-4 w-1/2 bg-[#c9a84c] rounded-full mb-3"></div>
                              <div className="h-4 w-3/4 bg-[#c9a84c]/50 rounded-full"></div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 h-40 w-40 bg-[#c9a84c]/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-16 -left-16 h-60 w-60 bg-[#1e3a5f]/10 rounded-full blur-[100px]"></div>
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
