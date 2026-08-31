import { useEffect } from 'react'
import { SITE_CONFIG } from '@/config/site'

interface PageMetaOptions {
  title?: string
  description?: string
  slug?: string
}

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOgTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, slug }: PageMetaOptions) {
  useEffect(() => {
    const pageTitle = title ? `${title} — ${SITE_CONFIG.name}` : SITE_CONFIG.title
    document.title = pageTitle

    const desc = description || SITE_CONFIG.description
    setMetaTag('description', desc)
    setOgTag('og:title', pageTitle)
    setOgTag('og:description', desc)
    setOgTag('og:type', 'website')

    if (slug) {
      setOgTag('og:url', `${SITE_CONFIG.url}/docs/${slug}`)
    }
  }, [title, description, slug])
}
