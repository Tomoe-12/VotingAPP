'use client'

import React from "react"

import { useState } from 'react'
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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  if (validImages.length === 0) {
    return (
      <div className="aspect-[4/5] bg-muted flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
        {numberBadge}
        <div className="text-muted-foreground text-sm">No image available</div>
      </div>
    )
  }

  return (
    <div className="aspect-[4/5] bg-muted relative overflow-hidden group/carousel">
      {/* Current Image */}
      <img
        src={validImages[currentIndex] || "/placeholder.svg"}
        alt={`${name} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
      
      {/* Number Badge */}
      {numberBadge}

      {/* Navigation Arrows - only show if more than 1 image */}
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
