import { useEffect } from 'react'
import { SITE_CONFIG } from '@/config/site'

interface PageMetaOptions {
  title?: string
  description?: string
  slug?: string
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function usePageMeta({ title, description, slug }: PageMetaOptions) {
  useEffect(() => {
    const pageTitle = title ? `${title} — JavaMastery` : SITE_CONFIG.title
    const pageDescription = description || SITE_CONFIG.description
    const pageUrl = slug
      ? `${SITE_CONFIG.url}/docs/${slug}`
      : title
        ? SITE_CONFIG.url
        : SITE_CONFIG.url

    document.title = pageTitle
    setMeta('description', pageDescription)
    setMeta('og:title', pageTitle, 'property')
    setMeta('og:description', pageDescription, 'property')
    setMeta('og:url', pageUrl, 'property')
  }, [title, description, slug])
}
