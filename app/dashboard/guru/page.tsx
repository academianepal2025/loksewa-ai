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
const SUGGESTED_QUESTIONS = [
  { text: 'What are my most important syllabus topics?', icon: BookOpen },
  { text: 'Quiz me on today\'s study topic', icon: Sparkles },
  { text: 'What topics appear most in my PYQs?', icon: ScrollText },
  { text: 'Summarize my weakest area', icon: FileText },
];

// ── Guru Avatar ───────────────────────────────────────────────────────
function GuruAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  const iconDims = size === 'lg' ? 'h-8 w-8' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className={`${dims} rounded-xl bg-orange-600 text-background flex items-center justify-center flex-shrink-0`}>
      <Sparkles className={iconDims} />
    </div>
  );
}

// ── Thinking Indicator ────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto">
      <GuruAvatar size="sm" />
      <div className="bg-surface border border-border-subtle rounded-2xl rounded-tl-sm px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold text-subtle uppercase tracking-wider">Thinking</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
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
            <div className="h-7 w-7 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 text-xs font-black">
              U
            </div>
          ) : (
            <GuruAvatar size="sm" />
          )}

          {/* Content */}
          <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
            {/* Source Tag */}
            {sourceTag && (
              <div className="flex items-center gap-1.5 mb-2">
                <sourceTag.icon className="h-3 w-3 text-orange-600" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.15em]">{sourceTag.label}</span>
              </div>
            )}

            <div className={`inline-block text-left reading-area prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.8] font-medium prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground ${
              isUser
                ? 'bg-orange-600 text-background px-5 py-3 rounded-2xl rounded-br-sm'
                : 'text-foreground'
            }`}>
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              )}
            </div>

            {message.created_at && (
              <p className={`text-[10px] font-bold text-muted/50 mt-2 ${isUser ? 'text-right' : ''}`}>
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
}: {
  conversations: ConversationGroup[];
  onSelect: (msgs: ChatMessage[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-xl flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-5 border-b border-border-subtle">
        <h3 className="text-base font-bold text-foreground flex items-center gap-3">
          <History className="h-4 w-4 text-accent" />
          Chat History
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors">
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-8 w-8 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-bold text-sm">No previous conversations</p>
          </div>
        ) : (
          conversations.slice(0, 10).map((convo, i) => (
            <button
              key={i}
              onClick={() => onSelect(convo.messages)}
              className="w-full text-left p-4 bg-surface border border-border-subtle rounded-xl hover:border-accent/30 transition-all group"
            >
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{convo.date}</p>
              <p className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{convo.firstMessage}</p>
              <p className="text-[11px] text-muted mt-0.5">{convo.messages.length} messages</p>
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
    let channel: any;
    let mounted = true;

    async function setupRealtime() {
      if (!userId || !activeExamId) return;

      const channelName = `realtime_chats_${activeExamId}`;
      
      const existing = supabase.getChannels().find((c: any) => c.name === channelName);
      if (existing) await supabase.removeChannel(existing);

      if (!mounted) return;

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            if (mounted) loadHistory(false);
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
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
    <div className="-mx-4 sm:-mx-8 lg:-mx-10 -mt-4 sm:-mt-8 lg:-mt-10 -mb-32 md:-mb-12 flex flex-col relative" style={{ height: 'calc(100vh - 4rem)' }}>
      
      {/* ── Slim Top Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <GuruAvatar size="md" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground tracking-tight">Loksewa Guru</h1>
            <p className="text-[9px] font-bold text-accent uppercase tracking-wider">
              {isStreaming ? 'Responding...' : 'Online'}
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
                className="appearance-none bg-surface text-foreground border border-border-subtle rounded-lg px-3 py-2 pr-8 text-[10px] font-bold focus:ring-1 focus:ring-accent/40 focus:outline-none cursor-pointer min-h-[36px]"
              >
                {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-subtle pointer-events-none" />
            </div>
          )}

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg bg-surface border border-border-subtle text-subtle hover:text-accent hover:border-accent/20 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 text-background text-[10px] font-bold hover:opacity-90 transition-all min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase tracking-wider">New</span>
          </button>
        </div>
      </div>

      {/* ── Chat History Panel ────────────────────────────────────── */}
      {showHistory && (
        <ChatHistoryPanel
          conversations={pastConversations}
          onSelect={(msgs) => { setMessages(msgs); setShowHistory(false); }}
          onClose={() => setShowHistory(false)}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
              नमस्ते! <span className="text-accent">I&apos;m Loksewa Guru</span>
            </h2>
            <p className="text-subtle text-sm font-medium max-w-lg mb-10 leading-relaxed">
              Your AI-powered Loksewa preparation partner. Ask me anything about your uploaded syllabus, notes, and previous year questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q.text)}
                  disabled={isStreaming}
                  className="flex items-start gap-3 p-4 bg-surface border border-border-subtle rounded-xl text-left hover:border-accent/40 transition-all group active:scale-[0.99] disabled:opacity-50 min-h-[64px]"
                >
                  <div className="p-2 bg-background border border-border-subtle rounded-lg group-hover:bg-accent group-hover:text-background transition-colors flex-shrink-0">
                    <q.icon className="h-4 w-4 text-subtle group-hover:text-current" />
                  </div>
                  <span className="text-[12px] font-bold text-subtle group-hover:text-foreground leading-snug mt-1">{q.text}</span>
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
                  <ThinkingIndicator />
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
            className="sticky bottom-4 left-1/2 -translate-x-1/2 z-20 p-2.5 bg-orange-600 text-background rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Input Area (pinned to bottom, full width) ──────────────── */}
      <div className="flex-shrink-0 border-t border-border-subtle bg-background/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-surface border border-border-subtle rounded-2xl p-2 focus-within:border-accent/40 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Guru anything..."
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent px-3 py-2.5 text-[15px] font-medium text-foreground placeholder:text-subtle focus:outline-none disabled:opacity-50 resize-none leading-relaxed min-h-[44px] max-h-[160px]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className="p-3 bg-orange-600 text-background rounded-xl hover:opacity-90 transition-all active:scale-90 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-subtle/60 font-bold mt-2 tracking-wider uppercase">
            AI responses are based on your uploaded materials
          </p>
        </div>
      </div>
    </div>
  );
}
