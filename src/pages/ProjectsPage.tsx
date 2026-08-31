import { Link } from 'react-router-dom'
import { FolderKanban, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SITE_CONFIG } from '@/config/site'

const PROJECTS = [
  {
    id: '01',
    title: 'Console Gradebook',
    after: 'Chapter 09',
    stack: 'Scanner, arrays',
    path: 'projects/01-console-gradebook',
    doc: '02-learn--09-UserInput',
  },
  {
    id: '02',
    title: 'Library OOP',
    after: 'Chapter 15',
    stack: 'Classes, encapsulation',
    path: 'projects/02-library-oop',
    doc: '02-learn--15-RecordsAndSealed',
  },
  {
    id: '03',
    title: 'Todo REST',
    after: 'Chapter 31',
    stack: 'JDK HttpServer',
    path: 'projects/03-todo-rest',
    doc: '02-learn--31-RestAPIs',
  },
  {
    id: '04',
    title: 'Notes API',
    after: 'Chapter 40',
    stack: 'Spring Boot + H2',
    path: 'projects/04-notes-api',
    doc: '02-learn--40-SpringBootIntro',
  },
  {
    id: '05',
    title: 'Notes Web',
    after: 'Chapter 41',
    stack: 'HTML/JS + Spring API',
    path: 'projects/05-notes-web',
    doc: '02-learn--41-RestAndFrontend',
  },
] as const

export function ProjectsPage() {
  usePageMeta({
    title: 'Projects',
    description: 'Hands-on Java labs from console apps to Spring Boot + browser UI.',
  })

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">
          <FolderKanban className="h-3.5 w-3.5 mr-1" />
          Hands-on labs
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
        <p className="text-muted-foreground">
          Scaffolded labs with README checklists. Unlock after the matching learn chapter.
          Full index:{' '}
          <Link to="/docs/07-projects--00-INDEX" className="text-primary underline-offset-4 hover:underline">
            docs/07-projects
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4">
        {PROJECTS.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {p.id} · After {p.after}
                </p>
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="text-sm text-muted-foreground">{p.stack}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/docs/${p.doc}`}>Related chapter</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <a
                    href={`${SITE_CONFIG.github.url}/tree/${SITE_CONFIG.github.branch}/${p.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open on GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
