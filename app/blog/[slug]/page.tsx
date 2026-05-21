import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ArrowLeft, Clock, Calendar, User, Share2, GraduationCap, Sparkles, CheckCircle2 } from "lucide-react";
import { Metadata } from 'next';

const posts: Record<string, any> = {
  "how-to-use-loksewa-ai": {
    title: "The Ultimate Guide to Loksewa AI: Mastering Every Feature",
    date: "May 16, 2026",
    datePublishedISO: "2026-05-16T00:00:00Z",
    excerpt: "Learn how to leverage our AI-powered study plans, smart notes, and the Loksewa Guru to maximize your preparation efficiency.",
    author: "Loksewa AI Team",
    readTime: "8 min read",
    category: "Tutorial",
    icon: Sparkles,
    content: (
      <div className="space-y-12">
        <p className="text-xl leading-relaxed text-gray-600 font-medium italic border-l-4 border-[#c9a84c] pl-6">
          Welcome to the future of PSC preparation. <Link href="/" className="text-indigo-600 hover:underline">Loksewa AI</Link> isn't just a study tool; it's a personalized intelligence platform designed to handle the heavy lifting of syllabus analysis and recall.
        </p>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">1. Setting Your Mission Parameters</h2>
          <p className="text-gray-600 leading-relaxed">
            The first step is selecting your target exam. Whether you are aiming for <strong>Kharidar, Nayab Subba, or Section Officer</strong>, Loksewa AI adapts its logic to the specific pattern of that exam. Go to the <strong>Exams</strong> tab or <Link href="/auth/signup" className="text-indigo-600 hover:underline">create your free account</Link> to initialize your mission.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">2. Intelligence Intake (Document Upload)</h2>
          <p className="text-gray-600 leading-relaxed">
            This is where the magic happens. Don't just read PDFs—make them interactive. Upload your syllabus, textbooks, or even handwritten notes (as photos). Our AI will automatically extract topics, generate notes, and build custom quizzes. To optimize this workflow, see our guide on <Link href="/blog/how-to-prepare-loksewa-with-ai" className="text-indigo-600 hover:underline">preparing for Loksewa with AI</Link>.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-[#c9a84c] mt-1 shrink-0" />
              <span><strong>Extract Topics:</strong> Automatically identify syllabus chapters from your files.</span>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-[#c9a84c] mt-1 shrink-0" />
              <span><strong>Generate Notes:</strong> Create concise summaries focused on exam high-yield areas.</span>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-[#c9a84c] mt-1 shrink-0" />
              <span><strong>Create Quizzes:</strong> Build MCQs directly from your uploaded content.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">3. The Tactical Guru</h2>
          <p className="text-gray-600 leading-relaxed">
            Stuck on a complex legal provision in the Nepal Constitution? Ask the <strong>Loksewa Guru</strong>. It's an AI tutor specialized in Nepali governance and law. It doesn't give generic answers; it references your syllabus and provides PSC-style explanations aligned with official <a href="https://loksewa.gov.np" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Public Service Commission (Loksewa Ayog)</a> guidelines.
          </p>
        </section>

        <div className="bg-[#1e3a5f] p-10 rounded-[3rem] text-white">
          <h3 className="text-2xl font-black mb-4 tracking-tight">Pro Tip: Passive to Active</h3>
          <p className="opacity-80 leading-relaxed">
            Use the <strong>Active Recall</strong> feature in the Practice Hub. Instead of re-reading your notes 10 times, let the AI quiz you 3 times. Scientific research shows this increases retention by 400%.
          </p>
        </div>
      </div>
    )
  },
  "how-to-prepare-loksewa-with-ai": {
    title: "How to Prepare for Loksewa Ayog Exams Using Artificial Intelligence",
    date: "May 15, 2026",
    datePublishedISO: "2026-05-15T00:00:00Z",
    excerpt: "Strategic insights into integrating AI into your PSC preparation workflow. From syllabus analysis to active recall strategies.",
    author: "Education Specialist",
    readTime: "12 min read",
    category: "Strategy",
    icon: GraduationCap,
    content: (
      <div className="space-y-12">
        <p className="text-xl leading-relaxed text-gray-600 font-medium">
          The traditional method of Loksewa preparation involves thousands of pages of rote memorization. In 2026, the winners are those who use <Link href="/" className="text-indigo-600 hover:underline">Augmented Intelligence</Link> to study smarter, not harder.
        </p>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">Strategy A: Automated Syllabus Mapping</h2>
          <p className="text-gray-600 leading-relaxed">
            Stop guessing what is important. Use AI to analyze past year questions and map them against the current syllabus. <Link href="/" className="text-indigo-600 hover:underline">Loksewa AI</Link> does this automatically when you upload your syllabus, highlighting "Hot Topics" that appear frequently.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">Strategy B: The 90-Day Tactical Plan</h2>
          <p className="text-gray-600 leading-relaxed">
            Consistency is the only "secret" to Loksewa success. Use our <strong>Dynamic Study Plan</strong>. If you miss a day, the AI doesn't judge—it recalibrates your remaining days so you still cover everything before the exam. You can configure this directly on the <Link href="/auth/signup" className="text-indigo-600 hover:underline">Loksewa AI workspace</Link> and read our <Link href="/blog/how-to-use-loksewa-ai" className="text-indigo-600 hover:underline">mastery guide</Link> for detailed instructions.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">Strategy C: Mastering the Language</h2>
          <p className="text-gray-600 leading-relaxed">
            For many, writing descriptive answers in Nepali is the hardest part. Practice by asking the Guru to review your answer structure. It can provide feedback on your "Point-wise" presentation, which is critical for scoring high in <a href="https://loksewa.gov.np" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">PSC subjective papers</a>.
          </p>
        </section>

        <blockquote className="border-l-8 border-[#1e3a5f] bg-gray-50 p-8 rounded-2xl italic text-gray-700 text-lg">
          "AI won't replace the candidate, but the candidate who uses AI will replace the one who doesn't."
        </blockquote>
      </div>
    )
  },
  "common-loksewa-mistakes-ai-fix": {
    title: "5 Common Mistakes Loksewa Aspirants Make (And How AI Fixes Them)",
    date: "May 14, 2026",
    datePublishedISO: "2026-05-14T00:00:00Z",
    excerpt: "Avoid the traps of passive reading and syllabus overwhelm. Discover how technology can bridge the gap between hard work and success.",
    author: "Career Coach",
    readTime: "6 min read",
    category: "Insights",
    icon: Clock,
    content: (
      <div className="space-y-12">
        <p className="text-xl leading-relaxed text-gray-600 font-medium">
          Thousands of students study for 12+ hours a day but still fail to crack the Loksewa code. Why? Because hard work without strategy is just noise.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase mb-4 tracking-tight">1. Passive Reading</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Reading a book multiple times feels like progress, but it's the weakest way to learn. AI fixes this by forcing <strong>Active Recall</strong> through instant quizzes. Learn more in our <Link href="/blog/how-to-use-loksewa-ai" className="text-indigo-600 hover:underline">Mastery Guide</Link>.</p>
           </div>
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase mb-4 tracking-tight">2. Syllabus Overwhelm</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Trying to master everything at once leads to burnout. Our AI breaks the syllabus into <strong>Tactical Missions</strong> so you only focus on today's target.</p>
           </div>
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase mb-4 tracking-tight">3. Ignoring Weaknesses</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Students naturally study what they already know. AI analyzes your quiz scores to identify <strong>Knowledge Gaps</strong> on the <Link href="/" className="text-indigo-600 hover:underline">Loksewa AI platform</Link> and tells you exactly where to focus.</p>
           </div>
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase mb-4 tracking-tight">4. Outdated Materials</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Laws and regulations in Nepal change frequently. Loksewa Guru is updated with the latest constitutional amendments following official guidelines from the <a href="https://loksewa.gov.np" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Public Service Commission of Nepal</a>.</p>
           </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight uppercase">5. The \"No-Plan\" Trap</h2>
          <p className="text-gray-600 leading-relaxed">
            Many start with high energy but lose track by week 3. A static paper schedule can't adapt to your life. Our <strong>Dynamic Scheduler</strong> moves your tasks if you get sick or busy. Try creating one now by <Link href="/auth/signup" className="text-indigo-600 hover:underline">signing up for free</Link>.
          </p>
        </section>

        <div className="bg-[#c9a84c] p-10 rounded-[3rem] text-[#1e3a5f]">
           <h3 className="text-2xl font-black mb-4 tracking-tight">The Verdict</h3>
           <p className="font-bold leading-relaxed">
             Stop studying like it's 1995. The PSC exam is competitive, and you need every technological edge you can get.
           </p>
        </div>
      </div>
    )
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return {
      title: "Post Not Found | Loksewa AI Blog",
    };
  }

  const title = `${post.title} | Loksewa AI Blog`;
  const description = post.excerpt;

  return {
    title,
    description,
    keywords: ["Loksewa AI", "PSC Nepal", "Loksewa Preparation", post.category, "Tayari tips", slug.replace(/-/g, " ")],
    alternates: {
      canonical: `https://loksewaai.com/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://loksewaai.com/blog/${slug}`,
      siteName: "Loksewa AI",
      images: [
        {
          url: "https://loksewaai.com/icon-512.png",
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.datePublishedISO,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://loksewaai.com/icon-512.png"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.datePublishedISO,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Loksewa AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://loksewaai.com/icon-512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://loksewaai.com/blog/${slug}`
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#c9a84c]" />
              </div>
              <span className="text-2xl font-black text-[#1e3a5f] tracking-tight">Loksewa <span className="text-[#c9a84c]">AI</span></span>
            </Link>
            <div className="flex items-center gap-6">
               <Link href="/blog" className="text-sm font-bold text-gray-500 hover:text-[#1e3a5f] flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Blog
               </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-28">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
           {/* Header */}
           <header className="mb-16">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100">
                {post.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[#1e3a5f] tracking-tighter mb-10 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 py-8 border-y border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[#c9a84c]">
                       <User className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</p>
                       <p className="text-sm font-bold text-[#1e3a5f]">{post.author}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published</p>
                       <p className="text-sm font-bold text-[#1e3a5f]">{post.date}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                       <Clock className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reading Time</p>
                       <p className="text-sm font-bold text-[#1e3a5f]">{post.readTime}</p>
                    </div>
                 </div>
              </div>
           </header>

           {/* Post Image/Icon placeholder */}
           <div className="aspect-video bg-[#1e3a5f] rounded-[3rem] mb-20 flex items-center justify-center shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
              <post.icon className="h-48 w-48 text-[#c9a84c] relative z-10" />
           </div>

           {/* Content */}
           <div className="prose prose-indigo prose-xl max-w-none">
              {post.content}
           </div>

           {/* Footer Share */}
           <footer className="mt-20 pt-10 border-t border-gray-100 flex items-center justify-between">
              <Link href="/blog" className="flex items-center gap-2 text-sm font-black text-[#1e3a5f] uppercase tracking-widest hover:text-[#c9a84c] transition-colors">
                 <ArrowLeft className="h-4 w-4" /> Other Articles
              </Link>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all">
                 <Share2 className="h-4 w-4" /> Share Article
              </button>
           </footer>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
