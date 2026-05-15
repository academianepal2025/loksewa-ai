'use client';

import { useState, useRef } from 'react';
import { Printer } from 'lucide-react';
import { PRIVACY_POLICY } from '@/lib/legal-data';

export function PrivacyPolicySection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Loksewa AI Privacy Policy</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#222;line-height:1.7}h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:2rem}p{margin-bottom:1rem;font-size:0.95rem}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tighter mb-1 uppercase">Privacy Policy</h2>
          <p className="text-xs text-subtle font-medium">Last updated: {PRIVACY_POLICY.lastUpdated}</p>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-all shadow-sm">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1e3a5f]/10"
          >
            {isExpanded ? 'Hide Policy' : 'Read Full Policy'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div ref={printRef} className="reading-area prose prose-sm max-w-none text-foreground/90 animate-in fade-in slide-in-from-top-2 duration-300" style={{ lineHeight: '1.75' }}>
          <p className="text-[11px] font-black text-[#c9a84c] uppercase tracking-widest mb-6">Loksewa AI Data Protection Protocol</p>

          {PRIVACY_POLICY.sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">{section.title}</h2>
              <p className="text-[13px] text-foreground/80 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
