import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const featured = [
  { title: 'Core Java', questions: '226+', path: '03-interview--01-CoreJava', level: 'All Levels' },
  { title: 'Concurrency', questions: '150+', path: '03-interview--04-Concurrency', level: 'Senior' },
  { title: 'JVM Internals', questions: '120+', path: '03-interview--05-JVM', level: 'Senior' },
  { title: 'Print Puzzles', questions: '35', path: '03-interview--17-PrintPuzzles', level: 'Tricky' },
  { title: 'System Design', questions: '82+', path: '03-interview--18-SystemDesign', level: 'Principal' },
  { title: 'Spring Boot', questions: '92+', path: '03-interview--15-SpringBoot', level: 'Backend' },
]

export function FeaturedInterview() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Interview Sections</h2>
            <p className="text-muted-foreground">1,500+ senior-depth questions with reveal-answer mode</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/docs/03-interview--00-INDEX">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((item) => (
            <Link key={item.path} to={`/docs/${item.path}`}>
              <Card className="h-full hover:border-primary/40 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      {item.title}
                    </CardTitle>
                    <Badge variant="java">{item.questions}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs">{item.level}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
