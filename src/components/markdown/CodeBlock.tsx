import { useState, useMemo } from 'react'
import { Check, Copy } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markup'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface CodeBlockProps {
  children: string
  className?: string
  language?: string
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const code = children.replace(/\n$/, '')
  const lang = language ? (LANGUAGE_ALIASES[language] || language) : 'text'

  const highlighted = useMemo(() => {
    if (lang in Prism.languages) {
      try {
        return Prism.highlight(code, Prism.languages[lang], lang)
      } catch {
        return escapeHtml(code)
      }
    }
    return escapeHtml(code)
  }, [code, lang])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('code-block not-prose my-6', className)}>
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="sm"
          className="code-block-copy h-7 gap-1.5 px-2 text-xs"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className={cn('code-block-pre', `language-${lang}`)}>
        <code
          className={`language-${lang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}
