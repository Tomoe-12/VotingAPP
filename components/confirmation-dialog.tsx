'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText: string
  destructive?: boolean
  confirmButtonText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  destructive = true,
  confirmButtonText,
  variant,
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const isMatch = inputValue === confirmText

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm()
      setInputValue('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setInputValue('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {destructive && (
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            )}
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Label htmlFor="confirm-text" className="text-sm font-medium text-muted-foreground">
            Type the following to confirm:
          </Label>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <code className={`text-sm font-mono font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>{confirmText}</code>
          </div>
          <Input
            id="confirm-text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type to confirm..."
            className={`font-mono transition-colors ${
              inputValue && !isMatch 
                ? 'border-destructive/50 focus-visible:ring-destructive/50' 
                : isMatch 
                ? 'border-green-500/50 focus-visible:ring-green-500/50' 
                : ''
            }`}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isMatch) {
                handleConfirm()
              }
            }}
          />
          {inputValue && !isMatch && (
            <p className="text-xs text-destructive">Text does not match. Please type exactly as shown above.</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant={variant || (destructive ? 'destructive' : 'default')}
            onClick={handleConfirm}
            disabled={!isMatch}
            className={!isMatch ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {confirmButtonText || (destructive ? 'Delete' : 'Confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
