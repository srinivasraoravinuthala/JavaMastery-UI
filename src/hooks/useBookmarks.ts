import { useState, useEffect, useCallback } from 'react'
import type { Bookmark, Favorite, RecentPage, TopicProgress } from '@/types'
import { getStorageItem, setStorageItem } from '@/utils/storage'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    getStorageItem<Bookmark[]>('bookmarks', [])
  )

  useEffect(() => {
    setStorageItem('bookmarks', bookmarks)
  }, [bookmarks])

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'addedAt'>) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.path === bookmark.path)) return prev
      return [{ ...bookmark, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeBookmark = useCallback((path: string) => {
    setBookmarks((prev) => prev.filter((b) => b.path !== path))
  }, [])

  const isBookmarked = useCallback(
    (path: string) => bookmarks.some((b) => b.path === path),
    [bookmarks]
  )

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() =>
    getStorageItem<Favorite[]>('favorites', [])
  )

  useEffect(() => {
    setStorageItem('favorites', favorites)
  }, [favorites])

  const addFavorite = useCallback((fav: Omit<Favorite, 'addedAt'>) => {
    setFavorites((prev) => {
      const key = fav.questionId || fav.path
      if (prev.some((f) => (f.questionId || f.path) === key)) return prev
      return [{ ...fav, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeFavorite = useCallback((key: string) => {
    setFavorites((prev) =>
      prev.filter((f) => (f.questionId || f.path) !== key)
    )
  }, [])

  const isFavorite = useCallback(
    (key: string) => favorites.some((f) => (f.questionId || f.path) === key),
    [favorites]
  )

  return { favorites, addFavorite, removeFavorite, isFavorite }
}

export function useRecentPages() {
  const [recent, setRecent] = useState<RecentPage[]>(() =>
    getStorageItem<RecentPage[]>('recent', [])
  )

  const addRecent = useCallback((page: Omit<RecentPage, 'visitedAt'>) => {
    setRecent((prev) => {
      const filtered = prev.filter((p) => p.path !== page.path)
      const updated = [{ ...page, visitedAt: Date.now() }, ...filtered].slice(0, 20)
      setStorageItem('recent', updated)
      return updated
    })
  }, [])

  return { recent, addRecent }
}

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, TopicProgress>>(() =>
    getStorageItem('progress', {})
  )

  const toggleComplete = useCallback((sectionId: string, path: string, total: number) => {
    setProgress((prev) => {
      const section = prev[sectionId] || { sectionId, completed: [], total, percentage: 0 }
      const completed = section.completed.includes(path)
        ? section.completed.filter((p) => p !== path)
        : [...section.completed, path]

      const updated: TopicProgress = {
        sectionId,
        completed,
        total,
        percentage: Math.round((completed.length / total) * 100),
      }

      const next = { ...prev, [sectionId]: updated }
      setStorageItem('progress', next)
      return next
    })
  }, [])

  const markComplete = useCallback((sectionId: string, path: string, total: number) => {
    setProgress((prev) => {
      const section = prev[sectionId] || { sectionId, completed: [], total, percentage: 0 }
      if (section.completed.includes(path)) return prev

      const completed = [...section.completed, path]
      const updated: TopicProgress = {
        sectionId,
        completed,
        total,
        percentage: Math.round((completed.length / total) * 100),
      }

      const next = { ...prev, [sectionId]: updated }
      setStorageItem('progress', next)
      return next
    })
  }, [])

  const isComplete = useCallback(
    (sectionId: string, path: string) =>
      progress[sectionId]?.completed.includes(path) ?? false,
    [progress]
  )

  const getSectionProgress = useCallback(
    (sectionId: string) => progress[sectionId],
    [progress]
  )

  return { progress, markComplete, toggleComplete, isComplete, getSectionProgress }
}
