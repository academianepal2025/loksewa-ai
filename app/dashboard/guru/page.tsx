'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRotatingMessages } from '@/lib/hooks';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Send,
  Sparkles,
  Plus,
  History,
  ChevronDown,
  X,
  BookOpen,
  FileText,
  ScrollText,
  MessageSquare,
  ArrowDown,
} from 'lucide-react';

import { UsageIndicator } from '@/components/dashboard/UsageIndicator';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { TacticalPrompt } from '@/components/dashboard/TacticalPrompt';

// ── Types ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface Exam {
  id: string;
  exam_name: string;
}

interface ConversationGroup {
  date: string;
  firstMessage: string;
  messages: ChatMessage[];
}

// ── Suggested Questions ───────────────────────────────────────────────
const getSuggestedQuestions = (t: any) => [
  { text: t('guru_suggested_1'), icon: BookOpen },
  { text: t('guru_suggested_2'), icon: Sparkles },
  { text: t('guru_suggested_3'), icon: ScrollText },
  { text: t('guru_suggested_4'), icon: FileText },
];

// ── Guru Avatar ───────────────────────────────────────────────────────
function GuruAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  const iconDims = size === 'lg' ? 'h-8 w-8' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className={`${dims} rounded-xl bg-[#1e3a5f] text-[#c9a84c] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1e3a5f]/10`}>
      <Sparkles className={iconDims} />
    </div>
  );
}

// ── Thinking Indicator ────────────────────────────────────────────────
function ThinkingIndicator({ t }: { t: any }) {
  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto">
      <GuruAvatar size="sm" />
      <div className="bg-surface border border-border-subtle rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black text-subtle uppercase tracking-widest">{t('guru_processing')}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble (Full-width style) ─────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const sourceTag = !isUser ? detectSource(message.content) : null;

  return (
    <div className={`py-5 ${isUser ? '' : 'bg-surface/50'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          {isUser ? (
            <div className="h-7 w-7 rounded-xl bg-[#1e3a5f] text-[#c9a84c] border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-black uppercase tracking-widest shadow-sm">
              YOU
            </div>
          ) : (
            <GuruAvatar size="sm" />
          )}

          {/* Content */}
          <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
            {/* Source Tag */}
            {sourceTag && (
              <div className="flex items-center gap-1.5 mb-2">
                <sourceTag.icon className="h-3 w-3 text-[#c9a84c]" />
                <span className="text-[10px] font-black text-[#c9a84c] uppercase tracking-[0.15em]">{sourceTag.label}</span>
              </div>
            )}

            <div className={`inline-block text-left reading-area prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.8] font-medium prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground ${
              isUser
                ? 'bg-[#1e3a5f] text-[#c9a84c] px-5 py-3 rounded-2xl rounded-br-sm shadow-lg shadow-[#1e3a5f]/10 border border-[#c9a84c]/10'
                : 'text-foreground'
            }`}>
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              )}
            </div>

            {message.created_at && (
              <p className={`text-[9px] font-black text-muted/50 mt-2 uppercase tracking-widest ${isUser ? 'text-right' : ''}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function detectSource(content: string): { label: string; icon: typeof BookOpen } | null {
  const lower = content.toLowerCase();
  if (lower.includes('previous year') || lower.includes('pyq') || lower.includes('past exam'))
    return { label: 'From your PYQs', icon: ScrollText };
  if (lower.includes('syllabus') || lower.includes('curriculum') || lower.includes('पाठ्यक्रम'))
    return { label: 'From Syllabus', icon: BookOpen };
  if (lower.includes('notes') || lower.includes('नोट'))
    return { label: 'From your Notes', icon: FileText };
  return null;
}

// ── Chat History Panel ────────────────────────────────────────────────
function ChatHistoryPanel({
  conversations,
  onSelect,
  onClose,
  t,
}: {
  conversations: ConversationGroup[];
  onSelect: (msgs: ChatMessage[]) => void;
  onClose: () => void;
  t: any;
}) {
  return (
    <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-xl flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-5 border-b border-border-subtle">
        <h3 className="text-sm font-black text-foreground flex items-center gap-3 uppercase tracking-widest">
          <History className="h-4 w-4 text-[#c9a84c]" />
          {t('guru_history')}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors">
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-8 w-8 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-black text-[10px] uppercase tracking-widest">{t('guru_no_history')}</p>
          </div>
        ) : (
          conversations.slice(0, 10).map((convo, i) => (
            <button
              key={i}
              onClick={() => onSelect(convo.messages)}
              className="w-full text-left p-4 bg-surface border border-border-subtle rounded-xl hover:border-accent/30 transition-all group shadow-sm"
            >
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{convo.date}</p>
              <p className="text-xs font-black text-foreground truncate group-hover:text-[#c9a84c] transition-colors uppercase tracking-widest">{convo.firstMessage}</p>
              <p className="text-[9px] text-muted mt-1 uppercase font-black tracking-widest">{convo.messages.length} {t('guru_transmissions')}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function GuruPage() {
  return (
    <Suspense fallback={<div className="p-32 flex justify-center"><div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <GuruContent />
    </Suspense>
  );
}

function GuruContent() {
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { showUpgradeModal } = useUpgradeModal();
  const { t, language } = useDashboard();

  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pastConversations, setPastConversations] = useState<ConversationGroup[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [processedParam, setProcessedParam] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: examsData } = await supabase
        .from('user_exams')
        .select('id, exam_name')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      if (examsData && examsData.length > 0) {
        setExams(examsData);
        setActiveExamId(examsData[0].id);
      }
    };
    init();
  }, [supabase]);

  const checkLimits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const res = await fetch('/api/check-limits');
    const data = await res.json();
    if (data.plan === 'free' && data.limits.chat.exceeded) {
      setIsLimitReached(true);
    } else {
      setIsLimitReached(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkLimits();
    window.addEventListener('usage-updated', checkLimits);
    return () => window.removeEventListener('usage-updated', checkLimits);
  }, [checkLimits]);

  // ── Load chat history when exam changes ─────────────────────────
  const loadHistory = useCallback(async (updateActive = false) => {
    if (!userId || !activeExamId) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .eq('exam_id', activeExamId)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const groups: ConversationGroup[] = [];
      let currentGroup: ChatMessage[] = [];
      let lastTime = 0;

      data.forEach((msg: any) => {
        const msgTime = new Date(msg.created_at).getTime();
        if (lastTime && msgTime - lastTime > 10 * 60 * 1000 && currentGroup.length > 0) {
          const firstUserMsg = currentGroup.find(m => m.role === 'user');
          groups.push({
            date: new Date(currentGroup[0].created_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            firstMessage: firstUserMsg?.content || 'Conversation',
            messages: [...currentGroup],
          });
          currentGroup = [];
        }
        currentGroup.push(msg);
        lastTime = msgTime;
      });

      if (currentGroup.length > 0) {
        const firstUserMsg = currentGroup.find(m => m.role === 'user');
        groups.push({
          date: new Date(currentGroup[0].created_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          firstMessage: firstUserMsg?.content || 'Conversation',
          messages: currentGroup,
        });
      }

      setPastConversations([...groups].reverse());

      if (updateActive && groups.length > 0) {
        setMessages(groups[groups.length - 1].messages);
      }
    } else {
      if (updateActive) setMessages([]);
      setPastConversations([]);
    }
  }, [supabase, userId, activeExamId]);

  useEffect(() => {
    loadHistory(true);
  }, [loadHistory]);

  // ── Real-time Chat Sync ─────────────────────────────────────────
  useEffect(() => {
    if (!userId || !activeExamId) return;
    let currentChannel: any = null;

    const setup = async () => {
      const channelName = `realtime_chats_${activeExamId}`;
      
      // Remove any existing channel with same name
      const existing = supabase.getChannels().find((c: any) => c.name === channelName);
      if (existing) await supabase.removeChannel(existing);

      currentChannel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId}`,
        }, () => { loadHistory(false); })
        .subscribe();
    };

    setup();

    return () => {
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [userId, activeExamId, supabase, loadHistory]);

  // ── Auto-scroll ─────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // ── Scroll detection ────────────────────────────────────────────
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      setShowScrollBtn(!isNearBottom);
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // ── Send message ────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeExamId || !userId || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const historyForApi = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          examId: activeExamId,
          userId,
          conversationHistory: historyForApi,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error === 'limit_reached') {
          if (errorData.is_pro) {
             toast.error(errorData.message || 'You have reached your daily guru limit. Come back tomorrow for more.');
          } else {
             showUpgradeModal('chat_limit');
          }
          setIsStreaming(false);
          setMessages(prev => prev.slice(0, -1)); // Remove the user message
          return;
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      const assistantMessage: ChatMessage = { role: 'assistant', content: '', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText };
          return updated;
        });
      }
      
      // Refresh usage UI
      window.dispatchEvent(new CustomEvent('usage-updated'));
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let friendlyMessage = `⚠️ Error: ${error.message}. Please try again.`;
      
      const errorStr = error.message?.toLowerCase() || '';
      if (errorStr.includes('503') || errorStr.includes('429') || errorStr.includes('high demand') || errorStr.includes('quota') || errorStr.includes('unavailable')) {
        friendlyMessage = "Server Busy: नमस्ते! Loksewa AI is currently at full capacity helping other students. Please try again in a few moments! 🙏";
      }

      toast.error('Tactical Link Failed', { description: error.message });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: friendlyMessage,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [activeExamId, userId, isStreaming, messages, supabase]);

  // ── Handle Query Params ─────────────────────────────────────────
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg && activeExamId && userId && !processedParam) {
      setProcessedParam(true);
      sendMessage(msg);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, activeExamId, userId, processedParam, sendMessage]);

  // ── New Chat ────────────────────────────────────────────────────
  const startNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        setPastConversations(prev => [
          ...prev,
          {
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            firstMessage: firstUserMsg.content,
            messages: [...messages],
          },
        ]);
      }
    }
    setMessages([]);
    window.history.replaceState({}, '', window.location.pathname);
    inputRef.current?.focus();
  };

  // ── Keyboard handler ────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const hasMessages = messages.length > 0;

  return (
    /* Break out of the dashboard layout padding with negative margins */
    <div className="-mx-4 sm:-mx-8 lg:-mx-10 -mb-32 md:-mb-12 flex flex-col relative h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)]">
      
      {/* ── Slim Top Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <GuruAvatar size="md" />
          <div className="min-w-0">
            <h1 className="text-sm font-black text-foreground tracking-tighter uppercase">{t('guru_title')}</h1>
            <p className="text-[9px] font-black text-[#c9a84c] uppercase tracking-widest">
              {isStreaming ? t('guru_status_thinking') : t('guru_status_active')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Exam Selector */}
          {exams.length > 1 && (
            <div className="relative">
              <select
                value={activeExamId || ''}
                onChange={(e) => { setActiveExamId(e.target.value); setMessages([]); }}
                className="appearance-none bg-surface text-foreground border border-border-subtle rounded-lg px-3 py-2 pr-8 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent/40 focus:outline-none cursor-pointer min-h-[36px] shadow-sm"
              >
                {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-subtle pointer-events-none" />
            </div>
          )}

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg bg-surface border border-border-subtle text-subtle hover:text-[#c9a84c] hover:border-[#c9a84c]/20 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center shadow-sm"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1e3a5f] text-[#c9a84c] text-[10px] font-black hover:opacity-90 transition-all min-h-[36px] shadow-sm shadow-[#1e3a5f]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase tracking-widest">{t('guru_new_chat')}</span>
          </button>
        </div>
      </div>

      {/* ── Chat History Panel ────────────────────────────────────── */}
      {showHistory && (
        <ChatHistoryPanel
          conversations={pastConversations}
          onSelect={(msgs) => { setMessages(msgs); setShowHistory(false); }}
          onClose={() => setShowHistory(false)}
          t={t}
        />
      )}

      {/* ── Messages Area (Full width, centered content) ──────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth relative"
      >
        {!hasMessages ? (
          /* ── Empty State ─────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center min-h-full text-center px-6 py-16">
            <div className="mb-6">
              <GuruAvatar size="lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter mb-2 uppercase">
              {t('guru_empty_title')}
            </h2>
            <p className="text-[10px] text-subtle font-black uppercase tracking-widest max-w-lg mb-10 leading-relaxed">
              {t('guru_empty_subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {getSuggestedQuestions(t).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q.text)}
                  disabled={isStreaming}
                  className="flex items-start gap-3 p-4 bg-surface border border-border-subtle rounded-xl text-left hover:border-accent/40 transition-all group active:scale-[0.99] disabled:opacity-50 min-h-[64px]"
                >
                  <div className="p-2 bg-background border border-border-subtle rounded-lg group-hover:bg-[#1e3a5f] group-hover:text-[#c9a84c] group-hover:border-[#c9a84c]/30 transition-colors flex-shrink-0">
                    <q.icon className="h-4 w-4 text-subtle group-hover:text-current" />
                  </div>
                  <span className="text-[11px] font-black text-subtle group-hover:text-foreground leading-snug mt-1 uppercase tracking-widest">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message List (full-width rows, centered content) ───── */
          <div className="py-2">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="py-5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                  <ThinkingIndicator t={t} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Scroll to bottom FAB */}
        {showScrollBtn && hasMessages && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 z-20 p-2.5 bg-[#1e3a5f] text-[#c9a84c] rounded-full shadow-lg hover:scale-110 transition-transform shadow-[#1e3a5f]/20"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Input Area (pinned to bottom, full width) ──────────────── */}
      <div className="flex-shrink-0 border-t border-border-subtle bg-background/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 px-1">
             <UsageIndicator type="chat" />
          </div>
          <div className="flex items-end gap-2 bg-surface border border-border-subtle rounded-2xl p-2 focus-within:border-[#c9a84c]/40 transition-all shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLimitReached ? "Daily limit reached. Upgrade to Pro for more." : t('guru_placeholder')}
              disabled={isStreaming || isLimitReached}
              rows={1}
              className="flex-1 bg-transparent px-3 py-2.5 text-[15px] font-medium text-foreground placeholder:text-subtle disabled:opacity-50 resize-none leading-relaxed min-h-[44px] max-h-[160px]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim() || isLimitReached}
              className="p-3 bg-[#1e3a5f] text-[#c9a84c] rounded-xl hover:opacity-90 transition-all active:scale-90 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 shadow-lg shadow-[#1e3a5f]/10"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-subtle/60 font-bold mt-2 tracking-wider uppercase">
            {t('guru_ai_disclaimer')}
          </p>
        </div>
      </div>
      {/* Contextual Guidance */}
      <TacticalPrompt 
        id="guru_chat_tip"
        title="Chat with Your Guru"
        message="Stuck on a topic? Ask the Guru to explain anything from your study materials in simple words."
        type="intel"
        delay={5000}
      />
    </div>
  );
}
