'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/dashboard/DashboardProvider';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Edit3,
  Check,
  X,
  Calendar,
  AlertCircle,
  Hash,
  BookOpen,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface NoteContent {
  full_markdown: string;
  topic: string;
  subtopics: string[];
  word_count: number;
  has_pyq_content: boolean;
  source_docs_count: number;
  generated_from_general_knowledge?: boolean;
}

interface StudyNote {
  id: string;
  exam_id: string;
  day_number: number;
  date: string;
  topic: string;
  generation_status: string;
  notes_content: NoteContent | null;
  no_content_found: boolean;
  updated_at: string;
}

export default function StudyNotesPage() {
  const supabase = createClient();
  const { language } = useDashboard();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [exams, setExams] = useState<{id: string, exam_name: string}[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [activeNote, setActiveNote] = useState<StudyNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Expansion Mode
  const [expansionTopic, setExpansionTopic] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: examsData } = await supabase
        .from('user_exams')
        .select('id, exam_name')
        .eq('user_id', session.user.id);

      if (examsData) {
        setExams(examsData);
      }

      const { data } = await supabase
        .from('study_notes')
        .select('*')
        .order('day_number', { ascending: true });

      if (data) {
        setNotes(data);
        const urlParams = new URLSearchParams(window.location.search);
        const dayParam = urlParams.get('day');
        const topicParam = urlParams.get('topic');
        
        if (dayParam) {
          const target = data.find((n: StudyNote) => 
            n.day_number.toString() === dayParam && 
            (!topicParam || n.topic === topicParam)
          );
          if (target && target.notes_content) {
            setActiveNote(target);
            setEditContent(target.notes_content.full_markdown);
            setSelectedExamId(target.exam_id);
          }
        } else {
          const firstReady = data.find((n: StudyNote) => n.generation_status === 'ready' && n.notes_content);
          if (firstReady) {
            // Only set default active note if screen is not mobile (>= 768px)
            if (window.innerWidth >= 768) {
              setActiveNote(firstReady);
              setEditContent(firstReady.notes_content!.full_markdown);
              setSelectedExamId(firstReady.exam_id);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchNotes();
  }, [supabase]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n: StudyNote) => {
      if (n.generation_status !== 'ready' || !n.notes_content) return false;
      if (selectedExamId !== 'all' && n.exam_id !== selectedExamId) return false;
      
      const search = searchQuery.toLowerCase();
      return n.topic.toLowerCase().includes(search) || 
             (n.notes_content.subtopics && n.notes_content.subtopics.some(s => s.toLowerCase().includes(search))) ||
             n.notes_content.full_markdown.toLowerCase().includes(search);
    });
  }, [notes, searchQuery, selectedExamId]);

  // Group by week
  const groupedNotes = useMemo(() => {
    const groups: Record<number, StudyNote[]> = {};
    filteredNotes.forEach((note: StudyNote) => {
      const week = Math.ceil(note.day_number / 7);
      if (!groups[week]) groups[week] = [];
      groups[week].push(note);
    });
    return groups;
  }, [filteredNotes]);

  const handleSaveEdit = async () => {
    if (!activeNote || !activeNote.notes_content) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${activeNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: editContent })
      });
      
      if (!res.ok) throw new Error('Failed to update note');
      
      const updatedNote = {
        ...activeNote,
        notes_content: { ...activeNote.notes_content, full_markdown: editContent }
      };
      
      setActiveNote(updatedNote);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
      setIsEditing(false);
      toast.success('Notes updated successfully');
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExpandTopic = async () => {
    if (!activeNote || !expansionTopic.trim()) return;
    setIsExpanding(true);
    toast(`Expanding note section for "${expansionTopic}"...`, { icon: '⏳' });
    
    try {
      const res = await fetch('/api/notes/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: activeNote.id,
          sectionToExpand: expansionTopic.trim(),
          language
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to expand note');
      }
      
      const updatedNote = {
        ...activeNote,
        notes_content: {
          ...activeNote.notes_content!,
          full_markdown: data.updated_markdown,
          word_count: data.word_count
        }
      };
      
      setActiveNote(updatedNote);
      setEditContent(data.updated_markdown);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
      setExpansionTopic('');
      toast.success(`Expanded note section saved successfully!`);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      toast.error(errMsg || 'Error expanding notes');
    } finally {
      setIsExpanding(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="flex-none p-5 border-b border-border-subtle/60 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          {activeNote && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex items-center justify-center p-2 rounded-lg bg-background border border-border-subtle/80 hover:bg-accent/10 hover:border-accent/30 text-subtle hover:text-accent transition-all duration-200"
              title={isSidebarCollapsed ? "Expand Notes List" : "Collapse Notes List"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" /> AI Study Notes
            </h1>
            <p className="text-xs font-semibold text-subtle mt-1 capitalize tracking-wide">Unified Tactical Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Note List */}
        <div className={`w-full bg-surface/30 flex flex-col flex-none overflow-hidden transition-all duration-300 ease-in-out ${
          activeNote ? 'hidden md:flex' : 'flex'
        } ${
          isSidebarCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0' : 'md:w-80 border-r border-border-subtle/60'
        }`}>
          <div className="w-80 flex flex-col h-full flex-shrink-0">
            <div className="p-4 border-b border-border-subtle/50 bg-surface sticky top-0 z-10 space-y-3">
              {exams.length > 0 && (
                <div className="relative w-full">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-primary text-accent border-2 border-accent/20 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all appearance-none cursor-pointer shadow-md"
                  >
                    <option value="all" className="bg-surface text-foreground">All Exams</option>
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id} className="bg-surface text-foreground">{ex.exam_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-6">
              {Object.keys(groupedNotes).length === 0 ? (
                <div className="text-center py-10 px-4">
                  <FileText className="h-8 w-8 text-border-subtle/60 mx-auto mb-3" />
                  <p className="text-sm font-bold text-subtle">No notes found.</p>
                  <p className="text-[11px] text-muted mt-1">Generate them from your Study Plan.</p>
                </div>
              ) : (
                Object.entries(groupedNotes).map(([week, weekNotes]) => (
                  <div key={week} className="space-y-2">
                    <h3 className="text-xs font-semibold text-subtle capitalize tracking-wide px-2 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Week {week}
                    </h3>
                    <div className="space-y-1">
                      {weekNotes.map(note => (
                        <button
                          key={note.id}
                          onClick={() => {
                            setActiveNote(note);
                            setEditContent(note.notes_content!.full_markdown);
                            setIsEditing(false);
                            if (window.innerWidth < 768) {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all group ${
                            activeNote?.id === note.id 
                              ? 'bg-accent/10 border-accent/25' 
                              : 'hover:bg-background border-transparent'
                          } border`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-subtle bg-background px-1.5 py-0.5 rounded-md border border-border-subtle/80 tracking-wide capitalize">Day {note.day_number}</span>
                            {note.notes_content?.has_pyq_content && (
                              <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded tracking-wider">PYQ INC</span>
                            )}
                          </div>
                          <p className={`text-sm font-semibold mt-2 line-clamp-2 leading-tight tracking-tight ${activeNote?.id === note.id ? 'text-accent' : 'text-foreground'}`}>
                            {note.topic}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 overflow-y-auto bg-background transition-all ${!activeNote && 'hidden md:flex items-center justify-center'}`}>
          {!activeNote ? (
            <div className="text-center max-w-sm mx-auto p-6">
              <div className="h-16 w-16 bg-surface border border-border-subtle/60 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-subtle opacity-50" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Select a Note</h2>
              <p className="text-sm text-subtle font-medium leading-relaxed">
                Choose a generated study note from the sidebar to view or edit.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 lg:p-12 animate-fade-in pb-32">
              
              {/* Back to list button for mobile */}
              <button 
                onClick={() => setActiveNote(null)}
                className="md:hidden mb-6 flex items-center gap-1.5 text-xs font-semibold text-accent capitalize tracking-wide hover:opacity-80 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Notes List
              </button>

              {/* Note Controls */}
              <div className="flex flex-wrap gap-3 justify-between items-end mb-8 border-b border-border-subtle pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 bg-surface border border-border-subtle/80 text-[11px] font-semibold text-subtle rounded-lg capitalize tracking-wide flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Day {activeNote!.day_number}
                    </span>
                    <span className="px-2.5 py-1 bg-surface border border-border-subtle/80 text-[11px] font-semibold text-subtle rounded-lg capitalize tracking-wide flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> {activeNote!.notes_content?.word_count} Words
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">{activeNote!.topic}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="p-2.5 bg-surface text-subtle hover:text-foreground border border-border-subtle/80 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleSaveEdit} 
                        disabled={isSaving}
                        className="px-4 py-2.5 bg-accent text-primary font-bold text-xs tracking-wide capitalize rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        {isSaving ? <span className="animate-pulse">Syncing...</span> : <><Check className="h-4 w-4" /> Sync Note</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="px-4 py-2.5 bg-primary text-accent font-bold text-xs tracking-wide capitalize rounded-lg border border-transparent hover:bg-background transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {activeNote!.notes_content?.generated_from_general_knowledge && (
                <div className="mb-8 bg-accent/5 border border-accent/20 rounded-xl p-5 flex gap-4 items-start">
                  <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-accent tracking-wide capitalize">General Knowledge Generation</h4>
                    <p className="text-xs font-medium text-subtle mt-2 leading-relaxed opacity-85">
                      No uploaded materials found for this topic. These notes were generated using general PSC syllabus knowledge.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Expansion Expander Card */}
              {!isEditing && activeNote && (
                <div className="mb-8 bg-surface border border-border-subtle/60 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground tracking-wide capitalize">AI Deep-Dive Expander</h4>
                        <p className="text-xs font-medium text-subtle mt-0.5 capitalize">Generate more detail for any subtopic</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-muted leading-relaxed">
                      Need more details? Select an existing subtopic or type a custom concept (e.g., <em>planning</em>, <em>organizing</em>) to have the AI write a comprehensive detailed guide and save it to these notes.
                    </p>

                    {/* Prepopulated Subtopics Pills */}
                    {activeNote.notes_content?.subtopics && activeNote.notes_content.subtopics.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Suggested Subtopics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeNote.notes_content.subtopics.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => setExpansionTopic(sub)}
                              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all capitalize tracking-wide ${
                                expansionTopic.toLowerCase() === sub.toLowerCase()
                                  ? 'bg-accent/20 border-accent/40 text-accent'
                                  : 'bg-background border-border-subtle/80 text-subtle hover:text-foreground'
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input and Action */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <input
                        type="text"
                        value={expansionTopic}
                        onChange={(e) => setExpansionTopic(e.target.value)}
                        placeholder="Enter a concept or subtopic to expand..."
                        className="flex-1 px-4 py-2.5 bg-background border border-border-subtle/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-subtle/50 text-foreground"
                      />
                      <button
                        onClick={handleExpandTopic}
                        disabled={isExpanding || !expansionTopic.trim()}
                        className={`px-5 py-2.5 rounded-lg font-bold text-xs tracking-wide capitalize transition-all flex items-center justify-center gap-2 ${
                          isExpanding || !expansionTopic.trim()
                            ? 'bg-background border border-border-subtle/80 text-subtle cursor-not-allowed'
                            : 'bg-primary text-accent border border-transparent hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {isExpanding ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" /> Expanding...</>
                        ) : (
                          <><Sparkles className="h-4 w-4" /> Expand Topic</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Note Content */}
              <div className="reading-area font-medium">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[60vh] p-6 bg-surface border border-accent/20 rounded-2xl text-foreground text-sm font-mono focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-y"
                  />
                ) : (
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                    prose-h2:text-2xl prose-h2:border-b prose-h2:border-border-subtle prose-h2:pb-2
                    prose-h3:text-xl prose-h3:text-accent
                    prose-p:leading-relaxed prose-p:text-foreground/90
                    prose-ul:text-foreground/90 prose-ol:text-foreground/90 prose-li:text-foreground/90
                    prose-li:marker:text-accent
                    prose-strong:text-foreground prose-strong:font-bold
                    prose-blockquote:border-accent prose-blockquote:text-foreground/80
                    prose-table:text-foreground/90 prose-th:text-foreground
                    prose-hr:border-border-subtle"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeNote!.notes_content!.full_markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
