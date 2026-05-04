'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, ExternalLink, Info, X } from 'lucide-react';

const FAQ = [
  { q: 'How do I generate a study plan?', a: 'Upload your syllabus PDF in the Documents section first. Once it shows Ready status, go to Study Plan and click Generate My Study Plan. The AI will analyze your syllabus and create a personalized day-by-day plan.' },
  { q: 'Why is Loksewa Guru not answering my questions correctly?', a: 'Loksewa Guru only answers based on your uploaded study materials. If you ask about a topic you have not uploaded notes for, it will tell you the information is not found. Upload more study materials covering that topic to get better answers.' },
  { q: 'What file formats are supported for upload?', a: 'We support PDF files and image files including JPG, JPEG, and PNG. Each file can be up to 10 megabytes. For best results use clear, text-based PDFs rather than scanned images.' },
  { q: 'How long does document processing take?', a: 'Most documents process within 30 to 60 seconds. If a document shows Failed status, try deleting it and uploading again. Very large or complex PDFs may take longer.' },
  { q: 'How do I generate study notes?', a: 'Go to your Study Plan page. Each day card has a Generate Notes button. Click it and the AI will create comprehensive study notes for that topic based on your uploaded materials.' },
  { q: 'How do I upgrade my plan?', a: 'Click the Upgrade Plan button in the Subscription & Billing section above, or wait until you hit a free tier limit and the upgrade options will appear automatically.' },
  { q: 'How long does plan activation take after payment?', a: 'After submitting your payment screenshot, our team reviews it and activates your plan within 24 hours. You will see the status update in the Subscription & Billing section.' },
  { q: 'Can I use Loksewa AI on my phone?', a: 'Yes. The application is fully responsive and works on mobile browsers. You can also install it on your home screen as an app by tapping Add to Home Screen in your browser menu.' },
];

export function HelpSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">Help</h2>
      <p className="text-xs text-subtle font-medium mb-6">Frequently asked questions and support.</p>

      {/* FAQ Accordion */}
      <div className="space-y-2 mb-6">
        {FAQ.map((item, i) => (
          <div key={i} className="border border-border-subtle rounded-xl overflow-hidden">
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-background/50 transition-all">
              <span className="text-sm font-bold text-foreground pr-4">{item.q}</span>
              {openIdx === i ? <ChevronUp className="h-4 w-4 text-subtle flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-subtle flex-shrink-0" />}
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-[12px] text-foreground/70 leading-relaxed border-t border-border-subtle pt-3">{item.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-background border border-border-subtle rounded-xl p-5 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent" /> Contact Support</h3>
        <p className="text-[11px] text-subtle font-medium mb-3">Email: support@loksewai.com</p>
        <a href="https://wa.me/9779808493504" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all">
          <MessageSquare className="h-3.5 w-3.5" /> Chat on WhatsApp <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Version */}
      <div className="bg-background border border-border-subtle rounded-xl p-5 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2"><Info className="h-4 w-4 text-accent" /> App Version</h3>
        <p className="text-[11px] text-subtle font-medium">Version 0.1.0 · Built on May 2025</p>
      </div>

      {/* Terms */}
      <button onClick={() => setShowTerms(true)} className="text-[11px] font-bold text-accent hover:underline uppercase tracking-wider">View Terms of Use</button>

      {showTerms && (
        <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Terms of Use</h3>
              <button onClick={() => setShowTerms(false)} className="text-subtle hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-[12px] text-foreground/70 space-y-3 leading-relaxed">
              <p>By using Loksewa AI, you agree to the following terms:</p>
              <p><strong>1. Personal Use Only</strong> — Loksewa AI is intended for personal exam preparation use only. Commercial redistribution of content generated by the platform is prohibited.</p>
              <p><strong>2. Account Security</strong> — Sharing your account credentials with others is prohibited. You are responsible for maintaining the security of your account.</p>
              <p><strong>3. Content Guidelines</strong> — Uploaded content must not violate copyright laws. You must have the right to upload any materials you submit to the platform.</p>
              <p><strong>4. Service Changes</strong> — The service may be updated, modified, or changed with reasonable notice. We strive to communicate significant changes in advance.</p>
              <p><strong>5. Fair Use</strong> — Excessive or automated use that degrades service quality for other users may result in temporary restrictions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
