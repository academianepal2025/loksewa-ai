'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRotatingMessages } from '@/lib/hooks';
import { createClient } from '@/lib/supabase/client';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
  X,
  FileUp,
  Files,
  History,
  Sparkles
} from 'lucide-react';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { motion, AnimatePresence } from 'framer-motion';

import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { UsageIndicator } from '@/components/dashboard/UsageIndicator';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { TacticalPrompt } from '@/components/dashboard/TacticalPrompt';

// Browser-side image resizing and compression to reduce token costs and upload times
function resizeImageIfNeeded(file: File, maxW = 1200, maxH = 1200): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width <= maxW && height <= maxH) {
          resolve(file);
          return;
        }
        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new (window as any).File([blob], file.name, { type: file.type, lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          }, file.type, 0.85); // 85% compression quality
        } else {
          resolve(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface Exam {
  id: string;
  exam_name: string;
}

interface DocumentInfo {
  id: string;
  file_name: string;
  file_url: string;
  doc_type: 'syllabus' | 'notes' | 'pyq';
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────
const DOC_TYPES = [
  { id: 'syllabus' as const, label: 'Syllabus', multi: false, icon: FileText },
  { id: 'notes' as const, label: 'Study Notes', multi: true, icon: Files },
  { id: 'pyq' as const, label: 'PYQs (Previous Years)', multi: true, icon: History },
];

const STATUS_CONFIG = {
  pending: { color: 'bg-background text-subtle border-border-subtle', icon: Clock },
  processing: { color: 'bg-[#1e3a5f]/5 text-[#c9a84c] border-[#1e3a5f]/20', icon: Upload },
  ready: { color: 'bg-[#c9a84c]/5 text-[#c9a84c] border-[#c9a84c]/20', icon: CheckCircle },
  failed: { color: 'bg-red-500/5 text-red-600 border-red-500/20', icon: AlertCircle },
};

// ─── Components ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DocumentInfo['processing_status'] }) {
  const config = STATUS_CONFIG[status];
  const tooltipContent = {
    pending: 'Document is queued for intelligence extraction.',
    processing: 'AI is currently analyzing the document structure.',
    ready: 'Analysis complete. Content is now available for Practice & Guru.',
    failed: 'Extraction failed. Please ensure the file is a clear PDF or Image.'
  }[status];

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip content={tooltipContent}>
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest cursor-help shadow-sm ${config.color}`}>
          <config.icon className={`h-2.5 w-2.5 ${status === 'processing' ? 'animate-bounce' : ''}`} />
          {status}
        </span>
      </Tooltip>
    </div>
  );
}

function ProcessingBanner({ isProcessing }: { isProcessing: boolean }) {
  const rotatingMessage = useRotatingMessages(isProcessing, [
    "AI is analyzing...",
    "Extracting intelligence...",
    "Almost there...",
    "Still processing...",
    "Optimizing data..."
  ]);

  if (!isProcessing) return null;

  return (
    <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-xl p-4 mb-8 flex items-center justify-between animate-fade-in shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-[#c9a84c]">
          <Upload className="h-4 w-4 animate-bounce" />
        </div>
        <div>
          <p className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest animate-pulse">{rotatingMessage}</p>
          <p className="text-[9px] text-subtle font-black uppercase tracking-widest mt-0.5">Tactical intelligence extracting</p>
        </div>
      </div>
      <div className="flex gap-1">
        <span className="h-1 w-1 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1 w-1 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1 w-1 rounded-full bg-[#c9a84c] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function UploadZone({
  examId,
  docType,
  label,
  multi,
  documents,
  onUploadStart,
  onUploadFinish,
  onDelete,
}: {
  examId: string;
  docType: DocumentInfo['doc_type'];
  label: string;
  multi: boolean;
  documents: DocumentInfo[];
  onUploadStart: () => void;
  onUploadFinish: () => void;
  onDelete: (id: string, url: string, docType: string, examId: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { showUpgradeModal } = useUpgradeModal();
  const { isPro, isAdmin, language } = useDashboard();
  const [isLimitReached, setIsLimitReached] = useState(false);

  const checkLimits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const res = await fetch('/api/check-limits');
    const data = await res.json();
    if (data.plan === 'free' && data.limits.documents.exceeded) {
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

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Plan Limit Check
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const resLimit = await fetch('/api/check-limits');
    const limitData = await resLimit.json();

    if (limitData.plan === 'free' && limitData.limits.documents.exceeded) {
      showUpgradeModal('document_limit');
      return;
    }

    if (!multi && documents.length > 0) {
      toast.error('Single File Policy', { description: 'Syllabus category only allows a single file. Delete the current one to replace.' });
      return;
    }

    const filesToUpload = multi ? Array.from(files) : [files[0]];
    
    // Check Storage Limit for Free Users
    if (!isPro && !isAdmin) {
       const { count: currentDocs } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id);
       if ((currentDocs || 0) + filesToUpload.length > 3) {
          toast.error('Storage Limit Reached', { description: 'Free plan is limited to 3 documents. Upgrade to Pro for unlimited storage.' });
          showUpgradeModal('document_limit');
          return;
       }
    }

    onUploadStart();

    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File Too Large', { description: `${file.name} exceeds 10MB limit.` });
        continue;
      }

      const processedFile = await resizeImageIfNeeded(file);
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${authUser.id}/${examId}/${docType}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, processedFile);

      if (storageError) {
        toast.error('Upload Failed', { description: storageError.message });
        continue;
      }

      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: authUser.id,
          exam_id: examId,
          file_name: file.name,
          file_url: filePath,
          doc_type: docType,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        toast.error('Database Sync Failed', { description: dbError.message });
        continue;
      }

      toast.success('Upload Successful', { description: `${file.name} is now being processed.` });
      window.dispatchEvent(new CustomEvent('usage-updated'));

      fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id, language }),
      })
      .then(async (res) => {
        if (!res.ok) {
           const errData = await res.json().catch(()=>({}));
           console.error("Processing Failed:", errData.message);
        }
      })
      .catch(err => {
        console.error('API Trigger failed:', err);
      });
    }

    onUploadFinish();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            {label}
          </h3>
          {!multi && <span className="text-[8px] bg-background border border-border-subtle px-1.5 py-0.5 rounded text-subtle font-black uppercase tracking-widest shadow-sm">Single Target</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple={multi}
        onChange={(e) => handleUpload(e.target.files)}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); if (!isLimitReached) setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsOver(false); if (!isLimitReached) handleUpload(e.dataTransfer.files); }}
        onClick={() => { if (!isLimitReached) fileInputRef.current?.click(); }}
        className={`relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all shadow-sm ${
          isLimitReached 
            ? 'border-border-subtle bg-background/50 opacity-60 cursor-not-allowed'
            : isOver 
              ? 'border-[#c9a84c] bg-[#c9a84c]/5' 
              : 'border-border-subtle hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 group cursor-pointer'
        }`}
      >
        <div className={`relative z-10 h-8 w-8 rounded-lg bg-background border border-border-subtle flex items-center justify-center transition-transform shadow-sm ${isLimitReached ? 'text-red-500' : 'text-[#c9a84c] group-hover:scale-110'}`}>
          {isLimitReached ? <AlertCircle className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
        </div>
        <div className="relative z-10 mt-2 text-center px-4">
          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{isLimitReached ? 'Storage Limit Reached' : 'Transmit or Drop'}</p>
          {isLimitReached ? (
            <button 
              onClick={(e) => { e.stopPropagation(); showUpgradeModal('document_limit'); }}
              className="text-[9px] text-red-600 font-black uppercase tracking-widest mt-1 hover:underline underline-offset-2"
            >
              Upgrade for unlimited
            </button>
          ) : (
            <p className="text-[9px] text-subtle font-black uppercase tracking-widest mt-0.5">Limit 10MB</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-background border border-border-subtle rounded-xl hover:border-[#c9a84c]/30 transition-all group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-surface border border-border-subtle flex items-center justify-center flex-shrink-0 text-subtle group-hover:text-[#c9a84c] transition-colors">
                <File className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-black text-foreground truncate uppercase tracking-widest leading-tight">{doc.file_name}</p>
                <p className="text-[9px] text-subtle font-black uppercase tracking-widest mt-1">{new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <StatusBadge status={doc.processing_status} />
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id, doc.file_url, doc.doc_type, examId); }}
                className="text-subtle hover:text-red-500 p-1.5 transition-colors rounded-lg hover:bg-red-500/5"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState<{id: string, url: string, doc_type: string, exam_id: string} | null>(null);
  
  const supabase = createClient();

  const fetchExams = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: examsData } = await supabase
      .from('user_exams')
      .select('id, exam_name')
      .eq('user_id', user.id)
      .order('exam_date', { ascending: true });

    if (examsData) {
      setExams(examsData);
      if (examsData.length > 0 && !activeExamId) {
        setActiveExamId(examsData[0].id);
      }
    }
  }, [supabase, activeExamId]);

  const fetchDocs = useCallback(async () => {
    if (!activeExamId) return;
    const { data } = await supabase
      .from('documents')
      .select('id, file_name, file_url, doc_type, processing_status, created_at')
      .eq('exam_id', activeExamId)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
  }, [supabase, activeExamId]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  
  useEffect(() => {
    if (activeExamId) {
      setLoading(true);
      fetchDocs().finally(() => setLoading(false));
    }
  }, [activeExamId, fetchDocs]);

  useEffect(() => {
    if (!activeExamId) return;
    const interval = setInterval(() => { fetchDocs(); }, 5000);
    return () => clearInterval(interval);
  }, [activeExamId, fetchDocs]);

  const handleDelete = async (id: string, url: string, doc_type: string, exam_id: string) => {
    try {
      const { error: chunkError } = await supabase.from('document_chunks').delete().eq('document_id', id);
      const { error: storageError } = await supabase.storage.from('user-documents').remove([url]);
      const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
      
      if (doc_type === 'syllabus') {
          await supabase.from('syllabus_analysis').delete().eq('exam_id', exam_id);
          await supabase.from('study_plans').delete().eq('exam_id', exam_id);
          toast.info('Syllabus Intelligence Purged', { description: 'Associated analysis and study plans have been reset.' });
      }
      
      if (dbError) throw dbError;
      
      toast.success('Document Purged', { description: 'All associated intelligence chunks have been removed.' });
      fetchDocs();
    } catch (error: any) {
      toast.error('Deletion Failed', { description: error.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header Panel */}
      <div className="bg-surface p-6 sm:p-10 rounded-2xl border border-border-subtle relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c9a84c]" />
                <span className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest">Repository</span>
             </div>
             <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-tight uppercase">
               Study <span className="text-[#c9a84c]">Materials</span>
             </h1>
             <p className="text-sm text-subtle font-medium max-w-sm leading-relaxed">
               Securely upload and manage your core syllabus and reference notes.
             </p>
             <div className="pt-2">
                <UsageIndicator type="documents" />
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setActiveExamId(exam.id)}
                className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[36px] shadow-sm ${
                  activeExamId === exam.id 
                    ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-[#1e3a5f]/10' 
                    : 'bg-background border border-border-subtle text-subtle hover:text-foreground'
                }`}
              >
                {exam.exam_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!activeExamId ? (
        <div className="bg-surface p-12 rounded-2xl text-center border border-border-subtle shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-background border border-border-subtle flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-5 w-5 text-subtle" />
            </div>
            <h3 className="text-lg font-black text-foreground tracking-tighter uppercase">Mission Target Not Set</h3>
            <p className="text-[10px] text-subtle mt-3 font-black uppercase tracking-widest max-w-xs mx-auto">Please initialize an exam in the dashboard to start managing documents.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <ProcessingBanner isProcessing={documents.some(d => d.processing_status === 'processing' || d.processing_status === 'pending')} />

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-surface p-8 rounded-3xl border border-border-subtle space-y-6">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {DOC_TYPES.map((type) => (
                <div key={type.id} className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-sm">
                  <UploadZone
                    examId={activeExamId}
                    docType={type.id}
                    label={type.label}
                    multi={type.multi}
                    documents={documents.filter(d => d.doc_type === type.id)}
                    onUploadStart={() => {}}
                    onUploadFinish={() => fetchDocs()}
                    onDelete={(id, url, doc_type, exam_id) => {
                      // We'll use state to manage which doc is being deleted for the modal
                      setDocToDelete({ id, url, doc_type, exam_id });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <ConfirmModal 
            isOpen={!!docToDelete}
            onClose={() => setDocToDelete(null)}
            onConfirm={() => {
              if (docToDelete) handleDelete(docToDelete.id, docToDelete.url, docToDelete.doc_type, docToDelete.exam_id);
            }}
            title="Purge Document Intelligence?"
            description="This will permanently delete the file and all AI-extracted data. This action cannot be undone."
            variant="danger"
            confirmLabel="Delete Forever"
          />
        </div>
      )}
      {/* Contextual Guidance */}
      <TacticalPrompt 
        id="documents_syllabus_tip"
        title="Upload Your Syllabus"
        message="Add your official 'Syllabus' first. Our AI will automatically identify your topics and help you create a study plan."
        type="tactical"
        delay={3000}
      />
    </div>
  );
}
