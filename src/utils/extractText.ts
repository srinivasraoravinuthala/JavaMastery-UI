import type { ReactNode, ReactElement } from 'react'

export function extractTextFromChildren(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return ''
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join('')
  if (typeof children === 'object' && 'props' in children) {
    return extractTextFromChildren((children as ReactElement<{ children?: ReactNode }>).props.children)
  }
  return ''
}
