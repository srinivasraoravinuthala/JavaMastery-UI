import { SITE_CONFIG } from '@/config/site'

const stats = [
  { value: SITE_CONFIG.stats.interviewQuestions, label: 'Interview Questions' },
  { value: SITE_CONFIG.stats.javaExamples, label: 'Java Examples' },
  { value: String(SITE_CONFIG.stats.majorTopics), label: 'Major Topics' },
  { value: String(SITE_CONFIG.stats.learnChapters), label: 'Learn Chapters' },
]

export function Stats() {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
