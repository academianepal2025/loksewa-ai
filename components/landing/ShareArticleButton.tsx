'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, ExternalLink, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareArticleButtonProps {
  title: string;
  url?: string;
  slug?: string;
  variant?: 'button' | 'icon';
}

export function ShareArticleButton({ title, url, slug, variant = 'button' }: ShareArticleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct absolute URL
  const articleUrl = url || (typeof window !== 'undefined' 
    ? `${window.location.origin}/blog/${slug || ''}`
    : `https://loksewaai.com/blog/${slug || ''}`);

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  const socialPlatforms = [
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      shareUrl: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
      icon: <MessageCircle className="w-5 h-5" />,
      shareUrl: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      color: 'bg-[#0A66C2] text-white hover:bg-[#09519a]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] text-white hover:bg-[#1d89bd]',
      icon: <Send className="w-4 h-4" />,
      shareUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast.success('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: articleUrl,
        });
        return;
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setIsOpen(true);
        }
        return;
      }
    }
    setIsOpen(true);
  };

  const handleSocialClick = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    setIsOpen(false);
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={handleNativeShare}
          title="Share Article"
          className="p-2.5 bg-surface border border-border-subtle rounded-xl text-subtle hover:text-foreground hover:bg-surface-elevated transition-all"
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1e3a5f]/20 cursor-pointer"
        >
          <Share2 className="h-4 w-4" /> Share Article
        </button>
      )}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-background border border-border-subtle w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Share Article</h3>
                  <p className="text-xs text-subtle truncate max-w-[240px]">{title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-subtle hover:text-foreground rounded-full hover:bg-surface transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Social Share Grid */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-subtle uppercase tracking-wider">Share via social media</p>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialClick(platform.shareUrl)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-sm ${platform.color}`}
                  >
                    {platform.icon}
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-subtle uppercase tracking-wider">Or copy link</p>
              <div className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border-subtle">
                <input
                  type="text"
                  readOnly
                  value={articleUrl}
                  className="flex-1 bg-transparent text-xs text-foreground outline-none px-2 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c] text-[#1e3a5f] font-black text-xs rounded-lg uppercase tracking-wider hover:opacity-90 transition-all shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
