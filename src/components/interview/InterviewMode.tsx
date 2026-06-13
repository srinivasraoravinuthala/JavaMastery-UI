import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Bookmark,
  Star,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { InterviewQuestion } from '@/types'
import { cn } from '@/utils/cn'

interface InterviewModeProps {
  questions: InterviewQuestion[]
  topic?: string
  onBookmark?: (question: InterviewQuestion) => void
  onFavorite?: (question: InterviewQuestion) => void
  isBookmarked?: (id: string) => boolean
  isFavorite?: (id: string) => boolean
}

export function InterviewMode({
  questions,
  topic,
  onBookmark,
  onFavorite,
  isBookmarked,
  isFavorite,
}: InterviewModeProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)

  if (questions.length === 0) return null

  const current = questions[currentIndex]

  const revealAnswer = (id: string) => {
    setRevealed((prev) => new Set([...prev, id]))
  }

  const randomQuestion = () => {
    const index = Math.floor(Math.random() * questions.length)
    setCurrentIndex(index)
    setRevealed(new Set())
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-border bg-card">
        <Badge variant="java">Interview Mode</Badge>
        {topic && <Badge variant="outline">{topic}</Badge>}
        <span className="text-sm text-muted-foreground ml-auto">
          {questions.length} questions
        </span>

        <div className="flex flex-wrap gap-2 w-full mt-2">
          <Button
            variant={showAnswers ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAnswers ? 'Hide All Answers' : 'Show All Answers'}
          </Button>

          <Button variant="outline" size="sm" onClick={randomQuestion}>
            <Shuffle className="h-3.5 w-3.5" />
            Random
          </Button>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex((i) => i - 1); setRevealed(new Set()) }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentIndex + 1} / {questions.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentIndex === questions.length - 1}
              onClick={() => { setCurrentIndex((i) => i + 1); setRevealed(new Set()) }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-foreground">{current.question}</h3>
            <div className="flex gap-1 shrink-0">
              {current.difficulty && (
                <Badge
                  variant={
                    current.difficulty === 'hard' ? 'default' :
                    current.difficulty === 'medium' ? 'secondary' : 'outline'
                  }
                >
                  {current.difficulty}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onBookmark?.(current)}
              >
                <Bookmark
                  className={cn('h-4 w-4', isBookmarked?.(current.id) && 'fill-primary text-primary')}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onFavorite?.(current)}
              >
                <Star
                  className={cn('h-4 w-4', isFavorite?.(current.id) && 'fill-yellow-500 text-yellow-500')}
                />
              </Button>
            </div>
          </div>

          {(showAnswers || revealed.has(current.id)) ? (
            <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
              {current.answer}
            </div>
          ) : (
            <Button onClick={() => revealAnswer(current.id)} className="w-full sm:w-auto">
              <Eye className="h-4 w-4" />
              Reveal Answer
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
