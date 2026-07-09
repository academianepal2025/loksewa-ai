import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const RESEARCH_MODEL = 'gemini-2.5-flash';
const GENERATION_MODEL = 'gemini-2.5-flash';

export interface TrendingTopic {
  title: string;
  excerpt: string;
  category: string;
  reason: string; // Why it's trending or important now
  suggestedKeywords: string[];
}

/**
 * Searches the web for the latest Loksewa Ayog Nepal vacancies, updates, and rules,
 * and recommends 2-3 trending topics.
 */
export async function researchTrendingTopics(customQuery?: string): Promise<TrendingTopic[]> {
  const systemInstruction = `You are a research assistant specializing in Nepal's Public Service Commission (Loksewa Ayog) exam preparation, latest vacancies, syllabus changes, and digital study trends.
Your task is to analyze the current state of Loksewa preparation in Nepal and suggest 2-3 trending and highly relevant blog post topics.
Use the Google Search tool to search for matching information. ${customQuery ? `The administrator explicitly wants you to focus on: "${customQuery}"` : `You should search for general topics like latest vacancies, syllabus updates, exam results, or prep tips for 2026.`}

Provide the output strictly as a JSON array of objects, where each object has these fields:
- title: A compelling, SEO-friendly headline (e.g. "Loksewa Vacancies 2026: Complete Guide to Sakha Adhikrit & NaSu Applications")
- excerpt: A short, engaging summary (1-2 sentences) of what the post will cover.
- category: One of "Vacancy", "Strategy", "Insights", "Tutorial", "News".
- reason: Brief explanation of why this topic is hot right now.
- suggestedKeywords: A list of 4-6 relevant SEO keywords.

Return ONLY the raw JSON array. Do not include markdown code fences or backticks.`;

  const prompt = customQuery 
    ? `Please perform targeted research for Nepal Loksewa Ayog related specifically to: "${customQuery}", and suggest 3 matching blog topics.`
    : "Please research the latest updates for Loksewa Ayog Nepal and recommend 3 trending blog topics.";

  try {
    const response = await ai.models.generateContent({
      model: RESEARCH_MODEL,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] // Enable Google Search grounding
      },
      contents: prompt
    });

    let text = response.text || '';
    
    // Extract the JSON array from the response text
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('[AI Research Error] Failed to research topics:', error);
    // Return high quality fallback topics if search/AI fails
    return [
      {
        title: "How to Master Loksewa GK & Law Papers with AI Active Recall",
        excerpt: "Discover how active recall and space repetition using artificial intelligence can double your GK retention rate.",
        category: "Strategy",
        reason: "GK and Law are the highest yield yet hardest sections to retain for aspirants.",
        suggestedKeywords: ["Loksewa GK preparation", "active recall study tips", "Nepal PSC law study guide", "Loksewa AI"]
      },
      {
        title: "Latest Loksewa Vacancies 2026: Qualification Criteria & Syllabus Breakdown",
        excerpt: "A complete walkthrough of the newest PSC job openings in Nepal, key dates, and syllabus analysis.",
        category: "Vacancy",
        reason: "Aspirants always search for vacancy details and key form-filling updates.",
        suggestedKeywords: ["loksewa vacancy 2026", "sakha adhikrit syllabus", "nayab subba vacancy nepal", "loksewa online tayari"]
      }
    ];
  }
}

/**
 * Generates a full SEO & AEO optimized blog post markdown based on the approved topic.
 */
export async function generateBlogPost(topic: string, category: string): Promise<{
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}> {
  const systemInstruction = `You are an expert content marketer, SEO/AEO specialist, and Nepali PSC (Public Service Commission) education coach.
Write a comprehensive, professional, and engaging blog post about the selected Loksewa Ayog Nepal topic.

The post MUST satisfy the following requirements:
1. **Format**: Output in Markdown format. Use clear H2 and H3 headings, bullet points, bold/italic highlights, and at least one structured markdown table comparing aspects (e.g. syllabus breakdown, time allocation, or exam structures).
2. **Deep Links & Calls-to-Action**: Strategically insert markdown links back to the LoksewaAI platform (use exactly 'https://loksewaai.com/' for the home/signup pages, '/auth/signup' for signing up, or '/blog/how-to-use-loksewa-ai' for the mastery guide).
   - Promote platform features naturally:
     - **Dynamic Study Plan**: Customize schedules that adapt if study days are missed.
     - **Syllabus & Note Generator**: Upload syllabus PDFs/photos to extract notes.
     - **Active Recall Quizzes**: Solve smart MCQs generated by AI from uploaded study materials.
     - **Loksewa Guru**: Ask constitutional, administrative, or legal questions to the Nepali specialized AI Tutor.
3. **SEO & AEO (Answer Engine Optimization)**:
   - Make the tone authoritative yet accessible.
   - Include direct, concise answers for common search queries to optimize for featured snippets and AI search engines (like Perplexity or Google Search Generative Experience).
   - End with a dedicated "Frequently Asked Questions (FAQ)" section containing 3-4 H3 questions and clear, direct answers.
4. **Tone**: Educational, motivating, and professional. You can use English for the post, but feel free to refer to Nepalese administrative terms (e.g., Sakha Adhikrit, Nayab Subba, Kharidar, local level exams).

Ensure you use the Google Search tool to search for real, actual data for this topic (e.g., current syllabus, official PSC vacancies, exam formats, deadlines, and guidelines). DO NOT use placeholder, hallucinated, or dummy data. Every statistic, syllabus structure, and date must represent the real and current PSC Nepal context.

Ensure the final output is returned in a raw JSON format containing these fields:
- title: The final headline of the post.
- excerpt: A engaging 2-sentence summary card intro.
- content: The complete blog post markdown body (all headings, tables, links, FAQ).
- readTime: Estimated reading time (e.g., "7 min read").
- seoTitle: A perfect, catchy title tag (< 60 chars).
- seoDescription: A meta description (< 160 chars) targeting searchers.
- seoKeywords: A list of 6-8 relevant keywords.

Return ONLY the raw JSON. Do not include markdown code fences or backticks.`;

  const prompt = `Topic: "${topic}"\nCategory: "${category}"\n\nPlease search the web and generate a detailed blog post using real, official PSC Nepal data matching this topic.`;

  try {
    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] // Enable Google Search grounding for real data fetching
      },
      contents: prompt
    });

    let text = response.text || '';
    
    // Extract the JSON object from the response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('[AI Generation Error] Failed to generate blog post:', error);
    throw error;
  }
}
