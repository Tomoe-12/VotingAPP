'use client'

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CandidateImageCarouselProps {
  images: (string | undefined)[]
  name: string
  numberBadge: React.ReactNode
}

export function CandidateImageCarousel({ images, name, numberBadge }: CandidateImageCarouselProps) {
  const validImages = images.filter(Boolean) as string[]
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scrolling logic
  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, 2500); // ၃.၅ စက္ကန့်ခြားတစ်ခါ scroll ဖြစ်မယ်
    return () => clearInterval(interval);
  }, [currentIndex, validImages.length]);

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  if (validImages.length === 0) return null;

  return (
    <div className="aspect-4/5 bg-muted relative overflow-hidden group/carousel">
      {/* Scrolling Container */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((src, index) => (
          <div key={index} className="w-full h-full shrink-0">
            <img
              src={src || "/placeholder.svg"}
              alt={`${name} - ${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
      
      {numberBadge}

      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}