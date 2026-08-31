import { useState, useEffect, useCallback } from 'react'
import { getStorageItem, setStorageItem } from '@/utils/storage'

export function useViewedExamples() {
  const [viewed, setViewed] = useState<string[]>(() =>
    getStorageItem<string[]>('viewedExamples', [])
  )

  useEffect(() => {
    setStorageItem('viewedExamples', viewed)
  }, [viewed])

  const markViewed = useCallback((path: string) => {
    setViewed((prev) => (prev.includes(path) ? prev : [...prev, path]))
  }, [])

  return { viewed, markViewed, viewedCount: viewed.length }
}

export function useInterviewReview() {
  const [reviewed, setReviewed] = useState<string[]>(() =>
    getStorageItem<string[]>('interviewReviewed', [])
  )

  useEffect(() => {
    setStorageItem('interviewReviewed', reviewed)
  }, [reviewed])

  const toggleReviewed = useCallback((slug: string) => {
    setReviewed((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }, [])

  const isReviewed = useCallback(
    (slug: string) => reviewed.includes(slug),
    [reviewed]
  )

  return { reviewed, toggleReviewed, isReviewed }
}

export interface LearnerDataExport {
  version: 1
  exportedAt: number
  bookmarks: ReturnType<typeof getStorageItem>
  favorites: ReturnType<typeof getStorageItem>
  progress: ReturnType<typeof getStorageItem>
  recent: ReturnType<typeof getStorageItem>
  viewedExamples: string[]
  interviewReviewed: string[]
  preferences: ReturnType<typeof getStorageItem>
}

export function exportLearnerData(): LearnerDataExport {
  return {
    version: 1,
    exportedAt: Date.now(),
    bookmarks: getStorageItem('bookmarks', []),
    favorites: getStorageItem('favorites', []),
    progress: getStorageItem('progress', {}),
    recent: getStorageItem('recent', []),
    viewedExamples: getStorageItem('viewedExamples', []),
    interviewReviewed: getStorageItem('interviewReviewed', []),
    preferences: getStorageItem('preferences', {}),
  }
}

export function importLearnerData(data: LearnerDataExport): void {
  if (data.version !== 1) throw new Error('Unsupported export version')
  setStorageItem('bookmarks', data.bookmarks ?? [])
  setStorageItem('favorites', data.favorites ?? [])
  setStorageItem('progress', data.progress ?? {})
  setStorageItem('recent', data.recent ?? [])
  setStorageItem('viewedExamples', data.viewedExamples ?? [])
  setStorageItem('interviewReviewed', data.interviewReviewed ?? [])
  if (data.preferences) setStorageItem('preferences', data.preferences)
}
