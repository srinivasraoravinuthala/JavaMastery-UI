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
import { RunnableExampleChip, isRunCommand } from '@/components/examples/RunnableExampleChip'
import { ExampleChipsRow, parseExampleChipsLine } from '@/components/examples/ExampleChipsRow'
import { extractTextFromChildren } from '@/utils/extractText'
import { resolveMdLink, resolveRepoLink } from '@/utils/slugify'

interface MarkdownRendererProps {
  content: string
  currentDocPath?: string
}

export function MarkdownRenderer({ content, currentDocPath }: MarkdownRendererProps) {
  const processedContent = useMemo(() => {
    let result = content
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

    result = result
      .split('\n')
      .map((line) => {
        const chipsData = parseExampleChipsLine(line)
        if (chipsData) {
          return `<div class="example-chips-row" data-refs="${chipsData.replace(/"/g, '&quot;')}"></div>`
        }
        return line
      })
      .join('\n')

    return result
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
            if (!href) {
              return <a {...props}>{children}</a>
            }

            if (currentDocPath) {
              const repoUrl = resolveRepoLink(href, currentDocPath)
              if (repoUrl) {
                return (
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                )
              }
            }

            const hashIndex = href.indexOf('#')
            const pathHref = hashIndex >= 0 ? href.slice(0, hashIndex) : href
            const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''

            if (pathHref.endsWith('.md') && currentDocPath) {
              const slug = resolveMdLink(pathHref, currentDocPath)
              return (
                <Link to={`/docs/${slug}${hash}`} {...props}>
                  {children}
                </Link>
              )
            }

            if (href.startsWith('/')) {
              return (
                <Link to={href} {...props}>
                  {children}
                </Link>
              )
            }

            return (
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...props}>
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

            const text = String(children).trim()
            if (isRunCommand(text)) {
              return <RunnableExampleChip refText={text} />
            }

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
          div: ({ className, children, ...props }) => {
            if (className?.startsWith('callout-')) {
              const type = parseCalloutType(className)
              return <Callout type={type}>{children}</Callout>
            }
            if (className === 'example-chips-row') {
              const refs = (props as { 'data-refs'?: string })['data-refs']
              if (refs) return <ExampleChipsRow refs={refs} />
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
