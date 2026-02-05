'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Link as LinkIcon } from 'lucide-react'

interface MultiImageUploadProps {
  label: string
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function MultiImageUpload({ label, images, onChange, maxImages = 3 }: MultiImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const remainingSlots = maxImages - images.length

    if (remainingSlots <= 0) return

    const filesToProcess = imageFiles.slice(0, remainingSlots)
    let processedCount = 0

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        processedCount++
        
        onChange([...images, result])
        
        if (processedCount === filesToProcess.length) {
          // Reset input
          if (inputRef.current) {
            inputRef.current.value = ''
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUrlUpload = () => {
    if (urlInput.trim() && images.length < maxImages) {
      onChange([...images, urlInput.trim()])
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label} ({images.length}/{maxImages})
      </Label>

      {/* Preview Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative border border-border rounded-lg p-2 bg-muted/30">
              <img
                src={img || "/placeholder.svg"}
                alt={`Image ${index + 1}`}
                className="w-full h-24 rounded object-cover mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Image {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="hidden"
            />
            
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Select image files to upload
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              or drag and drop them here (up to {maxImages - images.length} more)
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose Files
            </Button>
          </div>

          {/* URL Upload Option */}
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Or upload from URL
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                className="flex-1"
              />
              <Button type="button" onClick={handleUrlUpload} size="sm">
                Upload
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
