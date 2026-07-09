'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Wand2, Save, X, Eye, Edit3, Loader2, Sparkles, Check, 
  HelpCircle, Link as LinkIcon, Image as ImageIcon, Search, ArrowRight 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  read_time: string;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
}

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: 'Vacancy',
    author: 'Loksewa AI Team',
    read_time: '5 min read',
    is_published: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  
  // AI related states
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopics, setAiTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        seo_keywords: post.seo_keywords || []
      });
    }
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title if modifying title and not editing existing post
      if (name === 'title' && !post) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      return updated;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, seo_keywords: keywords }));
  };

  // Trigger web scraping and trending topic research
  const handleAiResearch = async () => {
    setIsSearching(true);
    setAiTopics([]);
    try {
      const response = await fetch('/api/admin/blogs/ai-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      if (data.success) {
        setAiTopics(data.topics || []);
        toast.success('AI found trending Loksewa topics!');
      } else {
        toast.error(data.error || 'Failed to research topics');
      }
    } catch (err) {
      toast.error('Error during AI research');
    } finally {
      setIsSearching(false);
    }
  };

  // Generate full blog content using selected topic
  const handleAiGenerate = async (topicTitle: string, topicCategory: string) => {
    setIsGenerating(true);
    setSelectedTopic(topicTitle);
    try {
      const response = await fetch('/api/admin/blogs/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicTitle, category: topicCategory })
      });
      const data = await response.json();
      if (data.success && data.draft) {
        const draft = data.draft;
        setFormData(prev => ({
          ...prev,
          title: draft.title,
          slug: draft.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          excerpt: draft.excerpt,
          content: draft.content,
          category: topicCategory,
          read_time: draft.readTime || '6 min read',
          seo_title: draft.seoTitle || draft.title,
          seo_description: draft.seoDescription || draft.excerpt,
          seo_keywords: draft.seoKeywords || []
        }));
        setAiTopics([]);
        toast.success('Blog post generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate blog content');
      }
    } catch (err) {
      toast.error('Error generating blog content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const url = post ? `/api/admin/blogs/${post.id}` : '/api/admin/blogs';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(post ? 'Blog post updated!' : 'Blog post created!');
        onSave();
      } else {
        toast.error(data.error || 'Failed to save blog post');
      }
    } catch (err) {
      toast.error('Network error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-500" />
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <p className="text-xs text-subtle mt-1">
            Write SEO-optimized blog posts directly or use our grounding AI pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-background hover:bg-background/80 text-subtle hover:text-foreground rounded-xl text-xs font-bold transition-all border border-border-subtle"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Post
          </button>
        </div>
      </div>

      {/* AI Grounding / Scraper Tools */}
      {!post && (
        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <h3 className="text-sm font-bold text-foreground">AI Grounded Writer</h3>
                <p className="text-xs text-subtle">
                  Scrape recent Nepal Loksewa vacancies, guidelines, and changes to recommend topics and write posts.
                </p>
                <div className="pt-2 flex gap-2 w-full max-w-xl">
                  <input 
                    type="text"
                    placeholder="Enter custom topic to scrape/research (e.g. Nayab Subba Syllabus changes) (Optional)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiResearch}
              disabled={isSearching || isGenerating}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-500/20 whitespace-nowrap self-end md:self-center"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scrapes in progress...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Scrape & Find Trends
                </>
              )}
            </button>
          </div>

          {/* AI Generated Topic List */}
          {aiTopics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {aiTopics.map((topic, i) => (
                <div key={i} className="bg-surface border border-border-subtle p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-indigo-500/30 transition-all">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[9px] font-black uppercase tracking-wider rounded-full">
                      {topic.category}
                    </span>
                    <h4 className="font-bold text-xs text-foreground mt-2 leading-tight">{topic.title}</h4>
                    <p className="text-[11px] text-subtle mt-1 line-clamp-3">{topic.excerpt}</p>
                    <div className="mt-2 text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                      💡 {topic.reason}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiGenerate(topic.title, topic.category)}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-indigo-600/10"
                  >
                    {isGenerating && selectedTopic === topic.title ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>Approve & Generate <ArrowRight className="h-3 w-3" /></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Loksewa Vacancies 2026 for Officer"
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. loksewa-vacancies-2026-officer"
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="Vacancy">Vacancy</option>
              <option value="Strategy">Strategy</option>
              <option value="Insights">Insights</option>
              <option value="Tutorial">Tutorial</option>
              <option value="News">News</option>
            </select>
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Read Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Read Time</label>
            <input
              type="text"
              name="read_time"
              value={formData.read_time}
              onChange={handleChange}
              placeholder="e.g. 5 min read"
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-subtle" />
            Image URL / Imgur Link
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="Paste public image link here (e.g. https://i.imgur.com/... or /blog/guide.jpg)"
            className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Excerpt / Summary *</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Write a brief intro to display on cards..."
            rows={2}
            className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all resize-y"
            required
          />
        </div>

        {/* Markdown Content Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Post Content (Markdown supported) *</label>
            <div className="flex gap-2 bg-background border border-border-subtle rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'write' ? 'bg-indigo-600 text-white shadow-sm' : 'text-subtle hover:text-foreground'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-subtle hover:text-foreground'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="# Use standard Markdown headers, lists, tables, and links..."
              rows={16}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-indigo-500 transition-all resize-y"
              required
            />
          ) : (
            <div className="prose prose-indigo max-w-none bg-background text-foreground border border-border-subtle rounded-xl p-6 min-h-[350px] overflow-y-auto">
              {formData.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-subtle italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        {/* SEO / AEO Section */}
        <div className="bg-background/60 border border-border-subtle rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] border-b border-border-subtle pb-2">
            SEO & Answer Engine Optimization (AEO)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">SEO Title Tag</label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                placeholder="Ideal search engine title"
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Keywords (comma-separated)</label>
              <input
                type="text"
                value={formData.seo_keywords.join(', ')}
                onChange={handleKeywordsChange}
                placeholder="loksewa preparation, PSC nepal, study tips"
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Meta Description (AEO snippet)</label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              placeholder="Short search summary providing a direct answer to common search queries..."
              rows={2}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all resize-y"
            />
          </div>
        </div>

        {/* Publication Toggle */}
        <div className="flex items-center justify-between bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5">
          <div>
            <h4 className="text-sm font-bold text-foreground">Publish to Blog Section</h4>
            <p className="text-xs text-subtle mt-0.5">
              If enabled, this blog post will instantly go live on the public landing page blog.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-background border border-border-subtle rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-subtle peer-checked:after:bg-white after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600"></div>
          </label>
        </div>
      </form>
    </div>
  );
}
