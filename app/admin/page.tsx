'use client'

import React from "react"
import { Trophy } from 'lucide-react' // Import Trophy component

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
import { uploadImageFile } from '@/lib/storage'
import {
  addCandidate,
  clearVotes,
  removeCandidate,
  resetCandidateVotes,
  setVotingStatus as setVotingStatusInDb,
  subscribeCandidates,
  subscribeVotingStatus,
  type CandidateRecord,
  type VotingStatus,
} from '@/lib/voting-data'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState('')
  const [candidates, setCandidates] = useState<CandidateRecord[]>([])
  const [newName, setNewName] = useState('')
  const [newImageUrls, setNewImageUrls] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newAge, setNewAge] = useState('')
  const [newHeight, setNewHeight] = useState('')
  const [newMajor, setNewMajor] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newHobbies, setNewHobbies] = useState('')
  const [newHometown, setNewHometown] = useState('')
  const [newCategory, setNewCategory] = useState<'king' | 'queen'>('king')
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false)
  const [createCandidateError, setCreateCandidateError] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showStartVotingDialog, setShowStartVotingDialog] = useState(false)
  const [showEndVotingDialog, setShowEndVotingDialog] = useState(false)
  const [showResetStatusDialog, setShowResetStatusDialog] = useState(false)
  const [candidateToRemove, setCandidateToRemove] = useState<{ id: string; name: string } | null>(null)
  const [votingStatus, setVotingStatus] = useState<VotingStatus>('not-started')
  const [aliasCanonical, setAliasCanonical] = useState('')
  const [aliasToken, setAliasToken] = useState('')
  const [aliasUrl, setAliasUrl] = useState('')
  const [aliasError, setAliasError] = useState('')
  const [isGeneratingAlias, setIsGeneratingAlias] = useState(false)
  const [origin, setOrigin] = useState('')
  const [tokenPrefix, setTokenPrefix] = useState('PAOH')
  const [tokenStart, setTokenStart] = useState('1')
  const [tokenEnd, setTokenEnd] = useState('1000')
  const [isSeedingTokens, setIsSeedingTokens] = useState(false)
  const [seedResult, setSeedResult] = useState('')
  const [seedError, setSeedError] = useState('')

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setPasswordError(false)
    setAuthError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setAdminToken(password)
        setPassword('')
        setPasswordError(false)
        return
      }

      setPasswordError(true)
      setAuthError('Incorrect password. Please try again.')
      setPassword('')
    } catch (error) {
      console.error('Admin login failed', error)
      setPasswordError(true)
      setAuthError('Unable to verify password. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleStartVoting = async () => {
    await setVotingStatusInDb('active')
    setShowStartVotingDialog(false)
  }

  const handleEndVoting = async () => {
    await setVotingStatusInDb('ended')
    setShowEndVotingDialog(false)
  }

  const handleResetVotingStatus = async () => {
    await setVotingStatusInDb('not-started')
    setShowResetStatusDialog(false)
  }

  useEffect(() => {
    const unsubscribeCandidates = subscribeCandidates(setCandidates)
    const unsubscribeVotingStatus = subscribeVotingStatus(setVotingStatus)

    return () => {
      unsubscribeCandidates()
      unsubscribeVotingStatus()
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleGenerateAlias = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aliasCanonical.trim()) return
    if (!adminToken) {
      setAliasError('Admin session not found. Please re-authenticate.')
      return
    }

    setIsGeneratingAlias(true)
    setAliasError('')
    setAliasToken('')
    setAliasUrl('')

    try {
      const response = await fetch('/api/admin/token-alias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminToken, canonicalToken: aliasCanonical.trim() }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        aliasToken?: string
        reason?: string
      }

      if (!response.ok || !payload.ok || !payload.aliasToken) {
        setAliasError(payload.reason || 'Unable to generate alias token.')
        return
      }

      setAliasToken(payload.aliasToken)
      setAliasUrl(`${origin || ''}/?id=${payload.aliasToken}`)
    } catch (error) {
      console.error('Failed to generate alias token', error)
      setAliasError('Unable to generate alias token. Please try again.')
    } finally {
      setIsGeneratingAlias(false)
    }
  }

  const handleSeedTokens = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminToken) {
      setSeedError('Admin session not found. Please re-authenticate.')
      return
    }

    const start = Number.parseInt(tokenStart, 10)
    const end = Number.parseInt(tokenEnd, 10)
    if (!tokenPrefix.trim() || Number.isNaN(start) || Number.isNaN(end)) {
      setSeedError('Please enter a valid prefix and numeric range.')
      return
    }

    setIsSeedingTokens(true)
    setSeedError('')
    setSeedResult('')

    try {
      const response = await fetch('/api/admin/token-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminToken,
          prefix: tokenPrefix.trim(),
          start,
          end,
        }),
      })

      const payload = (await response.json()) as { ok?: boolean; created?: number; reason?: string }
      if (!response.ok || !payload.ok) {
        setSeedError(payload.reason || 'Unable to create voter tokens.')
        return
      }

      setSeedResult(`Created ${payload.created ?? 0} voter tokens.`)
    } catch (error) {
      console.error('Failed to seed voter tokens', error)
      setSeedError('Unable to create voter tokens. Please try again.')
    } finally {
      setIsSeedingTokens(false)
    }
  }


  const createCandidate = async () => {
    if (!newName.trim()) return

    setIsCreatingCandidate(true)
    setCreateCandidateError('')

    try {
      const uploadedUrls = await Promise.all(
        newImageFiles.map((file) => uploadImageFile(file, 'candidates', adminToken)),
      )
      const allImages = [...newImageUrls, ...uploadedUrls]

      await addCandidate({
        name: newName.trim(),
        category: newCategory,
        images: allImages.length > 0 ? allImages : ['/placeholder.jpg'],
        age: newAge ? parseInt(newAge) : undefined,
        height: newHeight.trim() || undefined,
        major: newMajor.trim() || undefined,
        year: newYear.trim() || undefined,
        hobbies: newHobbies.trim() || undefined,
        hometown: newHometown.trim() || undefined,
      })

      setNewName('')
      setNewImageUrls([])
      setNewImageFiles([])
      setNewAge('')
      setNewHeight('')
      setNewMajor('')
      setNewYear('')
      setNewHobbies('')
      setNewHometown('')
    } catch (error) {
      console.error('Failed to create candidate', error)
      setCreateCandidateError('Unable to upload images. Please try again.')
    } finally {
      setIsCreatingCandidate(false)
    }
  }

  const handleRemoveClick = (id: string, name: string) => {
    setCandidateToRemove({ id, name })
    setShowRemoveDialog(true)
  }

  const confirmRemoveCandidate = async () => {
    if (!candidateToRemove) return
    await removeCandidate(candidateToRemove.id)
    setCandidateToRemove(null)
  }

  const confirmResetVotes = async () => {
    await resetCandidateVotes()
    await clearVotes()
  }

  const kingCandidates = candidates.filter(c => c.category === 'king')
  const queenCandidates = candidates.filter(c => c.category === 'queen')

  // Show password screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md relative z-10 border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
            <CardDescription>Enter password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(false)
                  }}
                  className={passwordError ? 'border-destructive' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-2">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? 'Checking...' : 'Access Admin Panel'}
              </Button>
              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}
              {/* <Link href="/">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Back to Home
                </Button>
              </Link> */}
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
              <Crown className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage candidates and election results</p>
          </div>
          {/* <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link> */}
        </div>

        {/* Voting Control Panel */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="font-serif flex items-center gap-2">
                  Voting Controls
                </CardTitle>
                <CardDescription>Manage the voting process and results</CardDescription>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <p className="text-xs text-muted-foreground">Current Status</p>
                <Badge 
                  variant={votingStatus === 'active' ? 'default' : 'secondary'}
                  className="text-sm md:text-base px-3 md:px-4 py-1 md:py-1.5"
                >
                  {votingStatus === 'not-started' && '⏸ Not Started'}
                  {votingStatus === 'active' && '▶ Voting Active'}
                  {votingStatus === 'ended' && '⏹ Voting Ended'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
              <Button 
                onClick={() => setShowStartVotingDialog(true)}
                disabled={votingStatus === 'active'}
                variant={votingStatus === 'not-started' ? 'default' : 'outline'}
                size="sm"
                className="w-full sm:w-auto"
              >
                Start Voting
              </Button>
              <Button 
                onClick={() => setShowEndVotingDialog(true)}
                disabled={votingStatus === 'ended'}
                variant={votingStatus === 'active' ? 'destructive' : 'outline'}
                size="sm"
                className="w-full sm:w-auto"
              >
                End Voting
              </Button>
              <div className="hidden sm:block w-px h-6 bg-border mx-1" />
              <Button 
                onClick={() => setShowResetStatusDialog(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Status
              </Button>
              <Button 
                onClick={() => setShowResetDialog(true)}
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Votes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voter Link Generator */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              Voter Link Generator
            </CardTitle>
            <CardDescription>
              Generate an opaque link that maps to a canonical voter ID (e.g. PAOH0001)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateAlias} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canonical-token">Canonical voter ID</Label>
                <Input
                  id="canonical-token"
                  placeholder="PAOH0001"
                  value={aliasCanonical}
                  onChange={(e) => setAliasCanonical(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={isGeneratingAlias || !aliasCanonical.trim()}
                  className="w-full sm:w-auto"
                >
                  {isGeneratingAlias ? 'Generating...' : 'Generate Link'}
                </Button>
                {aliasToken && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(aliasUrl || aliasToken)
                    }}
                  >
                    Copy Link
                  </Button>
                )}
              </div>
              {aliasToken && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Alias token: <span className="font-medium text-foreground">{aliasToken}</span></p>
                  {aliasUrl && (
                    <p className="text-muted-foreground">Link: <span className="font-medium text-foreground break-all">{aliasUrl}</span></p>
                  )}
                </div>
              )}
              {aliasError && (
                <p className="text-sm text-destructive">{aliasError}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Voter Token Seeder */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              Voter Token Seeder
            </CardTitle>
            <CardDescription>
              Create canonical voter tokens like PAOH0001 in Firestore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSeedTokens} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="token-prefix">Prefix</Label>
                  <Input
                    id="token-prefix"
                    placeholder="PAOH"
                    value={tokenPrefix}
                    onChange={(e) => setTokenPrefix(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-start">Start</Label>
                  <Input
                    id="token-start"
                    placeholder="1"
                    value={tokenStart}
                    onChange={(e) => setTokenStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-end">End</Label>
                  <Input
                    id="token-end"
                    placeholder="1000"
                    value={tokenEnd}
                    onChange={(e) => setTokenEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSeedingTokens}
              >
                {isSeedingTokens ? 'Creating...' : 'Create Voter Tokens'}
              </Button>
              {seedResult && (
                <p className="text-sm text-foreground">{seedResult}</p>
              )}
              {seedError && (
                <p className="text-sm text-destructive">{seedError}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Voting Results Panel */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Voting Results
            </CardTitle>
            <CardDescription>Current voting statistics and leader board</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* King Results */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  King Candidates
                </h3>
                <div className="space-y-3">
                  {candidates
                    .filter(c => c.category === 'king')
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => {
                      const totalKingVotes = candidates.filter(c => c.category === 'king').reduce((sum, c) => sum + c.votes, 0)
                      const percentage = totalKingVotes > 0 ? (candidate.votes / totalKingVotes * 100).toFixed(1) : '0.0'
                      return (
                        <div key={candidate.id} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                #{index + 1}
                              </span>
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{candidate.votes} votes</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{percentage}%</div>
                        </div>
                      )
                    })}
                  {candidates.filter(c => c.category === 'king').length === 0 && (
                    <p className="text-muted-foreground text-sm">No king candidates yet</p>
                  )}
                </div>
              </div>

              {/* Queen Results */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-secondary" />
                  Queen Candidates
                </h3>
                <div className="space-y-3">
                  {candidates
                    .filter(c => c.category === 'queen')
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => {
                      const totalQueenVotes = candidates.filter(c => c.category === 'queen').reduce((sum, c) => sum + c.votes, 0)
                      const percentage = totalQueenVotes > 0 ? (candidate.votes / totalQueenVotes * 100).toFixed(1) : '0.0'
                      return (
                        <div key={candidate.id} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${index === 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                                #{index + 1}
                              </span>
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{candidate.votes} votes</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-secondary h-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{percentage}%</div>
                        </div>
                      )
                    })}
                  {candidates.filter(c => c.category === 'queen').length === 0 && (
                    <p className="text-muted-foreground text-sm">No queen candidates yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Total Stats */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{candidates.filter(c => c.category === 'king').reduce((sum, c) => sum + c.votes, 0)}</p>
                <p className="text-sm text-muted-foreground">King Votes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{candidates.filter(c => c.category === 'queen').reduce((sum, c) => sum + c.votes, 0)}</p>
                <p className="text-sm text-muted-foreground">Queen Votes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{candidates.reduce((sum, c) => sum + c.votes, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                images={newImageUrls}
                files={newImageFiles}
                onImagesChange={setNewImageUrls}
                onFilesChange={setNewImageFiles}
                maxImages={3}
              />
            </div>

            {createCandidateError && (
              <p className="text-sm text-destructive">{createCandidateError}</p>
            )}
            
            <div className="flex justify-end">
              <Button onClick={createCandidate} size="default" disabled={isCreatingCandidate}>
                <Plus className="w-4 h-4 mr-2" />
                {isCreatingCandidate ? 'Saving...' : 'Add Candidate'}
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
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-medium text-sm text-primary shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Candidate Image */}
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {candidate.images?.[0] ? (
                      <img 
                        src={candidate.images[0] || "/placeholder.svg"} 
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
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
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
                  <div className="w-7 h-7 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center font-medium text-sm text-secondary shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Candidate Image */}
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {candidate.images?.[0] ? (
                      <img 
                        src={candidate.images[0] || "/placeholder.svg"} 
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
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
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

      <ConfirmationDialog
        open={showStartVotingDialog}
        onOpenChange={setShowStartVotingDialog}
        onConfirm={handleStartVoting}
        title="Start Voting"
        description="This will activate the voting process and allow users to cast their votes. Make sure all candidates are ready before proceeding."
        confirmText="I want to start voting"
        destructive={false}
        confirmButtonText="Start Voting"
        variant="default"
      />

      <ConfirmationDialog
        open={showEndVotingDialog}
        onOpenChange={setShowEndVotingDialog}
        onConfirm={handleEndVoting}
        title="End Voting"
        description="This will close the voting process and prevent any further votes from being cast. This action marks the end of the election."
        confirmText="I want to end voting"
        destructive={true}
        confirmButtonText="End Voting"
        variant="destructive"
      />

      <ConfirmationDialog
        open={showResetStatusDialog}
        onOpenChange={setShowResetStatusDialog}
        onConfirm={handleResetVotingStatus}
        title="Reset Voting Status"
        description="This will reset the voting status back to 'Not Started'. Vote counts will remain unchanged. Use this to reopen voting after it has ended."
        confirmText="I want to reset status"
        destructive={false}
        confirmButtonText="Reset Status"
        variant="outline"
      />
    </div>
  )
}
