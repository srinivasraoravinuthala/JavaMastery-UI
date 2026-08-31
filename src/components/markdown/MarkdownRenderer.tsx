import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import { Link } from 'react-router-dom'
import { CodeBlock } from './CodeBlock'
import { MermaidDiagram } from './MermaidDiagram'
import { Callout, parseCalloutType } from './Callout'
import { extractTextFromChildren } from '@/utils/extractText'

interface MarkdownRendererProps {
  content: string
  currentSlug?: string
}

export function MarkdownRenderer({ content, currentSlug }: MarkdownRendererProps) {
  const processedContent = useMemo(() => {
    return content
      .replace(/:::(\w+)\n([\s\S]*?):::/g, (_, type, body) => {
        return `<div class="callout-${type}">${body.trim()}</div>`
      })
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
        if (src.startsWith('http')) return `![${alt}](${src})`
        const resolved = src.startsWith('../')
          ? `https://raw.githubusercontent.com/srinivasraoravinuthala/JavaMastery/main/${src.replace(/^\.\.\//, '')}`
          : src
        return `![${alt}](${resolved})`
      })
  }, [content])

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'append', properties: { className: ['anchor-link'] } }],
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.endsWith('.md')) {
              const slug = mdLinkToSlug(href, currentSlug)
              return (
                <Link to={`/docs/${slug}`} {...props}>
                  {children}
                </Link>
              )
            }
            if (href?.startsWith('/')) {
              return (
                <Link to={href} {...props}>
                  {children}
                </Link>
              )
            }
            return (
              <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
          pre: ({ children }) => {
            const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
            const className = child?.props?.className || ''
            const match = /language-(\w+)/.exec(className)
            const language = match?.[1]
            const code = extractTextFromChildren(child?.props?.children).replace(/\n$/, '')

            if (language === 'mermaid') {
              return <MermaidDiagram chart={code} />
            }

            return <CodeBlock language={language}>{code}</CodeBlock>
          },
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) return <code className={className} {...props}>{children}</code>
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                {children}
              </code>
            )
          },
          table: ({ children }) => (
            <div className="table-wrapper">
              <table>{children}</table>
            </div>
          ),
          blockquote: ({ children }) => {
            const text = String(children)
            if (text.includes('[!NOTE]') || text.includes('[!TIP]') || text.includes('[!WARNING]')) {
              const type = text.includes('[!WARNING]') ? 'warning' : text.includes('[!TIP]') ? 'tip' : 'info'
              const clean = text.replace(/\[!(\w+)\]/g, '').trim()
              return <Callout type={type}>{clean}</Callout>
            }
            return <blockquote>{children}</blockquote>
          },
          div: ({ className, children }) => {
            if (className?.startsWith('callout-')) {
              const type = parseCalloutType(className)
              return <Callout type={type}>{children}</Callout>
            }
            return <div className={className}>{children}</div>
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

function mdLinkToSlug(href: string, currentSlug?: string): string {
  if (href.startsWith('http')) return href

  let path = href.replace(/\.md$/, '').replace(/^\.\//, '')

  if (path.startsWith('../') && currentSlug) {
    const parts = currentSlug.split('--')
    parts.pop()
    const parent = parts.join('--')
    path = path.replace(/^\.\.\//, '')
    return parent ? `${parent}--${path}` : path
  }

  if (path.includes('/')) {
    return path.replace(/\//g, '--')
  }

  if (currentSlug?.includes('--')) {
    const parts = currentSlug.split('--')
    parts[parts.length - 1] = path
    return parts.join('--')
  }

  return path
}
