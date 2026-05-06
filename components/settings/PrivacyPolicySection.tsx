'use client';

import { useState, useRef } from 'react';
import { Printer } from 'lucide-react';

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
          <p className="text-xs text-subtle font-medium">Last updated: January 2025</p>
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

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">1. Introduction</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">Loksewa AI is a PSC Nepal exam preparation platform operated in Nepal. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our web application at loksewai.com. By using Loksewa AI you agree to the collection and use of information in accordance with this policy. We are committed to ensuring that your privacy is protected and that we handle your data responsibly and transparently.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">2. Information We Collect</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">We collect the following types of information when you use Loksewa AI. <strong>Account Information</strong> including your full name, email address, and phone number that you provide during signup and in your profile settings. <strong>Study Materials</strong> including the PDF documents, images, and notes you upload to the platform for exam preparation purposes. These are stored securely and are only accessible by you. <strong>Usage Data</strong> including information about how you use the platform such as study plan generation, quiz attempts, chat messages with Loksewa Guru, flashcard sessions, and notes generation. This data is used to provide you with personalized recommendations and performance insights. <strong>Payment Information</strong> including your name and phone number provided during payment, and a screenshot of your payment confirmation. We do not collect or store any credit card numbers or banking credentials. <strong>Device Information</strong> including basic information about your browser and device type for the purpose of optimizing the application for your screen size.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">3. How We Use Your Information</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">We use the information we collect for the following purposes. To provide and improve our services including generating personalized study plans, powering the Loksewa Guru AI assistant with your uploaded materials, generating quizzes and flashcards, and tracking your study progress. To process payments by reviewing your payment screenshots and phone numbers to verify and activate your subscription plan. To communicate with you about your account, plan status, and important updates related to your exam preparation. To analyze usage patterns in aggregate to understand which features are most helpful and to improve the platform. To ensure platform security and prevent fraudulent activity or misuse of the service.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">4. How We Store Your Data</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">Your data is stored securely using Supabase which is a trusted cloud database provider with industry standard security practices including data encryption at rest and in transit. Your uploaded documents and payment screenshots are stored in secure private cloud storage and are not publicly accessible. Access to your files is controlled through authenticated sessions and signed URLs that expire after a short period. We retain your data for as long as your account is active. If you delete your account all your personal data including uploaded documents, study plans, quiz history, and chat history is permanently deleted from our systems within 7 days.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">5. AI and Your Data</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">Loksewa AI uses third party AI APIs including Google Gemini and Anthropic Claude to power features like the Loksewa Guru chatbot, study plan generation, quiz creation, and notes generation. When you use these features relevant content from your uploaded documents and your queries are sent to these AI providers for processing. We do not send your personal identity information such as your name or email to AI providers. The content of your uploaded study materials may be processed by these AI services to generate responses. Please review the privacy policies of Google and Anthropic for information on how they handle data sent to their APIs. We use AI services that do not use your data to train their models by default.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">6. Sharing Your Information</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">We do not sell, trade, or rent your personal information to third parties. We do not share your personal data with advertisers. We may share data with trusted service providers who help us operate the platform such as our cloud storage provider and AI API providers, but only to the extent necessary to provide the service. We may disclose your information if required by law or to protect the rights and safety of our users and platform.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">7. Your Rights</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">You have the following rights regarding your personal data. The right to access all the data we hold about you by using the Export My Data feature in your settings. The right to correct inaccurate information by updating your profile in settings. The right to delete your account and all associated data using the Delete Account option in settings. The right to withdraw consent by stopping use of the platform and requesting account deletion. To exercise any of these rights you can use the self-service options in your settings page or contact us at support@loksewai.com.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">8. Cookies and Local Storage</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">Loksewa AI uses browser local storage to maintain your login session and remember your preferences such as your last selected exam and UI settings. We do not use third party advertising cookies. We do not use tracking pixels or third party analytics services that share your data with advertisers.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">9. Children's Privacy</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">Loksewa AI is intended for use by individuals preparing for Nepal PSC exams and is not directed at children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information please contact us and we will delete it promptly.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">10. Changes to This Policy</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. When we make significant changes we will notify you by displaying a notice in the application. The date at the top of this policy indicates when it was last updated. Your continued use of Loksewa AI after changes are posted constitutes your acceptance of the updated policy.</p>

        <h2 className="text-[12px] font-black text-foreground mt-8 mb-3 uppercase tracking-widest">11. Contact Us</h2>
        <p className="text-[13px] text-foreground/80 leading-relaxed">If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data please contact us at support@loksewai.com. We aim to respond to all privacy related inquiries within 5 business days. You can also reach us through the feedback widget in the application.</p>
      </div>
      )}
    </div>
  );
}
