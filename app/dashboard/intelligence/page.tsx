'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Search,
  FileText,
  History,
  Files,
  Cpu,
  Brain,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Database,
  Terminal,
  Zap,
  Activity
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { FontSizeSelector } from '@/components/dashboard/FontSizeSelector';

// ─── Types ───────────────────────────────────────────────────────────
interface DocumentAnalysis {
  id: string;
  file_name: string;
  doc_type: 'syllabus' | 'notes' | 'pyq';
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  parsed_text: string | null;
  created_at: string;
}

interface SyllabusAnalysis {
  id: string;
  analysis_data: {
    exam_overview: any;
    topics: any[];
    study_strategy: string;
    critical_topics_summary: string;
  };
  created_at: string;
}

// ─── Components ──────────────────────────────────────────────────────

function IntelligenceCard({ title, icon: Icon, children, status }: any) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden transition-all">
      <div className="px-5 py-3 border-b border-border-subtle flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-accent" />
          <div>
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-foreground">{title}</h3>
            {status && <p className="text-[9px] font-bold text-emerald-500 tracking-wider uppercase">{status}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export default function IntelligenceHubPage() {
  const supabase = createClient();
  const router = useRouter();
  const { language, t } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [syllabusAnalysis, setSyllabusAnalysis] = useState<SyllabusAnalysis | null>(null);
  const [documents, setDocuments] = useState<DocumentAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'pyq'>('syllabus');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 5) { // Minimum 5 characters
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show if the selection is inside the content area (simplified check)
        setSelection({
          text: sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 10
        });
      } else {
        setSelection(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleAskGuruSelection = () => {
    if (!selection) return;
    
    let msg = `Briefly explain this topic/text in one paragraph: "${selection.text}"`;
    if (language === 'np') {
      msg = `यस विषय/पाठलाई एक अनुच्छेदमा संक्षिप्तमा व्याख्या गर्नुहोस्: "${selection.text}"`;
    }
    
    router.push(`/dashboard/guru?message=${encodeURIComponent(msg)}`);
    setSelection(null);
  };

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Exams
    const { data: examData } = await supabase
      .from('user_exams')
      .select('id, exam_name')
      .order('exam_date', { ascending: true });
    
    if (examData?.length) {
      setExams(examData);
      const currentExamId = activeExamId || examData[0].id;
      if (!activeExamId) setActiveExamId(currentExamId);

      // 2. Fetch Syllabus Analysis
      const { data: sDataArr } = await supabase
        .from('syllabus_analysis')
        .select('*')
        .eq('exam_id', currentExamId)
        .order('created_at', { ascending: false })
        .limit(1);
      setSyllabusAnalysis(sDataArr?.[0] || null);

      // 3. Fetch Documents
      const { data: dData } = await supabase
        .from('documents')
        .select('id, file_name, doc_type, processing_status, parsed_text, created_at')
        .eq('exam_id', currentExamId)
        .order('created_at', { ascending: false });
      setDocuments(dData || []);
    }
    setLoading(false);
  }, [supabase, activeExamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToGuru = (topic: string, context: string) => {
    // Truncate context to prevent massive URLs and prompt pollution
    const cleanContext = context.length > 500 ? context.substring(0, 500) + "..." : context;
    
    let msg = `I'm studying the document "${topic}". Here is a brief snippet for context: "${cleanContext}". Can you provide a high-level summary and help me with specific questions from this material?`;
    
    if (language === 'np') {
      msg = `म "${topic}" भन्ने कागजात अध्ययन गर्दैछु। यहाँ सन्दर्भको लागि एक संक्षिप्त अंश छ: "${cleanContext}"। के तपाईं मलाई यो सामग्रीको उच्च-स्तरको सारांश प्रदान गर्न र यस सामग्रीबाट केही विशेष प्रश्नहरूको साथ मलाई मद्दत गर्न सक्नुहुन्छ?`;
    }
    
    router.push(`/dashboard/guru?message=${encodeURIComponent(msg)}`);
  };

  if (loading) return <div className="p-32 flex justify-center"><div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const filteredDocs = documents.filter(d => d.doc_type === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div className="px-8 py-10 sm:px-12 sm:py-16">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-[9px] font-bold text-subtle uppercase tracking-[0.2em] mb-3">
              Intelligence Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Knowledge <span className="text-accent">Intelligence</span> Hub
            </h1>
            <p className="text-muted text-sm font-medium max-w-2xl leading-relaxed mb-8">
              Analyzed documentation and structured knowledge insights.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {exams.map(e => (
                <button
                  key={e.id}
                  onClick={() => setActiveExamId(e.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeExamId === e.id ? 'bg-[#1e3a5f] text-[#c9a84c]' : 'bg-background text-muted border border-border-subtle hover:bg-surface'}`}
                >
                  {e.exam_name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-5 bg-surface border border-border-subtle rounded-2xl">
              <Database className="h-4 w-4 text-accent mb-3" />
              <p className="text-2xl font-bold text-foreground">{documents.length}</p>
              <p className="text-[9px] font-bold uppercase text-subtle tracking-wider">Sources Indexed</p>
            </div>
            <div className="p-5 bg-surface border border-border-subtle rounded-2xl">
              <Zap className="h-4 w-4 text-amber-500 mb-3" />
              <p className="text-2xl font-bold text-foreground">{documents.filter(d => d.processing_status === 'ready').length}</p>
              <p className="text-[9px] font-bold uppercase text-subtle tracking-wider">Active Analyticals</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 p-1 bg-background rounded-xl w-fit border border-border-subtle mx-auto sm:mx-0">
        {[
          { id: 'syllabus', label: 'Syllabus Analysis', icon: FileText },
          { id: 'notes', label: 'Study Notes', icon: Files },
          { id: 'pyq', label: 'PYQ Archive', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-surface text-foreground shadow-sm' : 'text-subtle hover:text-foreground'}`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        {activeTab === 'syllabus' ? (
          <div className="space-y-6">
            {!syllabusAnalysis ? (
              <div className="bg-surface dark:bg-slate-900 border border-border-subtle p-20 rounded-3xl text-center">
                <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-2xl font-black">No Analysis Available</h3>
                <p className="text-base text-muted mt-2 mb-6 max-w-sm mx-auto">Please upload a syllabus in the Materials Repo and trigger a new analysis.</p>
                <button onClick={() => router.push('/dashboard/documents')} className="px-8 py-3 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#1e3a5f]/20">Go to Material Repo</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <IntelligenceCard title="Syllabus Core Map" icon={Brain} status="AI GENERATED">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {syllabusAnalysis.analysis_data.topics?.map((topic, i) => (
                        <div key={i} className="p-5 border border-border-subtle rounded-xl bg-background group hover:border-accent/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-base text-foreground">{topic.topic_name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${topic.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-accent/10 text-accent'}`}>
                              {topic.priority}
                            </span>
                          </div>
                          <div className="space-y-3">
                             <div className="flex flex-wrap gap-1">
                               {topic.subtopics?.map((st: string, j: number) => (
                                 <span key={j} className="text-[10px] font-medium px-2 py-1 bg-surface border border-border-subtle rounded-md text-muted">{st}</span>
                               ))}
                             </div>
                             <p className="reading-area text-[13px] text-muted leading-relaxed">{topic.priority_reason}</p>
                             <button 
                              onClick={() => navigateToGuru(topic.topic_name, `Subtopics: ${topic.subtopics.join(', ')}. Context: ${topic.priority_reason}`)}
                              className="mt-4 w-full py-2 bg-surface border border-border-subtle rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-background hover:border-primary transition-all"
                             >
                               Exploration by Guru <ArrowRight className="h-3 w-3" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </IntelligenceCard>

                  <IntelligenceCard title="Strategic Overview" icon={Zap}>
                    <div className="reading-area prose prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground">
                      <ReactMarkdown>{syllabusAnalysis.analysis_data.study_strategy}</ReactMarkdown>
                    </div>
                  </IntelligenceCard>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-surface border border-border-subtle p-6 rounded-2xl">
                     <h4 className="text-[10px] font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-subtle"><Activity className="h-3.5 w-3.5" /> Intelligence Stats</h4>
                     <div className="space-y-5">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-subtle uppercase tracking-wider">Total Topics</span>
                           <span className="text-xl font-bold text-foreground">{syllabusAnalysis.analysis_data.exam_overview?.total_topics}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-subtle uppercase tracking-wider">Prep Depth</span>
                           <span className="text-xl font-bold text-accent">Advanced</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-subtle uppercase tracking-wider">Est. Effort</span>
                           <span className="text-xl font-bold text-foreground">{syllabusAnalysis.analysis_data.exam_overview?.estimated_total_hours_needed}h</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#1e3a5f] p-6 rounded-2xl text-[#c9a84c] shadow-xl shadow-[#1e3a5f]/10">
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[#c9a84c]"><Sparkles className="h-3.5 w-3.5" /> Critical Focus</h4>
                     <p className="reading-area text-xs font-medium leading-relaxed opacity-80 italic text-white/90">
                        {syllabusAnalysis.analysis_data.critical_topics_summary}
                     </p>
                  </div>

                  <div className="bg-surface border border-border-subtle p-6 rounded-2xl">
                    <FontSizeSelector />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.length === 0 ? (
               <div className="bg-surface dark:bg-slate-900 border border-border-subtle p-20 rounded-3xl text-center">
                <Database className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-black">No Data Uploaded</h3>
                <p className="text-sm text-muted mt-2">You haven't uploaded any {activeTab === 'notes' ? 'notes' : 'PYQs'} yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="bg-surface border border-border-subtle rounded-xl overflow-hidden group transition-all">
                    <div 
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-background transition-all"
                      onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${doc.processing_status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-background text-subtle border border-border-subtle'}`}>
                             {activeTab === 'notes' ? <Files className="h-4 w-4" /> : <History className="h-4 w-4" />}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-foreground tracking-tight">{doc.file_name}</h4>
                             <p className="text-[10px] text-subtle font-bold tracking-wider uppercase">
                               {doc.processing_status === 'ready' ? 'READY' : 'PROCESSING'} • {new Date(doc.created_at).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigateToGuru(doc.file_name, `Extracted Content: ${doc.parsed_text?.slice(0, 1000)}`); }}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background border border-border-subtle text-muted text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#1e3a5f] hover:text-[#c9a84c] transition-all"
                          >
                             Consult Guru <MessageSquare className="h-3 w-3" />
                          </button>
                          {expandedDoc === doc.id ? <ChevronUp className="h-4 w-4 text-subtle" /> : <ChevronDown className="h-4 w-4 text-subtle" />}
                       </div>
                    </div>
                    
                    {expandedDoc === doc.id && (
                       <div className="px-5 pb-5 pt-0">
                          <div className="bg-background p-6 rounded-xl border border-border-subtle">
                             <div className="flex items-center gap-2 mb-4">
                                <Terminal className="h-3.5 w-3.5 text-accent" />
                                <span className="text-[10px] font-bold text-subtle uppercase tracking-wider">Extracted Intelligence Stream</span>
                             </div>
                             <div className="reading-area text-[13px] font-medium leading-relaxed text-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                                {doc.parsed_text || 'No text extracted yet. Still processing...'}
                             </div>
                             <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-border-subtle pt-6">
                                <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Validated by Loksewa AI</p>
                                <button 
                                  onClick={() => navigateToGuru(doc.file_name, doc.parsed_text || '')}
                                  className="w-full sm:w-auto px-6 py-2 bg-[#1e3a5f] text-[#c9a84c] text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[#1e3a5f]/10"
                                >
                                   Ask Guru about this document <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SELECTION POPUP ────────────────────────────────────────── */}
      {selection && (
        <div 
          className="fixed z-[100] animate-bounce-subtle"
          style={{ 
            left: `${selection.x}px`, 
            top: `${selection.y - 40}px`, 
            transform: 'translateX(-50%)' 
          }}
        >
          <button
            onClick={handleAskGuruSelection}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl border border-white/10 text-xs font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all whitespace-nowrap"
          >
            <MessageSquare className="h-3 w-3" />
            {language === 'np' ? 'गुरुलाई सोध्नुहोस्' : 'Ask Guru'}
          </button>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 dark:border-t-white mx-auto" />
        </div>
      )}
    </div>
  );
}
