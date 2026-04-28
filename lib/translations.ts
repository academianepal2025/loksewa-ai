export type Language = 'en' | 'np';

export const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    exams: 'My Exams',
    study_plan: 'Study Plan',
    documents: 'Material Repo',
    guru: 'Loksewa Guru',
    practice: 'Practice',
    performance: 'Performance',
    settings: 'Settings',
    intelligence: 'Intelligence Hub',
    logout: 'Logout',

    // Dashboard Home
    mission_command: 'Mission Command',
    active_mission: 'Active Intelligence Mission',
    ready_percent: 'Overall Readiness',
    days_rem: 'Days Remaining',
    continue_study: 'CONTINUE STUDYING',
    
    // Stats
    streak: 'Focus Streak',
    accuracy: 'Quiz Accuracy',
    hours: 'Study Hours',
    gaps: 'Syllabus Gaps',

    // Feedback
    coach_report: 'AI Coach Report',
    full_recap: 'FULL RECAP',
    strategy_update: 'Strategy Update',
    stronghold: 'Stronghold',
    target_area: 'Target Area',
    brief_guru: 'Brief AI Guru on Gaps',

    // Practice
    flashcards: 'Flashcards',
    quizzes: 'Quizzes',
    generate: 'Generate',
    mock_test: 'Mock Test',
    study_roadmap: 'Study Roadmap',
    timeline: 'Timeline',
    milestones: 'Milestones',
    intensity: 'Intensity',
    high_energy: 'High Energy',
    recall_spacing: 'Recall Spacing',
    priority_weighting: 'Priority Weighting',
    days_left: 'Days Left'
  },
  np: {
    // Nav
    dashboard: 'ड्यासबोर्ड',
    exams: 'मेरो परीक्षाहरू',
    study_plan: 'अध्ययन योजना',
    documents: 'सामग्री भण्डार',
    guru: 'लोकसेवा गुरु',
    practice: 'अभ्यास',
    performance: 'कार्यसम्पादन',
    settings: 'सेटिङहरू',
    intelligence: 'खुफिया हब',
    logout: 'लगआउट',

    // Dashboard Home
    mission_command: 'मिशन कमाण्ड',
    active_mission: 'सक्रिय खुफिया मिशन',
    ready_percent: 'समग्र तयारी',
    days_rem: 'दिन बाँकी',
    continue_study: 'अध्ययन जारी राख्नुहोस्',

    // Stats
    streak: 'निरन्तरता',
    accuracy: 'क्विज शुद्धता',
    hours: 'अध्ययन समय',
    gaps: 'पाठ्यक्रम अन्तराल',

    // Feedback
    coach_report: 'एआई कोच रिपोर्ट',
    full_recap: 'पूर्ण विवरण',
    strategy_update: 'रणनीति अपडेट',
    stronghold: 'मजबुत क्षेत्र',
    target_area: 'बढि ध्यान दिनुपर्ने',
    brief_guru: 'गुरुसँग परामर्श लिनुहोस्',

    // Practice
    flashcards: 'फ्ल्यासकार्डहरू',
    quizzes: 'क्विजहरू',
    generate: 'तयार पार्नुहोस्',
    mock_test: 'नमुना परीक्षा',
    study_roadmap: 'अध्ययन मार्गचित्र',
    timeline: 'समयरेखा',
    milestones: 'महत्वपूर्ण उपलब्धि',
    intensity: 'तीव्रता',
    high_energy: 'उच्च ऊर्जा',
    recall_spacing: 'अन्तराल अभ्यास',
    priority_weighting: 'प्राथमिकता भार',
    days_left: 'दिन बाँकी'
  }
};

export type TranslationKey = keyof typeof translations.en;
