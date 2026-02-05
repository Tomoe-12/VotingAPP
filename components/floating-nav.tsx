'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Switch } from '@/components/ui/switch'
import { Crown } from 'lucide-react'
import Link from 'next/link'

export function FloatingNav() {
  const { language, setLanguage } = useLanguage()
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['king-section', 'queen-section']
      const scrollPosition = window.scrollY + 200

      // Check if we're at the top (home)
      if (window.scrollY < 300) {
        setActiveSection('home')
        return
      }

      // Check which section is in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            return
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveSection('home')
    } else {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-muted/60 backdrop-blur-xl border border-border/50 rounded-full shadow-xl px-3 py-2 flex items-center gap-2">
        {/* Navigation Links */}
        <button
          onClick={() => scrollToSection('home')}
          className={`px-5 py-2 rounded-full text-base font-medium transition-all ${
            activeSection === 'home' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Home
        </button>
        <button 
          onClick={() => scrollToSection('king-section')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSection === 'king-section' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          King
        </button>
        <button 
          onClick={() => scrollToSection('queen-section')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSection === 'queen-section' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Queen
        </button>
        
        {/* Divider */}
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Language Switch */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-sm text-muted-foreground">🇬🇧</span>
          <Switch
            checked={language === 'my'}
            onCheckedChange={(checked) => setLanguage(checked ? 'my' : 'en')}
          />
          <span className="text-sm text-muted-foreground">🇲🇲</span>
        </div>
      </div>
    </div>
  )
}
