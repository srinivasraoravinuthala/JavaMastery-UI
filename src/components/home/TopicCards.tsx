import { Link } from 'react-router-dom'
import {
  Code2,
  Layers,
  Database,
  Cpu,
  Workflow,
  AlertTriangle,
  Type,
  FileText,
  History,
  HardDrive,
  Eye,
  Shapes,
  BookMarked,
  Leaf,
  Puzzle,
  Network,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TOPIC_SECTIONS } from '@/config/site'

const iconMap: Record<string, React.ElementType> = {
  'core-java': Code2,
  'oop-solid': Layers,
  collections: Database,
  concurrency: Cpu,
  jvm: Cpu,
  streams: Workflow,
  exceptions: AlertTriangle,
  generics: Type,
  strings: FileText,
  'java-versions': History,
  'io-nio': HardDrive,
  reflection: Eye,
  'design-patterns': Shapes,
  'effective-java': BookMarked,
  'spring-boot': Leaf,
  'jpa-hibernate': Database,
  'interview-puzzles': Puzzle,
  'system-design': Network,
}

export function TopicCards() {
  const interviewSection = TOPIC_SECTIONS.find((s) => s.id === 'interview')

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">18 Major Topics</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive coverage from Core Java fundamentals to System Design — everything you need for senior interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {interviewSection?.topics?.map((topic) => {
            const Icon = iconMap[topic.id] || Code2
            const slug = `03-interview--${topic.file.replace('.md', '')}`

            return (
              <Link key={topic.id} to={`/docs/${slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{topic.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">Interview</Badge>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
