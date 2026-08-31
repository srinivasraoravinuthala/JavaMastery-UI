import { useState, useEffect, useCallback } from 'react'
import type { UserPreferences } from '@/types'
import { getStorageItem, setStorageItem } from '@/utils/storage'

const DEFAULTS: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  interviewMode: true,
  showAnswersOnly: false,
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    getStorageItem<UserPreferences>('preferences', DEFAULTS)
  )

  useEffect(() => {
    setStorageItem('preferences', prefs)
  }, [prefs])

  const updatePref = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }, [])

  return { prefs, updatePref }
}
