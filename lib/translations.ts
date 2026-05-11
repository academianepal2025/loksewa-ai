export type Language = 'en' | 'np';

export const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    exams: 'My Exams',
    study_plan: 'Study Plan',
    study_notes: 'Study Notes',
    documents: 'My Documents',
    guru: 'Loksewa Guru',
    practice: 'Practice',
    performance: 'Performance',
    settings: 'Settings',
    intelligence: 'AI Smart Tools',
    logout: 'Logout',

    // Dashboard Home
    mission_command: 'Dashboard',
    active_mission: 'Current Study Goal',
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
    days_left: 'Days Left',
    guru_title: 'LOKSEWA GURU',
    guru_status_active: 'ONLINE & READY',
    guru_status_thinking: 'THINKING...',
    guru_processing: 'Analyzing Materials',
    guru_empty_title: "नमस्ते! I'm Loksewa Guru",
    guru_empty_subtitle: "Your AI-powered Loksewa tactical partner. Ask me anything about your uploaded syllabus, notes, and previous year questions.",
    guru_suggested_1: 'What are my most important syllabus topics?',
    guru_suggested_2: "Quiz me on today's study topic",
    guru_suggested_3: 'What topics appear most in my PYQs?',
    guru_suggested_4: 'Summarize my weakest area',
    guru_placeholder: 'Ask Guru anything...',
    guru_history: 'Chat History',
    guru_new_chat: 'New Chat',
    guru_transmissions: 'MESSAGES',
    guru_no_history: 'No recent chats',
    guru_ai_disclaimer: 'AI responses are based on your uploaded materials'
  },
  np: {
    // Nav
    dashboard: 'ड्यासबोर्ड',
    exams: 'मेरो परीक्षाहरू',
    study_plan: 'अध्ययन योजना',
    study_notes: 'अध्ययन नोटहरू',
    documents: 'मेरो सामग्रीहरू',
    guru: 'लोकसेवा गुरु',
    practice: 'अभ्यास',
    performance: 'कार्यसम्पादन',
    settings: 'सेटिङहरू',
    intelligence: 'एआई स्मार्ट टुलहरू',
    logout: 'लगआउट',

    // Dashboard Home
    mission_command: 'ड्यासबोर्ड',
    active_mission: 'हालको अध्ययन लक्ष्य',
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
    days_left: 'दिन बाँकी',
    guru_title: 'लोकसेवा गुरु',
    guru_status_active: 'अनलाइन र तयार',
    guru_status_thinking: 'सोच्दै...',
    guru_processing: 'सामग्री विश्लेषण हुँदैछ',
    guru_empty_title: "नमस्ते! म लोकसेवा गुरु हुँ",
    guru_empty_subtitle: "तपाईको एआई-आधारित लोकसेवा रणनीतिक साझेदार। तपाईंका सामग्रीहरू, पाठ्यक्रम र विगतका प्रश्नहरूका बारेमा मलाई केहि पनि सोध्नुहोस्।",
    guru_suggested_1: 'मेरो लागि सबैभन्दा महत्त्वपूर्ण पाठ्यक्रम शीर्षकहरू के के हुन्?',
    guru_suggested_2: 'आजको अध्ययन विषयमा मलाई प्रश्न सोध्नुहोस्',
    guru_suggested_3: 'विगतका प्रश्नहरूमा कुन शीर्षकहरू बढी सोधिएका छन्?',
    guru_suggested_4: 'मेरो कमजोर क्षेत्रको सारांश दिनुहोस्',
    guru_placeholder: 'गुरुलाई केहि सोध्नुहोस्...',
    guru_history: 'च्याट इतिहास',
    guru_new_chat: 'नयाँ च्याट',
    guru_transmissions: 'सन्देशहरू',
    guru_no_history: 'कुनै पुराना च्याटहरू छैनन्',
    guru_ai_disclaimer: 'एआई प्रतिक्रियाहरू तपाईंका सामग्रीहरूमा आधारित छन्'
  }
};

export type TranslationKey = keyof typeof translations.en;
