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
      doc.setTextColor(249, 115, 22); // Orange primary
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
          headStyles: { fillColor: [249, 115, 22] },
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
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">Data & Privacy</h2>
      <p className="text-xs text-subtle font-medium mb-6">Export your data or clear specific histories.</p>

      <div className="space-y-4">
        {/* Export */}
        <div className="bg-background border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Export My Data (PDF)</h3>
          <p className="text-[11px] text-subtle font-medium mb-4 leading-relaxed">Download all your Loksewa AI data including study plans, quiz history, notes, and exam information as a professionally formatted PDF document.</p>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export as PDF
          </button>
        </div>

        {/* Clear Chat */}
        <div className="bg-background border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Clear Chat History</h3>
          <p className="text-[11px] text-subtle font-medium mb-4 leading-relaxed">Permanently delete all your Loksewa Guru conversation history across all exams. This cannot be undone.</p>
          <button onClick={() => setClearChatOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Clear Chat History
          </button>
        </div>

        {/* Clear Quiz */}
        <div className="bg-background border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Clear Quiz History</h3>
          <p className="text-[11px] text-subtle font-medium mb-4 leading-relaxed">Permanently delete all your quiz attempts. This will reset your performance charts and topic score history.</p>
          <button onClick={() => setClearQuizOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Clear Quiz History
          </button>
        </div>
      </div>

      <ConfirmModal isOpen={clearChatOpen} onClose={() => setClearChatOpen(false)} onConfirm={handleClearChat} title="Clear All Chat History?" description="This permanently deletes all your Loksewa Guru conversation history. This action cannot be undone." confirmLabel="Delete All Chats" variant="danger" loading={clearingChat} />
      <ConfirmModal isOpen={clearQuizOpen} onClose={() => setClearQuizOpen(false)} onConfirm={handleClearQuiz} title="Clear All Quiz History?" description="This permanently deletes all your quiz attempts and resets your performance data. This action cannot be undone." confirmLabel="Delete All Quizzes" variant="danger" loading={clearingQuiz} />
    </div>
  );
}
