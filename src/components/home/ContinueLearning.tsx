import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useProgress } from '@/hooks/useBookmarks'
import { LEARN_CHAPTER_COUNT, LEARN_SECTION_ID } from '@/config/learn'
import { getNextLearnChapter } from '@/utils/learnProgress'

export function ContinueLearning() {
  const { getSectionProgress } = useProgress()
  const completed = getSectionProgress(LEARN_SECTION_ID)?.completed ?? []
  const next = getNextLearnChapter(completed)

  if (!next) {
    return (
      <section className="py-12 container mx-auto px-4">
        <Card className="max-w-2xl mx-auto border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">All chapters complete!</h2>
            <p className="text-muted-foreground text-sm mb-4">
              You&apos;ve finished the learn path. Explore interview prep or browse examples.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/docs/03-interview--01-CoreJava">Interview Prep</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/examples">Browse Examples</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="py-12 container mx-auto px-4">
      <Card className="max-w-2xl mx-auto border-primary/30">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              Continue learning
            </p>
            <h2 className="text-lg font-bold mb-1">
              Chapter {next.index} of {LEARN_CHAPTER_COUNT}
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick up where you left off in the learn path.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button asChild>
              <Link to={`/docs/${next.slug}`}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/examples">
                <Play className="h-4 w-4" />
                Examples
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
