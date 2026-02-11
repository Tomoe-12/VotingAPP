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
    aboutUs: 'About Us',
    aboutDescription1: 'Welcome to the annual University King & Queen voting event! This prestigious tradition celebrates the most outstanding students who exemplify leadership, talent, and character.',
    aboutDescription2: 'Each year, students from all departments nominate their peers who have made significant contributions to campus life, demonstrated exceptional qualities, and inspired their fellow students.',
    aboutDescription3: 'Cast your vote for the candidates who you believe best represent the spirit and values of our university community. Your voice matters in choosing the next King and Queen!',
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
    aboutUs: 'ကျွန်ုပ်တို့အကြောင်း',
    aboutDescription1: 'နှစ်စဉ်ကျင်းပသော တက္ကသိုလ် ဘုရင်နှင့်ဘုရင်မ မဲပေးပွဲသို့ ကြိုဆိုပါသည်။ ဤဂုဏ်သိက္ခာရှိသော အစဉ်အလာသည် ခေါင်းဆောင်မှု၊ အရည်အချင်းနှင့် စရိုက်လက္ခဏာကို ပြသသော ထူးချွန်သော ကျောင်းသားများကို ဂုဏ်ပြုခြင်းဖြစ်ပါသည်။',
    aboutDescription2: 'နှစ်စဉ် ဌာနအားလုံးမှ ကျောင်းသားများသည် ကျောင်းဘဝတွင် အရေးပါသော ပံ့ပိုးမှုများ ပြုလုပ်ပေးခဲ့သော၊ ထူးခြားသော အရည်အသွေးများ ပြသခဲ့သော နှင့် သူတို့၏ အတန်းဖော်များကို လှုံ့ဆော်ပေးခဲ့သော သူတို့၏ရွယ်တူငယ်ချင်းများကို အမည်စာရင်းတင်သွင်းကြပါသည်။',
    aboutDescription3: 'ကျွန်ုပ်တို့၏ တက္ကသိုလ်အသိုင်းအဝိုင်း၏ စိတ်ဓာတ်နှင့် တန်ဖိုးများကို အကောင်းဆုံး ကိုယ်စားပြုသည်ဟု သင်ယုံကြည်သော ကိုယ်စားလှယ်များအတွက် သင်၏မဲကို ပေးပါ။ နောက်ထပ် ဘုရင်နှင့်ဘုရင်မကို ရွေးချယ်ရာတွင် သင်၏အသံသည် အရေးကြီးပါသည်။',
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
