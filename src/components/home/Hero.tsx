import { Link } from 'react-router-dom'
import { ArrowRight, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/config/site'

interface HeroProps {
  onSearchOpen: () => void
}

export function Hero({ onSearchOpen }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-java/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Senior Engineer Focus — Java 8 to 21
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
          Master Java from{' '}
          <span className="text-primary">Basics</span> to{' '}
          <span className="text-java">Senior Level</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
          {SITE_CONFIG.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/docs/02-learn--01-GettingStarted">
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" onClick={onSearchOpen}>
            <Search className="h-4 w-4" />
            Search Docs
          </Button>

          <Button size="lg" variant="ghost" asChild>
            <Link to="/docs/03-interview--01-CoreJava">
              <BookOpen className="h-4 w-4" />
              Interview Prep
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
