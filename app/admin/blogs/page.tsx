'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, Globe, EyeOff, 
  Sparkles, Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight,
  AlertTriangle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BlogEditor from '@/components/admin/BlogEditor';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface BlogPost {
  id: string;
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
  created_at: string;
  published_at?: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState('');

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  // Deletion modal states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        category,
        is_published: isPublished
      });

      const response = await fetch(`/api/admin/blogs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data || []);
        setCount(data.count || 0);
      } else {
        toast.error(data.error || 'Failed to fetch blogs');
      }
    } catch (err) {
      toast.error('Network error fetching blogs');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, isPublished]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Toggle publication status directly from the list
  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blogs/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          is_published: !post.is_published
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(post.is_published ? 'Post unpublished!' : 'Post published!');
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to update publication status');
      }
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/admin/blogs/${deletingId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Blog post deleted successfully!');
        setDeletingId(null);
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to delete blog post');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(count / 10);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <BlogEditor
          post={currentPost}
          onSave={() => {
            setIsEditing(false);
            setCurrentPost(null);
            fetchBlogs();
          }}
          onCancel={() => {
            setIsEditing(false);
            setCurrentPost(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Blog CMS</h1>
          <p className="text-xs text-subtle mt-1">
            Manage landing page blogs, vacancies, strategies, and AI-grounded articles.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPost(null);
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" /> Create New Post
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border-subtle p-5 rounded-2xl flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-subtle" />
          <input
            type="text"
            placeholder="Search by title or excerpt..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border-subtle rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all min-w-[150px]"
        >
          <option value="">All Categories</option>
          <option value="Vacancy">Vacancy</option>
          <option value="Strategy">Strategy</option>
          <option value="Insights">Insights</option>
          <option value="Tutorial">Tutorial</option>
          <option value="News">News</option>
        </select>

        {/* Status */}
        <select
          value={isPublished}
          onChange={(e) => { setIsPublished(e.target.value); setPage(1); }}
          className="bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        {/* Refresh */}
        <button
          onClick={fetchBlogs}
          className="p-3 bg-background hover:bg-background/80 text-subtle hover:text-foreground rounded-xl transition-all border border-border-subtle"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Blogs Table / Grid */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-subtle uppercase tracking-widest font-bold">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-subtle mx-auto mb-4" />
            <p className="text-base font-bold text-foreground">No blog posts found</p>
            <p className="text-xs text-subtle mt-1">Start by creating a new post or generating one with AI!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-background/30 text-[10px] font-black uppercase tracking-widest text-subtle">
                  <th className="px-6 py-4">Title / Category</th>
                  <th className="px-6 py-4">Author / Read Time</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-background/20 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 bg-background rounded-lg border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                          {blog.image_url ? (
                            <img src={blog.image_url} alt="" className="object-cover h-full w-full" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-subtle" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-xs sm:max-w-md">{blog.title}</p>
                          <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded mt-1.5">
                            {blog.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Author & Read Time */}
                    <td className="px-6 py-5">
                      <p className="font-medium text-foreground">{blog.author}</p>
                      <p className="text-xs text-subtle flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {blog.read_time}
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-5 text-xs text-subtle">
                      <p>Created: {format(new Date(blog.created_at), 'yyyy-MM-dd')}</p>
                      {blog.published_at && (
                        <p className="text-emerald-500 font-medium mt-1">
                          Published: {format(new Date(blog.published_at), 'yyyy-MM-dd')}
                        </p>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          blog.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                        }`}
                      >
                        {blog.is_published ? (
                          <>
                            <Globe className="h-3.5 w-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setCurrentPost(blog);
                          setIsEditing(true);
                        }}
                        className="p-2 hover:bg-indigo-500/10 text-subtle hover:text-indigo-500 rounded-xl transition-all border border-transparent hover:border-indigo-500/10"
                        title="Edit Blog"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(blog.id)}
                        className="p-2 hover:bg-red-500/10 text-subtle hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                        title="Delete Blog"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-background/10 border-t border-border-subtle flex items-center justify-between">
            <p className="text-xs text-subtle">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, count)} of {count} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 bg-background hover:bg-background/80 text-subtle hover:text-foreground rounded-xl border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 bg-background hover:bg-background/80 text-subtle hover:text-foreground rounded-xl border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post?"
        description="Are you absolutely sure you want to delete this blog post? This action is permanent and cannot be undone."
      />
    </div>
  );
}
