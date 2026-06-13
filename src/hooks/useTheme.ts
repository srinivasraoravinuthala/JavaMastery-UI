import { useState, useEffect, useCallback } from 'react'
import { getStorageItem, setStorageItem } from '@/utils/storage'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    getStorageItem<Theme>('theme', 'system')
  )

  const resolvedTheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const resolved = resolvedTheme()

    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    setStorageItem('theme', theme)
  }, [theme, resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(mq.matches ? 'dark' : 'light')
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggleTheme = () => {
    setThemeState((prev) => {
      const current = prev === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : prev
      return current === 'dark' ? 'light' : 'dark'
    })
  }

  return { theme, setTheme, toggleTheme, resolvedTheme: resolvedTheme() }
}
