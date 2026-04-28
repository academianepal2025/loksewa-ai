import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Globe, GraduationCap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Loksewa AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Features</Link>
              <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">About</Link>
              <Link href="/auth/signin" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-all shadow-md shadow-orange-200">
                Get Started
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <Link href="/auth/signin" className="text-sm font-medium text-orange-600 mr-4">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 overflow-hidden lg:pt-32 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold mb-6 animate-fade-in">
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
                  The Future of Exam Preparation
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                  Master Loksewa with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-violet-600">AI Intelligence</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Your personal AI tutor for Loksewa preparation. Get personalized study plans, smart practice exams, and real-time guidance to ace your exams.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/auth/signup" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-orange-600 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center group">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/auth/signin" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center">
                    Sign in to Account
                  </Link>
                </div>
                
                <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
                  <div className="flex flex-col items-center lg:items-start text-sm text-gray-500">
                    <span className="font-bold text-gray-900 text-lg">10k+</span>
                    <span>Active Students</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="flex flex-col items-center lg:items-start text-sm text-gray-500">
                    <span className="font-bold text-gray-900 text-lg">95%</span>
                    <span>Exam Success</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 lg:mt-0 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-orange-200 border border-orange-100 aspect-square sm:aspect-video lg:aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-violet-600/20 mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 bg-zinc-900">
                     <div className="w-full space-y-4">
                        <div className="h-4 w-3/4 bg-orange-500/20 rounded-full"></div>
                        <div className="h-4 w-1/2 bg-orange-500/10 rounded-full"></div>
                        <div className="h-4 w-5/6 bg-orange-500/20 rounded-full"></div>
                        <div className="h-20 w-full bg-gradient-to-r from-orange-600 to-violet-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white font-medium">Generating Your Personalized Plan...</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-32 bg-orange-500/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                              <div className="h-3 w-1/2 bg-orange-400 rounded-full mb-2"></div>
                              <div className="h-3 w-3/4 bg-orange-400/50 rounded-full"></div>
                           </div>
                           <div className="h-32 bg-orange-500/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                              <div className="h-3 w-1/2 bg-orange-400 rounded-full mb-2"></div>
                              <div className="h-3 w-3/4 bg-orange-400/50 rounded-full"></div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 h-24 w-24 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-violet-100 rounded-full blur-3xl opacity-50"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:text-4xl">Everything You Need to Succeed</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                We combine artificial intelligence with academic expertise to provide the best Loksewa preparation platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Practice",
                  desc: "Practice with AI-generated questions tailored to your weakness areas.",
                  icon: BookOpen,
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  title: "Personal AI Mentor",
                  desc: "Ask any question to Loksewa Guru, your 24/7 AI tutor specialized in Loksewa syllabus.",
                  icon: Globe,
                  color: "bg-orange-50 text-orange-600"
                },
                {
                  title: "Verified Content",
                  desc: "All content is updated daily based on the latest Loksewa notifications and syllabus.",
                  icon: ShieldCheck,
                  color: "bg-emerald-50 text-emerald-600"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all hover:-translate-y-1 shadow-sm">
                  <div className={`h-12 w-12 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 font-light text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#ea580c] to-[#12243d] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center text-white">
              <div className="max-w-3xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Ready to start your journey towards a government job?</h2>
                <p className="text-orange-200/80 mb-10 text-lg font-light">Join thousands of successful candidates today.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/auth/signup" className="px-10 py-5 bg-white text-orange-950 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl">
                    Create Free Account
                  </Link>
                  <Link href="/auth/signin" className="px-10 py-5 bg-orange-600/30 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                    Sign In
                  </Link>
                </div>
              </div>
              {/* Background Glows */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-orange-500 rounded-full blur-[120px] opacity-20"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-96 w-96 bg-violet-600 rounded-full blur-[120px] opacity-20"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <GraduationCap className="h-5 w-5 text-orange-600" />
               <span className="font-bold text-gray-900">Loksewa AI</span>
            </div>
            <div className="flex space-x-8">
              <Link href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-orange-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-orange-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Loksewa AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
