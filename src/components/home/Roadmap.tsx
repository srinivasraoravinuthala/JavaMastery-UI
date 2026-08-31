import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/hooks/useBookmarks'
import { LEARN_CHAPTER_COUNT, LEARN_SECTION_ID } from '@/config/learn'

const roadmapSteps = [
  { phase: 'Foundation', chapters: '01–09', topics: 'Syntax, Types, Loops, Methods, Arrays, Strings', path: '02-learn--01-GettingStarted' },
  { phase: 'Object-Oriented', chapters: '10–15', topics: 'Classes, Inheritance, Interfaces, Records', path: '02-learn--10-ClassesAndObjects' },
  { phase: 'Core APIs', chapters: '16–21', topics: 'Exceptions, Collections, Generics, Streams', path: '02-learn--16-Exceptions' },
  { phase: 'Computer Science', chapters: '22–24', topics: 'DSA, Algorithms, LeetCode', path: '02-learn--22-DataStructures' },
  { phase: 'Senior Topics', chapters: '25–27', topics: 'JVM, Concurrency, Design Patterns', path: '02-learn--25-JVMAndMemory' },
  { phase: 'Applied Java', chapters: '28–32', topics: 'I/O, HTTP, JDBC, REST APIs', path: '02-learn--28-IOAndNIO' },
  { phase: 'Professional', chapters: '33–37', topics: 'Testing, Modules, Performance, Interviews', path: '02-learn--33-Testing' },
]

export function Roadmap() {
  const { getSectionProgress } = useProgress()
  const learnProgress = getSectionProgress(LEARN_SECTION_ID)
  const completedCount = learnProgress?.completed.length ?? 0
  const progressPct = learnProgress?.percentage ?? 0

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Learning Roadmap</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            37 sequenced chapters from beginner to principal engineer. Follow the path or jump to any topic.
          </p>
          {completedCount > 0 && (
            <div className="mt-4 max-w-xs mx-auto">
              <p className="text-sm font-medium mb-2">
                {completedCount}/{LEARN_CHAPTER_COUNT} chapters complete ({progressPct}%)
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {roadmapSteps.map((step, index) => (
            <Link
              key={step.phase}
              to={`/docs/${step.path}`}
              className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center shrink-0">
                {index < 2 ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < roadmapSteps.length - 1 && (
                  <div className="w-px h-8 bg-border mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{step.phase}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Ch. {step.chapters}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{step.topics}</p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/docs/02-learn--00-INDEX">
              View Full Learn Index
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
