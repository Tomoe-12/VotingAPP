'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'my'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    title: 'Fresher Welcome Election',
    subtitle: "Cast your vote for this year's King and Queen",
    votesCount: 'votes cast',
    king: 'King',
    queen: 'Queen',
    selectCandidate: 'Select your candidate',
    voteRecorded: 'Your vote has been recorded',
    vote: 'vote',
    votes: 'votes',
    castVote: 'Cast vote',
    yourVote: 'Your vote',
    voted: 'Voted',
  },
  my: {
    title: 'လတ်တလောကြိုဆိုပွဲ ရွေးကောက်ပွဲ',
    subtitle: 'ယခုနှစ်၏ ဘုရင်နှင့် ဘုရင်မအတွက် သင်၏မဲကို ပေးပါ',
    votesCount: 'မဲပေးပြီး',
    king: 'ဘုရင်',
    queen: 'ဘုရင်မ',
    selectCandidate: 'သင်၏ကိုယ်စားလှယ်ကို ရွေးချယ်ပါ',
    voteRecorded: 'သင်၏မဲကို မှတ်တမ်းတင်ပြီးပါပြီ',
    vote: 'မဲ',
    votes: 'မဲများ',
    castVote: 'မဲပေးမည်',
    yourVote: 'သင်၏မဲ',
    voted: 'မဲပေးပြီး',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language
    if (stored && (stored === 'en' || stored === 'my')) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
