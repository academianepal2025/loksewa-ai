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
  Download,
  Edit3,
  Check,
  X,
  Calendar,
  AlertCircle,
  Hash,
  ChevronRight,
  BookOpen
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
  const { t } = useDashboard();
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

  // PDF
  const [isDownloading, setIsDownloading] = useState(false);

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
            setActiveNote(firstReady);
            setEditContent(firstReady.notes_content!.full_markdown);
            setSelectedExamId(firstReady.exam_id);
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
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!activeNote) return;
    setIsDownloading(true);
    toast('Generating PDF...', { icon: '📄' });
    try {
      const res = await fetch(`/api/notes/${activeNote.id}/pdf`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LoksewaAI_Notes_Day${activeNote.day_number}_${activeNote.topic.replace(/\\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDownloading(false);
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
      <div className="flex-none p-6 border-b border-border-subtle bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent" /> AI Study Notes
          </h1>
          <p className="text-xs text-subtle font-medium mt-1 uppercase tracking-wider">Your unified knowledge base</p>
        </div>

      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Note List */}
        <div className="w-full md:w-80 border-r border-border-subtle bg-surface/50 flex flex-col flex-none transition-all">
          <div className="p-4 border-b border-border-subtle bg-surface sticky top-0 z-10 space-y-3">
            {exams.length > 0 && (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all appearance-none uppercase tracking-wider"
              >
                <option value="all">All Exams</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.exam_name}</option>
                ))}
              </select>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {Object.keys(groupedNotes).length === 0 ? (
              <div className="text-center py-10 px-4">
                <FileText className="h-8 w-8 text-border-subtle mx-auto mb-3" />
                <p className="text-sm font-bold text-subtle">No notes found.</p>
                <p className="text-[11px] text-muted mt-1">Generate them from your Study Plan.</p>
              </div>
            ) : (
              Object.entries(groupedNotes).map(([week, weekNotes]) => (
                <div key={week} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-subtle uppercase tracking-wider px-2 flex items-center gap-2">
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
                        className={`w-full text-left p-3 rounded-xl transition-all group ${
                          activeNote?.id === note.id 
                            ? 'bg-accent/10 border-accent/20' 
                            : 'hover:bg-background border-transparent'
                        } border`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-subtle bg-background px-1.5 py-0.5 rounded border border-border-subtle">Day {note.day_number}</span>
                          {note.notes_content?.has_pyq_content && (
                            <span className="text-[8px] font-bold text-orange-600 bg-orange-600/10 px-1.5 py-0.5 rounded">PYQ INC</span>
                          )}
                        </div>
                        <p className={`text-sm font-bold mt-2 line-clamp-2 leading-tight ${activeNote?.id === note.id ? 'text-accent' : 'text-foreground'}`}>
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

        {/* Right Content Area */}
        <div className={`flex-1 overflow-y-auto bg-background transition-all ${!activeNote && 'hidden md:flex items-center justify-center'}`}>
          {!activeNote ? (
            <div className="text-center max-w-sm mx-auto p-6">
              <div className="h-16 w-16 bg-surface border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-subtle opacity-50" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Select a Note</h2>
              <p className="text-sm text-subtle font-medium leading-relaxed">
                Choose a generated study note from the sidebar to view, edit, or download as PDF.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 lg:p-12 animate-fade-in pb-32">
              
              {/* Note Controls */}
              <div className="flex flex-wrap gap-3 justify-between items-end mb-8 border-b border-border-subtle pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 bg-surface border border-border-subtle text-[10px] font-bold text-subtle rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Day {activeNote.day_number}
                    </span>
                    <span className="px-2.5 py-1 bg-surface border border-border-subtle text-[10px] font-bold text-subtle rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> {activeNote.notes_content?.word_count} Words
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{activeNote.topic}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="p-2.5 bg-surface text-subtle hover:text-foreground border border-border-subtle rounded-xl transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleSaveEdit} 
                        disabled={isSaving}
                        className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        {isSaving ? <span className="animate-pulse">Saving...</span> : <><Check className="h-4 w-4" /> Save</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="px-4 py-2.5 bg-surface text-foreground font-bold text-xs uppercase tracking-wider rounded-xl border border-border-subtle hover:bg-background transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button 
                        onClick={handleDownloadPDF} 
                        disabled={isDownloading}
                        className="px-4 py-2.5 bg-accent text-background font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-colors flex items-center gap-2"
                      >
                        <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} /> PDF
                      </button>
                    </>
                  )}
                </div>
              </div>

              {activeNote.notes_content?.generated_from_general_knowledge && (
                <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex gap-4 items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-500">General Knowledge Generation</h4>
                    <p className="text-xs font-medium text-yellow-600/80 mt-1 leading-relaxed">
                      No uploaded materials were found for this topic. These notes were generated using general PSC syllabus knowledge. For higher accuracy, please upload relevant PDFs.
                    </p>
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
                      {activeNote.notes_content!.full_markdown}
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
