-- Create the blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    image_url TEXT, -- Imgur link or cover illustration path
    category TEXT NOT NULL, -- Tutorial, Strategy, Insights, Vacancy, etc.
    author TEXT NOT NULL DEFAULT 'Loksewa AI Team',
    read_time TEXT NOT NULL DEFAULT '5 min read',
    is_published BOOLEAN NOT NULL DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read-only access to published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin all access to blog posts" ON public.blog_posts;

-- Create policies
CREATE POLICY "Allow public read-only access to published blog posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

CREATE POLICY "Allow admin all access to blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial posts if table is empty
INSERT INTO public.blog_posts (title, slug, excerpt, content, image_url, category, author, read_time, is_published, seo_title, seo_description, seo_keywords, published_at)
SELECT 
  'The Ultimate Guide to Loksewa AI: Mastering Every Feature',
  'how-to-use-loksewa-ai',
  'Learn how to leverage our AI-powered study plans, smart notes, and the Loksewa Guru to maximize your preparation efficiency.',
  'Welcome to the future of PSC preparation. [Loksewa AI](https://loksewaai.com/) isn''t just a study tool; it''s a personalized intelligence platform designed to handle the heavy lifting of syllabus analysis and recall.

## 1. Setting Your Mission Parameters
The first step is selecting your target exam. Whether you are aiming for **Kharidar, Nayab Subba, or Section Officer**, Loksewa AI adapts its logic to the specific pattern of that exam. Go to the **Exams** tab or [create your free account](https://loksewaai.com/auth/signup) to initialize your mission.

## 2. Intelligence Intake (Document Upload)
This is where the magic happens. Don''t just read PDFs—make them interactive. Upload your syllabus, textbooks, or even handwritten notes (as photos). Our AI will automatically extract topics, generate notes, and build custom quizzes. To optimize this workflow, see our guide on [preparing for Loksewa with AI](https://loksewaai.com/blog/how-to-prepare-loksewa-with-ai).

* **Extract Topics:** Automatically identify syllabus chapters from your files.
* **Generate Notes:** Create concise summaries focused on exam high-yield areas.
* **Create Quizzes:** Build MCQs directly from your uploaded content.

## 3. The Tactical Guru
Stuck on a complex legal provision in the Nepal Constitution? Ask the **Loksewa Guru**. It''s an AI tutor specialized in Nepali governance and law. It doesn''t give generic answers; it references your syllabus and provides PSC-style explanations aligned with official [Public Service Commission (Loksewa Ayog)](https://psc.gov.np) guidelines.

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
Aspirants can make payments through eSewa, Khalti, IME Pay, or any commercial Bank QR Code, upload the transaction screenshot in-app, and the support team activates access within 24 hours.',
  '/blog/guide.jpg',
  'Tutorial',
  'Loksewa AI Team',
  '8 min read',
  true,
  'The Ultimate Guide to Loksewa AI: Mastering Every Feature',
  'Learn how to leverage our AI-powered study plans, smart notes, and the Loksewa Guru to maximize your preparation efficiency.',
  ARRAY['Loksewa AI', 'PSC Nepal', 'Loksewa Preparation', 'Tutorial', 'Tayari tips', 'how to use loksewa ai'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'how-to-use-loksewa-ai');

INSERT INTO public.blog_posts (title, slug, excerpt, content, image_url, category, author, read_time, is_published, seo_title, seo_description, seo_keywords, published_at)
SELECT 
  'How to Prepare for Loksewa Ayog Exams Using Artificial Intelligence',
  'how-to-prepare-loksewa-with-ai',
  'Strategic insights into integrating AI into your PSC preparation workflow. From syllabus analysis to active recall strategies.',
  'The traditional method of Loksewa preparation involves thousands of pages of rote memorization. In 2026, the winners are those who use [Augmented Intelligence](https://loksewaai.com/) to study smarter, not harder.

## Strategy A: Automated Syllabus Mapping
Stop guessing what is important. Use AI to analyze past year questions and map them against the current syllabus. [Loksewa AI](https://loksewaai.com/) does this automatically when you upload your syllabus, highlighting "Hot Topics" that appear frequently.

## Strategy B: The 90-Day Tactical Plan
Consistency is the only "secret" to Loksewa success. Use our **Dynamic Study Plan**. If you miss a day, the AI doesn''t judge—it recalibrates your remaining days so you still cover everything before the exam. You can configure this directly on the [Loksewa AI workspace](https://loksewaai.com/auth/signup) and read our [mastery guide](https://loksewaai.com/blog/how-to-use-loksewa-ai) for detailed instructions.

## Strategy C: Mastering the Language
For many, writing descriptive answers in Nepali is the hardest part. Practice by asking the Guru to review your answer structure. It can provide feedback on your "Point-wise" presentation, which is critical for scoring high in [PSC subjective papers](https://psc.gov.np).

> "AI won''t replace the candidate, but the candidate who uses AI will replace the one who doesn''t."',
  '/blog/prepare.jpg',
  'Strategy',
  'Education Specialist',
  '12 min read',
  true,
  'How to Prepare for Loksewa Ayog Exams Using Artificial Intelligence',
  'Strategic insights into integrating AI into your PSC preparation workflow. From syllabus analysis to active recall strategies.',
  ARRAY['Loksewa AI', 'PSC Nepal', 'Loksewa Preparation', 'Strategy', 'Tayari tips', 'how to prepare loksewa with ai'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'how-to-prepare-loksewa-with-ai');

INSERT INTO public.blog_posts (title, slug, excerpt, content, image_url, category, author, read_time, is_published, seo_title, seo_description, seo_keywords, published_at)
SELECT 
  '5 Common Mistakes Loksewa Aspirants Make (And How AI Fixes Them)',
  'common-loksewa-mistakes-ai-fix',
  'Avoid the traps of passive reading and syllabus overwhelm. Discover how technology can bridge the gap between hard work and success.',
  'Thousands of students study for 12+ hours a day but still fail to crack the Loksewa code. Why? Because hard work without strategy is just noise.

### 1. Passive Reading
Reading a book multiple times feels like progress, but it''s the weakest way to learn. AI fixes this by forcing **Active Recall** through instant quizzes. Learn more in our [Mastery Guide](https://loksewaai.com/blog/how-to-use-loksewa-ai).

### 2. Syllabus Overwhelm
Trying to master everything at once leads to burnout. Our AI breaks the syllabus into **Tactical Missions** so you only focus on today''s target.

### 3. Ignoring Weaknesses
Students naturally study what they already know. AI analyzes your quiz scores to identify **Knowledge Gaps** on the [Loksewa AI platform](https://loksewaai.com/) and tells you exactly where to focus.

### 4. Outdated Materials
Laws and regulations in Nepal change frequently. Loksewa Guru is updated with the latest constitutional amendments following official guidelines from the [Public Service Commission of Nepal](https://psc.gov.np).

## 5. The "No-Plan" Trap
Many start with high energy but lose track by week 3. A static paper schedule can''t adapt to your life. Our **Dynamic Scheduler** moves your tasks if you get sick or busy. Try creating one now by [signing up for free](https://loksewaai.com/auth/signup).

> **The Verdict**
> Stop studying like it''s 1995. The PSC exam is competitive, and you need every technological edge you can get.',
  '/blog/mistakes.jpg',
  'Insights',
  'Career Coach',
  '6 min read',
  true,
  '5 Common Mistakes Loksewa Aspirants Make (And How AI Fixes Them)',
  'Avoid the traps of passive reading and syllabus overwhelm. Discover how technology can bridge the gap between hard work and success.',
  ARRAY['Loksewa AI', 'PSC Nepal', 'Loksewa Preparation', 'Insights', 'Tayari tips', 'common loksewa mistakes ai fix'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'common-loksewa-mistakes-ai-fix');
