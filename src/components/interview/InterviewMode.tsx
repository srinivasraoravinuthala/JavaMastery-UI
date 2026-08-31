import { useState, useMemo } from 'react'
import {
  Eye,
  EyeOff,
  Bookmark,
  Star,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Layers,
  List,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { InterviewAnswer } from '@/components/interview/InterviewAnswer'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import type { InterviewQuestion } from '@/types'
import { cn } from '@/utils/cn'

type ViewMode = 'card' | 'flashcard'
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

interface InterviewModeProps {
  questions: InterviewQuestion[]
  topic?: string
  onBookmark?: (question: InterviewQuestion) => void
  onFavorite?: (question: InterviewQuestion) => void
  isBookmarked?: (id: string) => boolean
  isFavorite?: (id: string) => boolean
  favoriteIds?: Set<string>
  studyModeOnly?: boolean
  onStudyModeChange?: (studyOnly: boolean) => void
}

export function InterviewMode({
  questions,
  topic,
  onBookmark,
  onFavorite,
  isBookmarked,
  isFavorite,
  favoriteIds,
  studyModeOnly = false,
  onStudyModeChange,
}: InterviewModeProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [quizFavoritesOnly, setQuizFavoritesOnly] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const filtered = useMemo(() => {
    let list = questions
    if (difficulty !== 'all') {
      list = list.filter((q) => q.difficulty === difficulty)
    }
    if (quizFavoritesOnly && favoriteIds) {
      list = list.filter((q) => favoriteIds.has(q.id))
    }
    return list
  }, [questions, difficulty, quizFavoritesOnly, favoriteIds])

  if (questions.length === 0) return null

  const current = filtered[currentIndex] ?? filtered[0]
  const safeIndex = current ? currentIndex : 0

  const revealAnswer = (id: string) => {
    setRevealed((prev) => new Set([...prev, id]))
    setFlipped(true)
  }

  const randomQuestion = () => {
    if (filtered.length === 0) return
    const index = Math.floor(Math.random() * filtered.length)
    setCurrentIndex(index)
    setRevealed(new Set())
    setFlipped(false)
  }

  const goTo = (index: number) => {
    setCurrentIndex(index)
    setRevealed(new Set())
    setFlipped(false)
  }

  if (filtered.length === 0) {
    return (
      <div className="mb-8 p-4 rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No questions match the current filter. Try &ldquo;All&rdquo; difficulty or disable favorites-only quiz.
      </div>
    )
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-border bg-card">
        <Badge variant="java">Interview Mode</Badge>
        {topic && <Badge variant="outline">{topic}</Badge>}
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} questions
        </span>

        <div className="flex flex-wrap gap-2 w-full mt-2">
          {onStudyModeChange && (
            <Button
              variant={studyModeOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStudyModeChange(!studyModeOnly)}
            >
              {studyModeOnly ? <EyeOff className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              {studyModeOnly ? 'Study mode' : 'Full doc'}
            </Button>
          )}

          <Button
            variant={viewMode === 'flashcard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setViewMode(viewMode === 'flashcard' ? 'card' : 'flashcard'); setFlipped(false) }}
          >
            <Layers className="h-3.5 w-3.5" />
            Flashcard
          </Button>

          <Button
            variant={showAnswers ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAnswers ? 'Hide All' : 'Show All'}
          </Button>

          <Button variant="outline" size="sm" onClick={randomQuestion}>
            <Shuffle className="h-3.5 w-3.5" />
            Random
          </Button>

          {favoriteIds && favoriteIds.size > 0 && (
            <Button
              variant={quizFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setQuizFavoritesOnly(!quizFavoritesOnly); setCurrentIndex(0); setFlipped(false) }}
            >
              <Star className="h-3.5 w-3.5" />
              Starred ({favoriteIds.size})
            </Button>
          )}

          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs capitalize"
                onClick={() => { setDifficulty(d); setCurrentIndex(0); setFlipped(false) }}
              >
                {d}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safeIndex === 0}
              onClick={() => goTo(safeIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {safeIndex + 1} / {filtered.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safeIndex >= filtered.length - 1}
              onClick={() => goTo(safeIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card
        id={current.id}
        className={cn(
          'border-primary/20 transition-transform',
          viewMode === 'flashcard' && 'cursor-pointer min-h-[200px]'
        )}
        onClick={() => {
          if (viewMode === 'flashcard' && !flipped && !showAnswers) {
            revealAnswer(current.id)
          }
        }}
      >
        <CardContent className="p-6">
          {viewMode === 'flashcard' && !flipped && !showAnswers && !revealed.has(current.id) ? (
            <div className="flex flex-col items-stretch justify-center min-h-[160px] gap-4">
              <div className="text-left">
                <MarkdownRenderer content={current.question} />
              </div>
              <p className="text-sm text-muted-foreground text-center">Tap to reveal answer</p>
              {current.difficulty && (
                <Badge variant="outline" className="capitalize self-center">{current.difficulty}</Badge>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1 text-left">
                  <MarkdownRenderer content={current.question} />
                </div>
                <div className="flex gap-1 shrink-0">
                  {current.difficulty && (
                    <Badge
                      variant={
                        current.difficulty === 'hard' ? 'default' :
                        current.difficulty === 'medium' ? 'secondary' : 'outline'
                      }
                      className="capitalize"
                    >
                      {current.difficulty}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onBookmark?.(current) }}
                  >
                    <Bookmark
                      className={cn('h-4 w-4', isBookmarked?.(current.id) && 'fill-primary text-primary')}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(current) }}
                  >
                    <Star
                      className={cn('h-4 w-4', isFavorite?.(current.id) && 'fill-yellow-500 text-yellow-500')}
                    />
                  </Button>
                </div>
              </div>

              {(showAnswers || revealed.has(current.id) || flipped) ? (
                <div className="border-t border-border pt-4 mt-2">
                  <InterviewAnswer content={current.answer} />
                </div>
              ) : (
                <Button onClick={() => revealAnswer(current.id)} className="w-full sm:w-auto">
                  <Eye className="h-4 w-4" />
                  Reveal Answer
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
