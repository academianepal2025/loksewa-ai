'use client';

import { useState } from 'react';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function DataPrivacySection({ user }: any) {
  const [exporting, setExporting] = useState(false);
  const [clearChatOpen, setClearChatOpen] = useState(false);
  const [clearQuizOpen, setClearQuizOpen] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [clearingQuiz, setClearingQuiz] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/settings/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();

      // Title & Header
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 95); // Deep Blue #1e3a5f
      doc.text('Loksewa AI - Data Export', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${date}`, 14, 28);
      doc.text(`User ID: ${user?.id || 'N/A'}`, 14, 33);
      doc.text(`Email: ${user?.email || 'N/A'}`, 14, 38);

      let currentY = 45;

      const addSection = (title: string, tableData: any[], columns: string[]) => {
        if (!tableData || tableData.length === 0) return;
        
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 14, currentY);
        currentY += 5;

        autoTable(doc, {
          startY: currentY,
          head: [columns.map(c => c.replace(/_/g, ' ').toUpperCase())],
          body: tableData.map(row => columns.map(c => String(row[c] || ''))),
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [30, 58, 95] }, // Deep Blue
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
      };

      // Sections
      addSection('My Exams', data.exams, ['exam_name', 'exam_category', 'exam_date', 'status']);
      addSection('Study Plans', data.study_plans, ['plan_name', 'target_exam', 'created_at']);
      addSection('Study Progress', data.study_progress, ['topic_name', 'status', 'last_reviewed']);
      addSection('Quiz History', data.quiz_attempts, ['quiz_id', 'score', 'total_questions', 'created_at']);
      addSection('Study Notes', data.study_notes, ['title', 'created_at']);
      addSection('Flashcards', data.flashcards, ['front', 'back', 'created_at']);
      
      doc.save(`loksewa-ai-export-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Data exported as PDF');
    } catch (err: any) { 
      console.error('Export Error:', err);
      toast.error(err.message || 'Export failed'); 
    } finally { 
      setExporting(false); 
    }
  };

  const handleClearChat = async () => {
    setClearingChat(true);
    try {
      const res = await fetch('/api/settings/clear-chats', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.count} messages deleted`);
    } catch (err: any) { toast.error(err.message); }
    finally { setClearingChat(false); setClearChatOpen(false); }
  };

  const handleClearQuiz = async () => {
    setClearingQuiz(true);
    try {
      const res = await fetch('/api/settings/clear-quiz-history', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.count} quiz attempts deleted`);
    } catch (err: any) { toast.error(err.message); }
    finally { setClearingQuiz(false); setClearQuizOpen(false); }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6">
      <h2 className="text-lg font-black text-foreground tracking-tighter mb-1 uppercase">Data & Privacy</h2>
      <p className="text-xs text-subtle font-medium mb-6">Export your data or clear specific histories.</p>

      <div className="space-y-4">
        {/* Export */}
        <div className="bg-background border border-border-subtle rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1.5">Export My Data (PDF)</h3>
          <p className="text-[10px] text-subtle font-black uppercase tracking-widest mb-4 leading-relaxed opacity-70">Download all mission data including study plans, quiz history, and notes as a tactical PDF document.</p>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 shadow-lg shadow-[#1e3a5f]/10">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export Mission Data
          </button>
        </div>

        {/* Clear Chat */}
        <div className="bg-background border border-border-subtle rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1.5">Clear Chat History</h3>
          <p className="text-[10px] text-subtle font-black uppercase tracking-widest mb-4 leading-relaxed opacity-70">Permanently delete all Loksewa Guru conversation history across all exams. Irreversible.</p>
          <button onClick={() => setClearChatOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
            <Trash2 className="h-3.5 w-3.5" /> Purge Chat History
          </button>
        </div>

        {/* Clear Quiz */}
        <div className="bg-background border border-border-subtle rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1.5">Clear Quiz History</h3>
          <p className="text-[10px] text-subtle font-black uppercase tracking-widest mb-4 leading-relaxed opacity-70">Permanently delete all quiz attempts and reset performance analytics. Irreversible.</p>
          <button onClick={() => setClearQuizOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
            <Trash2 className="h-3.5 w-3.5" /> Purge Quiz History
          </button>
        </div>
      </div>

      <ConfirmModal isOpen={clearChatOpen} onClose={() => setClearChatOpen(false)} onConfirm={handleClearChat} title="Clear All Chat History?" description="This permanently deletes all your Loksewa Guru conversation history. This action cannot be undone." confirmLabel="Delete All Chats" variant="danger" loading={clearingChat} />
      <ConfirmModal isOpen={clearQuizOpen} onClose={() => setClearQuizOpen(false)} onConfirm={handleClearQuiz} title="Clear All Quiz History?" description="This permanently deletes all your quiz attempts and resets your performance data. This action cannot be undone." confirmLabel="Delete All Quizzes" variant="danger" loading={clearingQuiz} />
    </div>
  );
}
