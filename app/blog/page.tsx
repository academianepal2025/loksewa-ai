import Link from 'next/link';
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles, GraduationCap } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Loksewa AI Blog | PSC Exam Preparation Tips & AI Study Strategies",
  description: "Read the latest guides, tips, and strategies for passing the Nepal PSC exams. Learn how to use AI for study plans, active recall quizzes, and custom notes.",
  keywords: [
    "Loksewa Blog",
    "Loksewa Tayari Tips",
    "Nepal PSC Strategy",
    "Loksewa AI Tutorial",
    "Kharidar Study Plan",
    "Nayab Subba preparation online",
    "Section Officer subjective papers"
  ],
  alternates: {
    canonical: 'https://loksewaai.com/blog',
  },
  openGraph: {
    title: "Loksewa AI Blog | PSC Exam Preparation Tips & AI Study Strategies",
    description: "Read the latest guides, tips, and strategies for passing the Nepal PSC exams. Learn how to use AI for study plans, active recall quizzes, and custom notes.",
    url: 'https://loksewaai.com/blog',
    siteName: 'Loksewa AI',
    images: [
      {
        url: 'https://loksewaai.com/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Loksewa AI Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

const blogPosts = [
  {
    title: "The Ultimate Guide to Loksewa AI: Mastering Every Feature",
    slug: "how-to-use-loksewa-ai",
    excerpt: "Learn how to leverage our AI-powered study plans, smart notes, and the Loksewa Guru to maximize your preparation efficiency.",
    date: "May 16, 2026",
    author: "Loksewa AI Team",
    category: "Tutorial",
    readTime: "8 min read",
    image: "/blog/guide.jpg",
    icon: Sparkles
  },
  {
    title: "How to Prepare for Loksewa Ayog Exams Using Artificial Intelligence",
    slug: "how-to-prepare-loksewa-with-ai",
    excerpt: "Strategic insights into integrating AI into your PSC preparation workflow. From syllabus analysis to active recall strategies.",
    date: "May 15, 2026",
    author: "Education Specialist",
    category: "Strategy",
    readTime: "12 min read",
    image: "/blog/prepare.jpg",
    icon: GraduationCap
  },
  {
    title: "5 Common Mistakes Loksewa Aspirants Make (And How AI Fixes Them)",
    slug: "common-loksewa-mistakes-ai-fix",
    excerpt: "Avoid the traps of passive reading and syllabus overwhelm. Discover how technology can bridge the gap between hard work and success.",
    date: "May 14, 2026",
    author: "Career Coach",
    category: "Insights",
    readTime: "6 min read",
    image: "/blog/mistakes.jpg",
    icon: Clock
  }
];

export default function BlogPage() {
  return (
    <div className="light flex flex-col min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <GraduationCap className="h-6 w-6 text-[#c9a84c]" />
              </div>
              <span className="text-2xl font-black text-[#1e3a5f] tracking-tight">Loksewa <span className="text-[#c9a84c]">AI</span></span>
            </Link>
            <div className="hidden md:flex items-center space-x-10">
              <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">Home</Link>
              <Link href="/#features" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-all">Features</Link>
              <Link href="/auth/signin" className="text-sm font-bold text-[#1e3a5f] hover:opacity-70 transition-all">Sign In</Link>
              <Link href="/auth/signup" className="px-7 py-3 text-sm font-black text-[#1e3a5f] bg-[#c9a84c] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#c9a84c]/20 uppercase tracking-widest">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-28">
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-b from-background to-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              Preparation Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#1e3a5f] tracking-tighter mb-6 uppercase">
              The <span className="text-[#c9a84c]">Loksewa</span> Blog
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Strategies, tutorials, and updates to help you dominate the Nepal PSC examinations.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group bg-white rounded-[3rem] border border-gray-100 overflow-hidden hover:border-[#c9a84c]/30 transition-all hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-[#1e3a5f]/5 h-full flex flex-col">
                  <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden flex items-center justify-center p-12">
                     <div className="absolute inset-0 bg-[#1e3a5f] opacity-90 transition-opacity group-hover:opacity-100"></div>
                     <post.icon className="h-32 w-32 text-[#c9a84c] relative z-10 transition-transform group-hover:scale-110" />
                     <div className="absolute top-8 left-8">
                        <span className="px-4 py-1.5 bg-[#c9a84c] text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest rounded-full">{post.category}</span>
                     </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {post.date}</div>
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {post.readTime}</div>
                    </div>
                    <h2 className="text-3xl font-black text-[#1e3a5f] mb-6 leading-tight group-hover:text-[#c9a84c] transition-colors">{post.title}</h2>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">{post.excerpt}</p>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] group-hover:gap-2 transition-all">
                      Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
           <div className="bg-[#1e3a5f] rounded-[4rem] p-12 lg:p-20 relative overflow-hidden text-center text-white">
              <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Stay ahead of the curve.</h3>
              <p className="text-[#c9a84c] mb-10 text-lg font-bold uppercase tracking-[0.2em]">Weekly strategies delivered to your inbox.</p>
              <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
                 <input type="email" placeholder="Enter your email" className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a84c] transition-all" />
                 <button className="px-8 py-4 bg-[#c9a84c] text-[#1e3a5f] font-black rounded-2xl uppercase tracking-widest hover:opacity-90 transition-all">Subscribe</button>
              </div>
           </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
