'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Trophy, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { subscribeCandidates, type CandidateRecord } from '@/lib/voting-data'

export default function ResultsPage() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([])

  useEffect(() => {
    const unsubscribeCandidates = subscribeCandidates(setCandidates)
    return () => unsubscribeCandidates()
  }, [])

  const kingCandidates = candidates
    .filter(c => c.category === 'king')
    .sort((a, b) => b.votes - a.votes)
  
  const queenCandidates = candidates
    .filter(c => c.category === 'queen')
    .sort((a, b) => b.votes - a.votes)

  const totalVotesKing = kingCandidates.reduce((sum, c) => sum + c.votes, 0)
  const totalVotesQueen = queenCandidates.reduce((sum, c) => sum + c.votes, 0)

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0
    return Math.round((votes / total) * 100)
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (index === 1) return <Badge variant="secondary">2nd</Badge>
    if (index === 2) return <Badge variant="outline">3rd</Badge>
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
              Live Results
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Real-time vote counts and standings
            </p>
          </div>
        </div>

        {/* King Results */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">King</h2>
            <Badge variant="outline" className="px-3 py-1">
              {totalVotesKing} votes
            </Badge>
          </div>

          <div className="space-y-3">
            {kingCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className={`border ${index === 0 ? 'ring-1 ring-primary shadow-md bg-accent/30' : 'border-border'}`}
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                      {index === 0 ? (
                        <Trophy className="w-5 h-5 text-foreground" />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-serif font-semibold text-foreground">{candidate.name}</h3>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-foreground">{candidate.votes}</div>
                          <div className="text-xs text-muted-foreground">
                            {getPercentage(candidate.votes, totalVotesKing)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${getPercentage(candidate.votes, totalVotesKing)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {kingCandidates.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No candidates yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Queen Results */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Queen</h2>
            <Badge variant="outline" className="px-3 py-1">
              {totalVotesQueen} votes
            </Badge>
          </div>

          <div className="space-y-3">
            {queenCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className={`border ${index === 0 ? 'ring-1 ring-secondary shadow-md bg-accent/30' : 'border-border'}`}
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                      {index === 0 ? (
                        <Trophy className="w-5 h-5 text-foreground" />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-serif font-semibold text-foreground">{candidate.name}</h3>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-foreground">{candidate.votes}</div>
                          <div className="text-xs text-muted-foreground">
                            {getPercentage(candidate.votes, totalVotesQueen)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${getPercentage(candidate.votes, totalVotesQueen)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {queenCandidates.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No candidates yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
