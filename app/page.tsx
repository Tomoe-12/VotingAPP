'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, CheckCircle2, Users, GraduationCap, Calendar, Ruler, MapPin, Heart } from 'lucide-react'
import { CandidateImageCarousel } from '@/components/candidate-image-carousel'
import { useLanguage } from '@/lib/language-context'
import { Switch } from '@/components/ui/switch'
import { FloatingNav } from '@/components/floating-nav'

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
    image: '/images/boy1.jpg',
    image2: '/images/boy2.jpg',
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
    image: '/images/boy2.jpg',
    image2: '/images/boy1.jpg',
    votes: 0,
    age: 19,
    height: '6\'0"',
    major: 'Business',
    year: 'Year 1',
    hobbies: 'Photography, Travel',
    hometown: 'Delhi'
  },
  {
    id: '3',
    name: 'Vikram Singh',
    category: 'king',
    image: '/images/boy1.jpg',
    votes: 0,
    age: 18,
    height: '5\'11"',
    major: 'Engineering',
    year: 'Year 1',
    hobbies: 'Football, Music',
    hometown: 'Bangalore'
  },
  {
    id: '4',
    name: 'Priya Mehta',
    category: 'queen',
    image: '/images/girl1.jpg',
    image2: '/images/girl2.jpg',
    votes: 0,
    age: 18,
    height: '5\'5"',
    major: 'Medicine',
    year: 'Year 1',
    hobbies: 'Dancing, Reading',
    hometown: 'Pune'
  },
  {
    id: '5',
    name: 'Ananya Kumar',
    category: 'queen',
    image: '/images/girl2.jpg',
    image2: '/images/girl1.jpg',
    votes: 0,
    age: 19,
    height: '5\'6"',
    major: 'Arts',
    year: 'Year 1',
    hobbies: 'Painting, Singing',
    hometown: 'Chennai'
  },
  {
    id: '6',
    name: 'Sneha Reddy',
    category: 'queen',
    image: '/images/girl1.jpg',
    votes: 0,
    age: 18,
    height: '5\'4"',
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
  const [votingStatus, setVotingStatus] = useState<'not-started' | 'active' | 'ended'>('not-started')

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

    // Load voting status
    const storedVotingStatus = localStorage.getItem('votingStatus')
    if (storedVotingStatus) {
      setVotingStatus(storedVotingStatus as 'not-started' | 'active' | 'ended')
    }
  }, [])

  const handleVote = (candidateId: string, category: 'king' | 'queen') => {
    // Check voting status
    if (votingStatus !== 'active') {
      return // Don't allow voting if not active
    }

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
      {/* Floating Navigation */}
      <FloatingNav />
      
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

      <div className="container mx-auto px-4 py-20 md:py-32 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-24 md:mb-32 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-foreground mb-6 text-balance leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
            <Badge variant="outline" className="text-base md:text-lg px-6 py-3 bg-card">
              <Users className="w-5 h-5 mr-2 inline" />
              {totalVotesKing + totalVotesQueen} {t('votesCount')}
            </Badge>
          </div>
          
          {/* Language Switcher */}
          <div className="flex justify-center">
            <div className="relative inline-flex items-center bg-card/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg">
              <button
                onClick={() => setLanguage('en')}
                className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-all ${
                  language === 'en' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('my')}
                className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-all ${
                  language === 'my' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                မြန်မာ
              </button>
              <div 
                className={`absolute top-1 h-[calc(100%-8px)] bg-primary rounded-full transition-all duration-300 ease-in-out ${
                  language === 'en' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+4px)] w-[calc(50%-4px)]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* King Voting Section */}
        <div id="king-section" className="mb-20 md:mb-32 scroll-mt-24">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{t('king')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('selectCandidate')}</p>
          </div>
          
          {votingStatus === 'not-started' && (
            <div className="mb-8 p-5 bg-muted border border-border rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              </div>
              <span className="text-muted-foreground font-medium">Voting has not started yet. Please wait for the admin to begin voting.</span>
            </div>
          )}
          
          {votingStatus === 'ended' && (
            <div className="mb-8 p-5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-destructive" />
              </div>
              <span className="text-destructive font-medium">Voting has ended. No more votes can be cast.</span>
            </div>
          )}
          
          {hasVotedKing && votingStatus === 'active' && (
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
                  <CandidateImageCarousel
                    images={[candidate.image, candidate.image2, candidate.image3]}
                    name={candidate.name}
                    numberBadge={
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-primary/20 flex items-center justify-center font-semibold text-sm text-primary shadow-sm z-10">
                        {index + 1}
                      </div>
                    }
                  />
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
                    disabled={hasVotedKing || votingStatus !== 'active'}
                    className="w-full"
                    variant={votedKingId === candidate.id ? 'default' : 'outline'}
                  >
                    {votingStatus === 'not-started' ? (
                      'Voting Not Started'
                    ) : votingStatus === 'ended' ? (
                      'Voting Ended'
                    ) : votedKingId === candidate.id ? (
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
          
          {votingStatus === 'not-started' && (
            <div className="mb-8 p-5 bg-muted border border-border rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              </div>
              <span className="text-muted-foreground font-medium">Voting has not started yet. Please wait for the admin to begin voting.</span>
            </div>
          )}
          
          {votingStatus === 'ended' && (
            <div className="mb-8 p-5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-destructive" />
              </div>
              <span className="text-destructive font-medium">Voting has ended. No more votes can be cast.</span>
            </div>
          )}
          
          {hasVotedQueen && votingStatus === 'active' && (
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
                  <CandidateImageCarousel
                    images={[candidate.image, candidate.image2, candidate.image3]}
                    name={candidate.name}
                    numberBadge={
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-secondary/20 flex items-center justify-center font-semibold text-sm text-secondary shadow-sm z-10">
                        {index + 1}
                      </div>
                    }
                  />
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
                    disabled={hasVotedQueen || votingStatus !== 'active'}
                    className="w-full"
                    variant={votedQueenId === candidate.id ? 'default' : 'outline'}
                  >
                    {votingStatus === 'not-started' ? (
                      'Voting Not Started'
                    ) : votingStatus === 'ended' ? (
                      'Voting Ended'
                    ) : votedQueenId === candidate.id ? (
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

        {/* About Us Section */}
        <div id="about-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - University Image */}
            <div>
              <Card className="overflow-hidden border-border">
                <div className="aspect-[4/5] bg-muted flex items-center justify-center relative overflow-hidden">
                  <img 
                    src="/images/university-1.jpg" 
                    alt="University Event"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-16 h-16 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Add your university image</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-primary tracking-wider uppercase mb-2">
                  A TRADITION
                </p>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                  {t('aboutUs')}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t('aboutDescription1')}</p>
                  <p>{t('aboutDescription2')}</p>
                  <p>{t('aboutDescription3')}</p>
                </div>
              </div>
              
              <Button size="lg" className="mt-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-card/50 backdrop-blur-sm border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-serif font-semibold text-foreground">
                University King & Queen Voting
              </span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} University Student Council. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with passion by the Student Community
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
