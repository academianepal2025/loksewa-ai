import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ArrowLeft, Clock, Calendar, User, Share2, GraduationCap, Sparkles, BookOpen } from "lucide-react";
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Category icons map
const categoryIcons: Record<string, any> = {
  Tutorial: Sparkles,
  Strategy: GraduationCap,
  Insights: Clock,
  Vacancy: BookOpen,
  News: Calendar
};

// Fallback static posts in case they are not in the database yet
const fallbackPosts: Record<string, any> = {
  "how-to-use-loksewa-ai": {
    title: "The Ultimate Guide to Loksewa AI: Mastering Every Feature",
    date: "May 16, 2026",
    datePublishedISO: "2026-05-16T00:00:00Z",
    excerpt: "Learn how to leverage our AI-powered study plans, smart notes, and the Loksewa Guru to maximize your preparation efficiency.",
    author: "Loksewa AI Team",
    readTime: "8 min read",
    category: "Tutorial",
    image_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop",
    content: `Welcome to the future of PSC preparation. [Loksewa AI](https://loksewaai.com/) isn't just a study tool; it's a personalized intelligence platform designed to handle the heavy lifting of syllabus analysis and recall.

## 1. Setting Your Mission Parameters
The first step is selecting your target exam. Whether you are aiming for **Kharidar, Nayab Subba, or Section Officer**, Loksewa AI adapts its logic to the specific pattern of that exam. Go to the **Exams** tab or [create your free account](https://loksewaai.com/auth/signup) to initialize your mission.

## 2. Intelligence Intake (Document Upload)
This is where the magic happens. Don't just read PDFs—make them interactive. Upload your syllabus, textbooks, or even handwritten notes (as photos). Our AI will automatically extract topics, generate notes, and build custom quizzes. To optimize this workflow, see our guide on [preparing for Loksewa with AI](https://loksewaai.com/blog/how-to-prepare-loksewa-with-ai).

* **Extract Topics:** Automatically identify syllabus chapters from your files.
* **Generate Notes:** Create concise summaries focused on exam high-yield areas.
* **Create Quizzes:** Build MCQs directly from your uploaded content.

## 3. The Tactical Guru
Stuck on a complex legal provision in the Nepal Constitution? Ask the **Loksewa Guru**. It's an AI tutor specialized in Nepali governance and law. It doesn't give generic answers; it references your syllabus and provides PSC-style explanations aligned with official [Public Service Commission (Loksewa Ayog)](https://psc.gov.np) guidelines.

> **Pro Tip: Passive to Active**
> Use the **Active Recall** feature in the Practice Hub. Instead of re-reading your notes 10 times, let the AI quiz you 3 times. Scientific research shows this increases retention by 400%.

## 4. Platform Specs & Quick Reference
For aspirants, educators, and search engine crawlers, here is a detailed, structured overview of the Loksewa AI preparation platform and its parameters:

| Dimension | Platform Specifications |
| :--- | :--- |
| **Platform Name** | Loksewa AI |
| **Application Type** | AI-Powered Educational Platform / PSC Exam Tutor |
| **Target Region** | Nepal (National Public Service Commission Exams) |
| **Supported Levels** | Section Officer (Sakha Adhikrit), Nayab Subba, Kharidar, Technical & Non-Technical Positions |
| **Core AI Features** | Personal Study Plans, Smart PDF Notes Generator, Custom Mock Quizzes, 24/7 AI Chatbot (Loksewa Guru) |
| **Supported Languages** | Bilingual (Full English & Nepali translation/interface support) |
| **Companion App** | **Loksewa Flashcards** (Android/Google Play Store app for GK active recall) |
| **Payment Methods** | eSewa, Khalti, IME Pay, Nepali Bank QR Code (Instant manual verification) |

## 5. Frequently Asked Technical Questions

### How does AI Tutor help in Nepal PSC?
Loksewa AI analyzes your uploaded notes, matches them with the official public service syllabus, generates a daily study schedule based on your exam date, and creates target tests to test your knowledge.

### Is Nepali language fully supported?
Yes, our AI Guru reads Nepali script, understands the Nepalese administrative structure, legal terms, and Constitution 2072, and can chat or write study notes in Nepali or English.

### Where can I download the Loksewa Flashcards app?
You can download the official companion app **Loksewa Flashcards** directly from the Google Play Store on Android devices to prepare GK topics offline.

### How to activate Pro subscriptions in Nepal?
Aspirants can make payments through eSewa, Khalti, IME Pay, or any commercial Bank QR Code, upload the transaction screenshot in-app, and the support team activates access within 24 hours.`
  },
  "how-to-prepare-loksewa-with-ai": {
    title: "How to Prepare for Loksewa Ayog Exams Using Artificial Intelligence",
    date: "May 15, 2026",
    datePublishedISO: "2026-05-15T00:00:00Z",
    excerpt: "Strategic insights into integrating AI into your PSC preparation workflow. From syllabus analysis to active recall strategies.",
    author: "Education Specialist",
    readTime: "12 min read",
    category: "Strategy",
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
    content: `The traditional method of Loksewa preparation involves thousands of pages of rote memorization. In 2026, the winners are those who use [Augmented Intelligence](https://loksewaai.com/) to study smarter, not harder.

## Strategy A: Automated Syllabus Mapping
Stop guessing what is important. Use AI to analyze past year questions and map them against the current syllabus. [Loksewa AI](https://loksewaai.com/) does this automatically when you upload your syllabus, highlighting "Hot Topics" that appear frequently.

## Strategy B: The 90-Day Tactical Plan
Consistency is the only "secret" to Loksewa success. Use our **Dynamic Study Plan**. If you miss a day, the AI doesn't judge—it recalibrates your remaining days so you still cover everything before the exam. You can configure this directly on the [Loksewa AI workspace](https://loksewaai.com/auth/signup) and read our [mastery guide](https://loksewaai.com/blog/how-to-use-loksewa-ai) for detailed instructions.

## Strategy C: Mastering the Language
For many, writing descriptive answers in Nepali is the hardest part. Practice by asking the Guru to review your answer structure. It can provide feedback on your "Point-wise" presentation, which is critical for scoring high in [PSC subjective papers](https://psc.gov.np).

> "AI won't replace the candidate, but the candidate who uses AI will replace the one who doesn't."`
  },
  "common-loksewa-mistakes-ai-fix": {
    title: "5 Common Mistakes Loksewa Aspirants Make (And How AI Fixes Them)",
    date: "May 14, 2026",
    datePublishedISO: "2026-05-14T00:00:00Z",
    excerpt: "Avoid the traps of passive reading and syllabus overwhelm. Discover how technology can bridge the gap between hard work and success.",
    author: "Career Coach",
    readTime: "6 min read",
    category: "Insights",
    image_url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&auto=format&fit=crop",
    content: `Thousands of students study for 12+ hours a day but still fail to crack the Loksewa code. Why? Because hard work without strategy is just noise.

### 1. Passive Reading
Reading a book multiple times feels like progress, but it's the weakest way to learn. AI fixes this by forcing **Active Recall** through instant quizzes. Learn more in our [Mastery Guide](https://loksewaai.com/blog/how-to-use-loksewa-ai).

### 2. Syllabus Overwhelm
Trying to master everything at once leads to burnout. Our AI breaks the syllabus into **Tactical Missions** so you only focus on today's target.

### 3. Ignoring Weaknesses
Students naturally study what they already know. AI analyzes your quiz scores to identify **Knowledge Gaps** on the [Loksewa AI platform](https://loksewaai.com/) and tells you exactly where to focus.

### 4. Outdated Materials
Laws and regulations in Nepal change frequently. Loksewa Guru is updated with the latest constitutional amendments following official guidelines from the [Public Service Commission of Nepal](https://psc.gov.np).

## 5. The "No-Plan" Trap
Many start with high energy but lose track by week 3. A static paper schedule can't adapt to your life. Our **Dynamic Scheduler** moves your tasks if you get sick or busy. Try creating one now by [signing up for free](https://loksewaai.com/auth/signup).

> **The Verdict**
> Stop studying like it's 1995. The PSC exam is competitive, and you need every technological edge you can get.`
  }
};

async function getPostData(slug: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (data) {
      return {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        readTime: data.read_time,
        category: data.category,
        date: new Date(data.published_at || data.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        datePublishedISO: data.published_at || data.created_at,
        image_url: data.image_url,
        seoTitle: data.seo_title || data.title,
        seoDescription: data.seo_description || data.excerpt,
        seoKeywords: data.seo_keywords || []
      };
    }
  } catch (err) {
    console.error('Error fetching blog post from db:', err);
  }

  // Fallback to static data
  const fallback = fallbackPosts[slug];
  if (fallback) {
    return {
      ...fallback,
      seoTitle: fallback.title,
      seoDescription: fallback.excerpt,
      seoKeywords: ["Loksewa AI", "PSC Nepal", "Loksewa Preparation", fallback.category]
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    return {
      title: "Post Not Found | Loksewa AI Blog",
    };
  }

  const title = `${post.seoTitle} | Loksewa AI Blog`;
  const description = post.seoDescription;

  return {
    title,
    description,
    keywords: ["Loksewa AI", "PSC Nepal", "Loksewa Preparation", post.category, ...(post.seoKeywords || [])],
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
          url: post.image_url && post.image_url.startsWith('http') ? post.image_url : "https://loksewaai.com/icon-512.png",
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
      images: [post.image_url && post.image_url.startsWith('http') ? post.image_url : "https://loksewaai.com/icon-512.png"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostData(slug);

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

  const IconComponent = categoryIcons[post.category] || BookOpen;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#c9a84c]" />
              </div>
              <span className="text-2xl font-black text-foreground tracking-tight">Loksewa <span className="text-[#c9a84c]">AI</span></span>
            </Link>
            <div className="flex items-center gap-6">
               <Link href="/blog" className="text-sm font-bold text-subtle hover:text-foreground flex items-center gap-2">
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
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-500/20">
                {post.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-10 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 py-8 border-y border-border-subtle">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-[#c9a84c]">
                       <User className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Author</p>
                       <p className="text-sm font-bold text-foreground">{post.author}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-subtle">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Published</p>
                       <p className="text-sm font-bold text-foreground">{post.date}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-subtle">
                       <Clock className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Reading Time</p>
                       <p className="text-sm font-bold text-foreground">{post.readTime}</p>
                    </div>
                 </div>
              </div>
           </header>

           {/* Post Image/Cover */}
           {post.image_url ? (
             <div className="w-full rounded-[3rem] mb-20 overflow-hidden border border-border-subtle shadow-2xl bg-surface-elevated">
               <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-contain block" />
             </div>
           ) : (
             <div className="aspect-video bg-[#1e3a5f] rounded-[3rem] mb-20 flex items-center justify-center shadow-2xl overflow-hidden relative border border-border-subtle">
               <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
               <IconComponent className="h-48 w-48 text-[#c9a84c] relative z-10" />
             </div>
           )}

            {/* Content */}
            <div className="prose prose-indigo prose-xl max-w-none">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {post.content}
               </ReactMarkdown>
            </div>

           {/* Footer Share */}
           <footer className="mt-20 pt-10 border-t border-border-subtle flex items-center justify-between">
              <Link href="/blog" className="flex items-center gap-2 text-sm font-black text-foreground uppercase tracking-widest hover:text-[#c9a84c] transition-colors">
                 <ArrowLeft className="h-4 w-4" /> Other Articles
              </Link>
              <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border-subtle rounded-2xl text-[10px] font-black text-subtle uppercase tracking-widest hover:bg-surface-elevated transition-all">
                 <Share2 className="h-4 w-4" /> Share Article
              </button>
           </footer>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
