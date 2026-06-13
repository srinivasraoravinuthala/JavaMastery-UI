import { useEffect, useCallback } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const ctrlOrMeta = options.ctrl || options.meta
      if (ctrlOrMeta && !(e.ctrlKey || e.metaKey)) return
      if (options.shift && !e.shiftKey) return
      if (e.key.toLowerCase() !== key.toLowerCase()) return

      e.preventDefault()
      callback()
    },
    [key, callback, options.ctrl, options.meta, options.shift]
  )

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}
