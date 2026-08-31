import { useEffect } from 'react'
import { SITE_CONFIG } from '@/config/site'

interface PageMetaOptions {
  title?: string
  description?: string
  slug?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  const id = 'javamastery-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function usePageMeta({ title, description, slug, type = 'website', jsonLd }: PageMetaOptions) {
  useEffect(() => {
    const pageTitle = title ? `${title} — ${SITE_CONFIG.name}` : SITE_CONFIG.title
    document.title = pageTitle

    const desc = description || SITE_CONFIG.description
    const url = slug ? `${SITE_CONFIG.url}/docs/${slug}` : SITE_CONFIG.url
    const image = SITE_CONFIG.ogImage

    setMetaTag('name', 'description', desc)
    setMetaTag('property', 'og:title', pageTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', image)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', pageTitle)
    setMetaTag('name', 'twitter:description', desc)
    setMetaTag('name', 'twitter:image', image)
    setCanonical(url)

    const defaultLd = slug
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title || SITE_CONFIG.name,
          description: desc,
          url,
          author: { '@type': 'Organization', name: SITE_CONFIG.name },
        }
      : undefined

    setJsonLd(jsonLd ?? defaultLd)
  }, [title, description, slug, type, jsonLd])
}
