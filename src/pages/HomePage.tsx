import { Hero } from '@/components/home/Hero'
import { Stats } from '@/components/home/Stats'
import { TopicCards } from '@/components/home/TopicCards'
import { Roadmap } from '@/components/home/Roadmap'
import { FeaturedInterview } from '@/components/home/FeaturedInterview'
import { ContinueReading } from '@/components/home/ContinueReading'
import { ContinueLearning } from '@/components/home/ContinueLearning'
import { ReferenceQuickLinks } from '@/components/home/ReferenceQuickLinks'
import { useRecentPages } from '@/hooks/useBookmarks'
import { useSearchContext } from '@/contexts/SearchContext'
import { usePageMeta } from '@/hooks/usePageMeta'

export function HomePage() {
  const { recent } = useRecentPages()
  const { openSearch } = useSearchContext()

  usePageMeta({})

  return (
    <div>
      <Hero onSearchOpen={openSearch} />
      <Stats />
      <ContinueLearning />
      <ContinueReading recent={recent} />
      <Roadmap />
      <ReferenceQuickLinks />
      <TopicCards />
      <FeaturedInterview />
    </div>
  )
}
