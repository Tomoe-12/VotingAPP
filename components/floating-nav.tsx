'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Switch } from '@/components/ui/switch'
import { Crown, Home, Info, User } from 'lucide-react'
import Link from 'next/link'

export function FloatingNav() {
  const { language, setLanguage } = useLanguage()
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['king-section', 'queen-section', 'about-section']
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
    <div className="fixed md:top-6 bottom-4 md:bottom-auto left-1/2 -translate-x-1/2 z-50 w-full md:w-auto px-4 md:px-0">
      <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-full px-3 py-2.5 md:py-2.5 py-3 flex items-center gap-1.5 md:gap-2 justify-between md:justify-start max-w-md md:max-w-none mx-auto">
        {/* Navigation Links */}
        <button
          onClick={() => scrollToSection('home')}
          className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === 'home' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] md:hidden">Home</span>
          <span className="hidden md:inline ml-2">Home</span>
        </button>
        <button 
          onClick={() => scrollToSection('king-section')}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === 'king-section' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span className="text-[10px] md:hidden">King</span>
          <span className="hidden md:inline ml-2">King</span>
        </button>
        <button 
          onClick={() => scrollToSection('queen-section')}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === 'queen-section' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] md:hidden">Queen</span>
          <span className="hidden md:inline ml-2">Queen</span>
        </button>
        <button 
          onClick={() => scrollToSection('about-section')}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === 'about-section' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Info className="w-4 h-4" />
          <span className="text-[10px] md:hidden">About</span>
          <span className="hidden md:inline ml-2">About</span>
        </button>
      </div>
    </div>
  )
}
