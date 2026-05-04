'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LimitType = 'document_limit' | 'chat_limit' | 'quiz_limit' | 'notes_limit' | 'exam_limit' | null;

interface UpgradeModalContextType {
  isOpen: boolean;
  limitType: LimitType;
  showUpgradeModal: (type?: LimitType) => void;
  hideUpgradeModal: () => void;
  selectedPlan: string | null;
  setSelectedPlan: (plan: string | null) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [limitType, setLimitType] = useState<LimitType>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const showUpgradeModal = (type: LimitType = null) => {
    setLimitType(type);
    setIsOpen(true);
  };

  const hideUpgradeModal = () => {
    setIsOpen(false);
    setLimitType(null);
  };

  return (
    <UpgradeModalContext.Provider value={{ 
      isOpen, 
      limitType, 
      showUpgradeModal, 
      hideUpgradeModal,
      selectedPlan,
      setSelectedPlan
    }}>
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (context === undefined) {
    throw new Error('useUpgradeModal must be used within an UpgradeModalProvider');
  }
  return context;
}
