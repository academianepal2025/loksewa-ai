'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, ArrowRight, BookOpen, GraduationCap, Sparkles, AlertCircle } from 'lucide-react';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  image_url: string | null;
}

interface BlogContainerProps {
  posts: BlogPost[];
}

const categories = ['All', 'Tutorial', 'Strategy', 'Insights', 'Vacancy', 'News'];

const categoryIcons: Record<string, any> = {
  Tutorial: Sparkles,
  Strategy: GraduationCap,
  Insights: Clock,
  Vacancy: BookOpen,
  News: Calendar
};

export function BlogContainer({ posts }: BlogContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Featured post is the first post from the filtered list (or of all posts if nothing is filtered)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const FeaturedIcon = featuredPost ? (categoryIcons[featuredPost.category] || BookOpen) : BookOpen;

  return (
    <div className="space-y-16">
      {/* Search and Category Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-border-subtle">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? 'bg-[#c9a84c] text-[#1e3a5f] shadow-lg shadow-[#c9a84c]/20 scale-105'
                    : 'bg-surface border border-border-subtle text-subtle hover:text-foreground hover:border-foreground/20'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 order-1 md:order-2">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-2xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-[#c9a84c] transition-all"
          />
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-subtle" />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-surface rounded-[3rem] border border-border-subtle max-w-xl mx-auto px-6">
          <AlertCircle className="h-16 w-16 text-[#c9a84c] mx-auto mb-6" />
          <h3 className="text-2xl font-black text-foreground mb-3">No articles found</h3>
          <p className="text-subtle font-medium leading-relaxed">
            We couldn't find any articles matching your search query or selected category. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-6 px-6 py-3 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Featured Post Card */}
          {featuredPost && (
            <div className="group bg-surface rounded-[3.5rem] border border-border-subtle overflow-hidden hover:border-[#c9a84c]/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5">
              <Link href={`/blog/${featuredPost.slug}`} className="grid grid-cols-1 lg:grid-cols-12">
                {/* Image Section */}
                <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-background/50 relative overflow-hidden flex items-center justify-center min-h-[300px] lg:min-h-[480px]">
                  {featuredPost.image_url ? (
                    <img
                      src={featuredPost.image_url}
                      alt={featuredPost.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[#1e3a5f] opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <FeaturedIcon className="h-40 w-40 text-[#c9a84c] relative z-10 transition-transform duration-500 group-hover:scale-110" />
                    </>
                  )}
                  <div className="absolute top-8 left-8 z-20">
                    <span className="px-5 py-2 bg-[#c9a84c] text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                      Featured • {featuredPost.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-6 text-[10px] font-black text-subtle uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {featuredPost.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> {featuredPost.readTime}
                    </div>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6 leading-tight group-hover:text-[#c9a84c] transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-subtle font-medium leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-xs font-black uppercase tracking-widest text-[#c9a84c] group-hover:gap-2 transition-all duration-300">
                    Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Regular Posts Grid (3 Columns) */}
          {regularPosts.length > 0 && (
            <div className="space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-subtle">
                More Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => {
                  const PostIcon = categoryIcons[post.category] || BookOpen;
                  return (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="flex">
                      <article className="group bg-surface rounded-[2.5rem] border border-border-subtle overflow-hidden hover:border-[#c9a84c]/30 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col w-full">
                        {/* Image Container */}
                        <div className="aspect-[16/10] bg-background/50 relative overflow-hidden flex items-center justify-center">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-[#1e3a5f] opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
                              <PostIcon className="h-20 w-20 text-[#c9a84c] relative z-10 transition-transform duration-500 group-hover:scale-110" />
                            </>
                          )}
                          <div className="absolute top-6 left-6 z-20">
                            <span className="px-4 py-1.5 bg-[#c9a84c] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-4 text-[9px] font-black text-subtle uppercase tracking-widest mb-4">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" /> {post.date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> {post.readTime}
                              </span>
                            </div>
                            <h4 className="text-xl font-black text-foreground mb-4 leading-snug group-hover:text-[#c9a84c] transition-colors duration-300">
                              {post.title}
                            </h4>
                            <p className="text-subtle text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#c9a84c] group-hover:gap-1.5 transition-all duration-300">
                            Read Article <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
