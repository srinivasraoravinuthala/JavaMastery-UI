import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseLabeledSections } from '@/utils/interviewAnswer'

interface InterviewAnswerProps {
  content: string
}

export function InterviewAnswer({ content }: InterviewAnswerProps) {
  const sections = parseLabeledSections(content)

  if (sections) {
    return (
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={`${section.label ?? 'line'}-${index}`} className="text-sm leading-7">
            {section.label ? (
              <>
                <span className="font-semibold text-foreground">{section.label}:</span>{' '}
                <span className="text-muted-foreground">{section.text}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{section.text}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
