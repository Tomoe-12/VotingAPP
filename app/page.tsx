'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, CheckCircle2, Users, GraduationCap, Calendar, Ruler, MapPin, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Switch } from '@/components/ui/switch'

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

const defaultCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    category: 'king',
    image: '/placeholder.jpg',
    votes: 0,
    age: 18,
    height: '5\'10"',
    major: 'Computer Science',
    year: 'Year 1',
    hobbies: 'Basketball, Coding',
    hometown: 'Mumbai'
  },
  {
    id: '2',
    name: 'Arjun Patel',
    category: 'king',
    image: '/placeholder.jpg',
    votes: 0,
    age: 19,
    height: '6\'0"',
    nationality: 'Indian',
    major: 'Business',
    year: 'Year 1',
    hobbies: 'Photography, Travel',
    hometown: 'Delhi'
  },
  {
    id: '3',
    name: 'Vikram Singh',
    category: 'king',
    image: '/placeholder.jpg',
    votes: 0,
    age: 18,
    height: '5\'11"',
    nationality: 'Indian',
    major: 'Engineering',
    year: 'Year 1',
    hobbies: 'Football, Music',
    hometown: 'Bangalore'
  },
  {
    id: '4',
    name: 'Priya Mehta',
    category: 'queen',
    image: '/placeholder.jpg',
    votes: 0,
    age: 18,
    height: '5\'5"',
    nationality: 'Indian',
    major: 'Medicine',
    year: 'Year 1',
    hobbies: 'Dancing, Reading',
    hometown: 'Pune'
  },
  {
    id: '5',
    name: 'Ananya Kumar',
    category: 'queen',
    image: '/placeholder.jpg',
    votes: 0,
    age: 19,
    height: '5\'6"',
    nationality: 'Indian',
    major: 'Arts',
    year: 'Year 1',
    hobbies: 'Painting, Singing',
    hometown: 'Chennai'
  },
  {
    id: '6',
    name: 'Sneha Reddy',
    category: 'queen',
    image: '/placeholder.jpg',
    votes: 0,
    age: 18,
    height: '5\'4"',
    nationality: 'Indian',
    major: 'Law',
    year: 'Year 1',
    hobbies: 'Debate, Writing',
    hometown: 'Hyderabad'
  }
]

export default function VotingPage() {
  const { t, language, setLanguage } = useLanguage()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [hasVotedKing, setHasVotedKing] = useState(false)
  const [hasVotedQueen, setHasVotedQueen] = useState(false)
  const [votedKingId, setVotedKingId] = useState<string | null>(null)
  const [votedQueenId, setVotedQueenId] = useState<string | null>(null)

  useEffect(() => {
    // Load candidates from localStorage or use defaults
    const storedCandidates = localStorage.getItem('candidates')
    if (storedCandidates) {
      const loaded = JSON.parse(storedCandidates)
      // Merge details from default candidates into loaded ones
      const mergedCandidates = loaded.map((candidate: Candidate) => {
        const defaultCandidate = defaultCandidates.find(dc => dc.id === candidate.id)
        return {
          ...candidate,
          age: candidate.age || defaultCandidate?.age,
          height: candidate.height || defaultCandidate?.height,
          major: candidate.major || defaultCandidate?.major,
          year: candidate.year || defaultCandidate?.year,
          hobbies: candidate.hobbies || defaultCandidate?.hobbies,
          hometown: candidate.hometown || defaultCandidate?.hometown
        }
      })
      setCandidates(mergedCandidates)
      localStorage.setItem('candidates', JSON.stringify(mergedCandidates))
    } else {
      setCandidates(defaultCandidates)
      localStorage.setItem('candidates', JSON.stringify(defaultCandidates))
    }

    // Check if user has already voted
    const votedKing = localStorage.getItem('votedKing')
    const votedQueen = localStorage.getItem('votedQueen')
    if (votedKing) {
      setHasVotedKing(true)
      setVotedKingId(votedKing)
    }
    if (votedQueen) {
      setHasVotedQueen(true)
      setVotedQueenId(votedQueen)
    }
  }, [])

  const handleVote = (candidateId: string, category: 'king' | 'queen') => {
    const updatedCandidates = candidates.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate
    )

    setCandidates(updatedCandidates)
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates))

    if (category === 'king') {
      setHasVotedKing(true)
      setVotedKingId(candidateId)
      localStorage.setItem('votedKing', candidateId)
    } else {
      setHasVotedQueen(true)
      setVotedQueenId(candidateId)
      localStorage.setItem('votedQueen', candidateId)
    }
  }

  const kingCandidates = candidates.filter(c => c.category === 'king')
  const queenCandidates = candidates.filter(c => c.category === 'queen')

  const totalVotesKing = kingCandidates.reduce((sum, c) => sum + c.votes, 0)
  const totalVotesQueen = queenCandidates.reduce((sum, c) => sum + c.votes, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Decorative Floral Elements */}
      <div className="fixed top-0 left-0 w-64 h-64 opacity-[0.15] pointer-events-none">
        <img src="/floral-corner.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="fixed top-0 right-0 w-64 h-64 opacity-[0.15] pointer-events-none transform scale-x-[-1]">
        <img src="/floral-corner.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="fixed bottom-0 left-0 w-80 h-80 opacity-[0.12] pointer-events-none transform scale-y-[-1]">
        <img src="/floral-corner.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="fixed bottom-0 right-0 w-80 h-80 opacity-[0.12] pointer-events-none transform scale-[-1]">
        <img src="/floral-corner.png" alt="" className="w-full h-full object-contain" />
      </div>
      
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-xs font-medium">EN</span>
          <Switch
            checked={language === 'my'}
            onCheckedChange={(checked) => setLanguage(checked ? 'my' : 'en')}
            className="scale-75"
          />
          <span className="text-xs font-medium">MY</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4 text-balance leading-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Badge variant="outline" className="text-sm px-4 py-2 bg-card">
              <Users className="w-4 h-4 mr-2 inline" />
              {totalVotesKing + totalVotesQueen} {t('votesCount')}
            </Badge>
          </div>
        </div>

        {/* King Voting Section */}
        <div id="king-section" className="mb-20 md:mb-32 scroll-mt-24">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{t('king')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('selectCandidate')}</p>
          </div>
          
          {hasVotedKing && (
            <div className="mb-8 p-5 bg-accent border border-border rounded-lg flex items-center gap-3 text-accent-foreground">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{t('voteRecorded')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {kingCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className={`group overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                  votedKingId === candidate.id ? 'ring-1 ring-primary shadow-md' : 'border-border'
                }`}
              >
                <CardHeader className="p-0">
                  <div className="aspect-[4/5] bg-muted flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
                    {/* Candidate Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-primary/20 flex items-center justify-center font-semibold text-sm text-primary shadow-sm">
                      {index + 1}
                    </div>
                    <Crown className="w-20 h-20 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-serif mb-3">{candidate.name}</CardTitle>
                  
                  {/* Candidate Details with Icons */}
                  <div className="space-y-2 mb-4 text-sm">
                    {candidate.major && candidate.year && (
                      <div className="flex items-center gap-2 text-foreground/80">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="font-medium">{candidate.major}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{candidate.year}</span>
                      </div>
                    )}
                    {candidate.age && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.age} years old</span>
                      </div>
                    )}
                    {candidate.height && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.height}</span>
                      </div>
                    )}
                    {candidate.hometown && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.hometown}</span>
                      </div>
                    )}
                    {candidate.hobbies && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{candidate.hobbies}</span>
                      </div>
                    )}
                  </div>
                  
                  <CardDescription className="mb-6 text-sm">
                    {candidate.votes} {candidate.votes === 1 ? t('vote') : t('votes')}
                  </CardDescription>
                  <Button
                    onClick={() => handleVote(candidate.id, 'king')}
                    disabled={hasVotedKing}
                    className="w-full"
                    variant={votedKingId === candidate.id ? 'default' : 'outline'}
                  >
                    {votedKingId === candidate.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('yourVote')}
                      </>
                    ) : hasVotedKing ? (
                      t('voted')
                    ) : (
                      t('castVote')
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Queen Voting Section */}
        <div id="queen-section" className="scroll-mt-24">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{t('queen')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('selectCandidate')}</p>
          </div>
          
          {hasVotedQueen && (
            <div className="mb-8 p-5 bg-accent border border-border rounded-lg flex items-center gap-3 text-accent-foreground">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{t('voteRecorded')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {queenCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className={`group overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                  votedQueenId === candidate.id ? 'ring-1 ring-secondary shadow-md' : 'border-border'
                }`}
              >
                <CardHeader className="p-0">
                  <div className="aspect-[4/5] bg-muted flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
                    {/* Candidate Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-secondary/20 flex items-center justify-center font-semibold text-sm text-secondary shadow-sm">
                      {index + 1}
                    </div>
                    <Crown className="w-20 h-20 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-serif mb-3">{candidate.name}</CardTitle>
                  
                  {/* Candidate Details with Icons */}
                  <div className="space-y-2 mb-4 text-sm">
                    {candidate.major && candidate.year && (
                      <div className="flex items-center gap-2 text-foreground/80">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 text-secondary" />
                        <span className="font-medium">{candidate.major}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{candidate.year}</span>
                      </div>
                    )}
                    {candidate.age && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.age} years old</span>
                      </div>
                    )}
                    {candidate.height && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.height}</span>
                      </div>
                    )}
                    {candidate.hometown && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{candidate.hometown}</span>
                      </div>
                    )}
                    {candidate.hobbies && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{candidate.hobbies}</span>
                      </div>
                    )}
                  </div>
                  
                  <CardDescription className="mb-6 text-sm">
                    {candidate.votes} {candidate.votes === 1 ? t('vote') : t('votes')}
                  </CardDescription>
                  <Button
                    onClick={() => handleVote(candidate.id, 'queen')}
                    disabled={hasVotedQueen}
                    className="w-full"
                    variant={votedQueenId === candidate.id ? 'default' : 'outline'}
                  >
                    {votedQueenId === candidate.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('yourVote')}
                      </>
                    ) : hasVotedQueen ? (
                      t('voted')
                    ) : (
                      t('castVote')
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
