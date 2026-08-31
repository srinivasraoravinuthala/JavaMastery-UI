import { useEffect, useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Clock, Bookmark, BookmarkCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { TableOfContents } from '@/components/markdown/TableOfContents'
import { DocNavigation } from '@/components/doc/DocNavigation'
import { DocNotFound } from '@/components/doc/DocNotFound'
import { ChapterExamplesPanel } from '@/components/examples/ChapterExamplesPanel'
import { InterviewMode } from '@/components/interview/InterviewMode'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDocContent, useContentTree, getAdjacentDocs, flattenTree } from '@/hooks/useContent'
import { useBookmarks, useFavorites, useRecentPages, useProgress } from '@/hooks/useBookmarks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { parseInterviewQuestions } from '@/utils/interviewParser'
import { suggestSlugs } from '@/utils/slugSuggestions'
import { getSearchService } from '@/services/searchService'
import { isLearnChapter, LEARN_CHAPTER_COUNT, LEARN_SECTION_ID } from '@/config/learn'

export function DocPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const { doc, loading, error } = useDocContent(slug)
  const { tree } = useContentTree()
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const { addFavorite, isFavorite } = useFavorites()
  const { addRecent } = useRecentPages()
  const { toggleComplete, isComplete } = useProgress()
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])

  const adjacent = useMemo(
    () => (slug ? getAdjacentDocs(tree, slug) : { prev: null, next: null }),
    [tree, slug]
  )

  const interviewQuestions = useMemo(() => {
    if (!doc?.isInterview || !doc.content) return []
    return parseInterviewQuestions(doc.content, doc.title)
  }, [doc])

  usePageMeta({
    title: doc?.title,
    description: doc ? `${doc.title} — ${doc.sectionTitle || 'JavaMastery documentation'}` : undefined,
    slug: doc?.slug,
  })

  useEffect(() => {
    if (doc) {
      addRecent({
        path: doc.path,
        slug: doc.slug,
        title: doc.title,
        section: doc.sectionTitle,
      })
    }
  }, [doc, addRecent])

  useEffect(() => {
    if (!slug || doc || loading) return

    const flatSlugs = flattenTree(tree).map((n) => n.slug)
    if (flatSlugs.length > 0) {
      setSlugSuggestions(suggestSlugs(slug, flatSlugs))
      return
    }

    getSearchService()
      .getAllSlugs()
      .then((slugs) => setSlugSuggestions(suggestSlugs(slug, slugs)))
      .catch(() => setSlugSuggestions([]))
  }, [slug, doc, loading, tree])

  useEffect(() => {
    if (!doc || loading) return

    const hash = location.hash
    if (!hash) return

    const id = hash.slice(1)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    return () => window.clearTimeout(timer)
  }, [doc, loading, location.hash])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !doc) {
    return <DocNotFound slug={slug} suggestions={slugSuggestions} />
  }

  const bookmarked = isBookmarked(doc.path)
  const completed = isComplete(LEARN_SECTION_ID, doc.path)
  const showProgress = isLearnChapter(doc.path)

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(doc.path)
    } else {
      addBookmark({ path: doc.path, slug: doc.slug, title: doc.title, section: doc.sectionTitle })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex gap-8 max-w-7xl mx-auto">
        <article className="flex-1 min-w-0 max-w-4xl">
          <header className="mb-8">
            {doc.sectionTitle && (
              <Badge variant="secondary" className="mb-3">{doc.sectionTitle}</Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{doc.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {doc.readingTimeMinutes} min read
              </span>
              {doc.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {showProgress && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComplete(LEARN_SECTION_ID, doc.path, LEARN_CHAPTER_COUNT)}
                >
                  <CheckCircle2 className={`h-4 w-4 ${completed ? 'text-primary' : ''}`} />
                  {completed ? 'Completed' : 'Mark complete'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleBookmark} className="ml-auto">
                {bookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </header>

          {showProgress && <ChapterExamplesPanel content={doc.content} />}

          {doc.isInterview && interviewQuestions.length > 0 && (
            <InterviewMode
              questions={interviewQuestions}
              topic={doc.title}
              onBookmark={(q) =>
                addBookmark({
                  path: doc.path,
                  slug: doc.slug,
                  title: q.question,
                  section: doc.sectionTitle,
                })
              }
              onFavorite={(q) =>
                addFavorite({
                  path: doc.path,
                  slug: doc.slug,
                  title: q.question,
                  section: doc.sectionTitle,
                  type: 'question',
                  questionId: q.id,
                })
              }
              isBookmarked={() => isBookmarked(doc.path)}
              isFavorite={isFavorite}
            />
          )}

          <MarkdownRenderer content={doc.content} currentDocPath={doc.path} stripTitle />
          <DocNavigation prev={adjacent.prev} next={adjacent.next} />
        </article>

        {doc.headings.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-20">
              <TableOfContents headings={doc.headings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
