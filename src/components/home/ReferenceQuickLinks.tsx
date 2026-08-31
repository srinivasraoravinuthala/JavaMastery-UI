import { Link } from 'react-router-dom'
import { FileText, Map, StickyNote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const LINKS = [
  {
    title: 'Java Cheatsheet',
    description: 'Syntax and API quick lookup',
    slug: '05-quick-ref--01-Cheatsheet',
    icon: StickyNote,
  },
  {
    title: 'Java Notes',
    description: 'One-page revision: JVM, GC, collections',
    slug: '05-quick-ref--02-JavaNotes',
    icon: FileText,
  },
  {
    title: 'Career Roadmap',
    description: 'Beginner to principal engineer path',
    slug: '06-career--01-Roadmap',
    icon: Map,
  },
]

export function ReferenceQuickLinks() {
  return (
    <section className="py-12 container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Quick Reference</h2>
      <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {LINKS.map(({ title, description, slug, icon: Icon }) => (
          <Link key={slug} to={`/docs/${slug}`}>
            <Card className="h-full hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
