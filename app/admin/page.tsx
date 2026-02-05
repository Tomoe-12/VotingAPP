'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Crown, Trash2, Plus, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { MultiImageUpload } from '@/components/multi-image-upload'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

interface Candidate {
  id: string
  name: string
  category: 'king' | 'queen'
  image: string
  image2?: string
  image3?: string
  votes: number
  age?: number
  height?: string
  major?: string
  year?: string
  hobbies?: string
  hometown?: string
}

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [newName, setNewName] = useState('')
  const [newImages, setNewImages] = useState<string[]>([])
  const [newAge, setNewAge] = useState('')
  const [newHeight, setNewHeight] = useState('')
  const [newMajor, setNewMajor] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newHobbies, setNewHobbies] = useState('')
  const [newHometown, setNewHometown] = useState('')
  const [newCategory, setNewCategory] = useState<'king' | 'queen'>('king')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [candidateToRemove, setCandidateToRemove] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const storedCandidates = localStorage.getItem('candidates')
    if (storedCandidates) {
      setCandidates(JSON.parse(storedCandidates))
    }
  }, [])

  const addCandidate = () => {
    if (!newName.trim()) return

    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      image: newImages[0] || '/placeholder.jpg',
      image2: newImages[1] || undefined,
      image3: newImages[2] || undefined,
      votes: 0,
      age: newAge ? parseInt(newAge) : undefined,
      height: newHeight.trim() || undefined,
      major: newMajor.trim() || undefined,
      year: newYear.trim() || undefined,
      hobbies: newHobbies.trim() || undefined,
      hometown: newHometown.trim() || undefined
    }

    const updatedCandidates = [...candidates, newCandidate]
    setCandidates(updatedCandidates)
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates))
    setNewName('')
    setNewImages([])
    setNewAge('')
    setNewHeight('')
    setNewMajor('')
    setNewYear('')
    setNewHobbies('')
    setNewHometown('')
  }

  const handleRemoveClick = (id: string, name: string) => {
    setCandidateToRemove({ id, name })
    setShowRemoveDialog(true)
  }

  const confirmRemoveCandidate = () => {
    if (!candidateToRemove) return
    const updatedCandidates = candidates.filter(c => c.id !== candidateToRemove.id)
    setCandidates(updatedCandidates)
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates))
    setCandidateToRemove(null)
  }

  const confirmResetVotes = () => {
    const resetCandidates = candidates.map(c => ({ ...c, votes: 0 }))
    setCandidates(resetCandidates)
    localStorage.setItem('candidates', JSON.stringify(resetCandidates))
    localStorage.removeItem('votedKing')
    localStorage.removeItem('votedQueen')
  }

  const kingCandidates = candidates.filter(c => c.category === 'king')
  const queenCandidates = candidates.filter(c => c.category === 'queen')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Admin Panel</h1>
            <Button onClick={() => setShowResetDialog(true)} variant="destructive" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Votes
            </Button>
          </div>
        </div>

        {/* Add Candidate Form */}
        <Card className="mb-12 border-border">
          <CardHeader>
            <CardTitle className="font-serif">Add Candidate</CardTitle>
            <CardDescription>Add a new candidate to the election</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">Category *</Label>
                  <Select value={newCategory} onValueChange={(value: 'king' | 'queen') => setNewCategory(value)}>
                    <SelectTrigger id="category" className="border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="king">King</SelectItem>
                      <SelectItem value="queen">Queen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age" className="text-sm font-medium mb-2 block">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="18"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-medium mb-2 block">Height</Label>
                  <Input
                    id="height"
                    placeholder={'5\'6"'}
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="hometown" className="text-sm font-medium mb-2 block">Hometown</Label>
                  <Input
                    id="hometown"
                    placeholder="e.g., Mumbai"
                    value={newHometown}
                    onChange={(e) => setNewHometown(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="major" className="text-sm font-medium mb-2 block">Major/Department</Label>
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="year" className="text-sm font-medium mb-2 block">Year</Label>
                  <Input
                    id="year"
                    placeholder="e.g., Year 1"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="hobbies" className="text-sm font-medium mb-2 block">Hobbies</Label>
                  <Input
                    id="hobbies"
                    placeholder="e.g., Basketball, Reading, Music"
                    value={newHobbies}
                    onChange={(e) => setNewHobbies(e.target.value)}
                    className="border-border"
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="border-t pt-4 mt-4">
                <MultiImageUpload
                  label="Candidate Images"
                  images={newImages}
                  onChange={setNewImages}
                  maxImages={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={addCandidate} size="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* King Candidates */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">King Candidates</h2>
            <Badge variant="outline">{kingCandidates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kingCandidates.map((candidate, index) => (
              <Card key={candidate.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Candidate Number */}
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-medium text-sm text-primary flex-shrink-0">
                      {index + 1}
                    </div>
                    
                    {/* Candidate Image */}
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {candidate.image ? (
                        <img 
                          src={candidate.image || "/placeholder.svg"} 
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Crown className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    
                    {/* Candidate Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold truncate">{candidate.name}</h3>
                      {(candidate.major || candidate.year) && (
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {candidate.major}{candidate.major && candidate.year ? ', ' : ''}{candidate.year}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">{candidate.votes} votes</p>
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      onClick={() => handleRemoveClick(candidate.id, candidate.name)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {kingCandidates.length === 0 && (
              <p className="text-muted-foreground col-span-2 py-4">No candidates added yet</p>
            )}
          </div>
        </div>

        {/* Queen Candidates */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Queen Candidates</h2>
            <Badge variant="outline">{queenCandidates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {queenCandidates.map((candidate, index) => (
              <Card key={candidate.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Candidate Number */}
                    <div className="w-7 h-7 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center font-medium text-sm text-secondary flex-shrink-0">
                      {index + 1}
                    </div>
                    
                    {/* Candidate Image */}
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {candidate.image ? (
                        <img 
                          src={candidate.image || "/placeholder.svg"} 
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Crown className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    
                    {/* Candidate Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold truncate">{candidate.name}</h3>
                      {(candidate.major || candidate.year) && (
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {candidate.major}{candidate.major && candidate.year ? ', ' : ''}{candidate.year}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">{candidate.votes} votes</p>
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      onClick={() => handleRemoveClick(candidate.id, candidate.name)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {queenCandidates.length === 0 && (
              <p className="text-muted-foreground col-span-2 py-4">No candidates added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={confirmResetVotes}
        title="Reset All Votes"
        description="This action will reset all votes to zero and clear all voting records. This cannot be undone."
        confirmText="I will reset the whole votes"
      />

      <ConfirmationDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        onConfirm={confirmRemoveCandidate}
        title="Remove Candidate"
        description={`Are you sure you want to remove ${candidateToRemove?.name}? This action cannot be undone.`}
        confirmText={`I want to remove ${candidateToRemove?.name}`}
      />
    </div>
  )
}
