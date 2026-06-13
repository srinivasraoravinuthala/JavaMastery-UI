import type { InterviewQuestion } from '@/types'

export function parseInterviewQuestions(content: string, topic?: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = []
  const sections = content.split(/(?=^#{2,3}\s)/m)

  for (const section of sections) {
    const headingMatch = section.match(/^#{2,3}\s+(.+)$/m)
    if (!headingMatch) continue

    const heading = headingMatch[1].replace(/[*_`]/g, '').trim()
    if (heading.toLowerCase().includes('index') || heading.toLowerCase().includes('table of')) {
      continue
    }

    const body = section.replace(/^#{2,3}\s+.+$/m, '').trim()
    if (!body || body.length < 20) continue

    const isQuestion =
      heading.includes('?') ||
      /^(q\d+|question|what|how|why|when|where|explain|describe|compare|difference)/i.test(heading)

    if (isQuestion || body.length > 50) {
      questions.push({
        id: `q-${slugify(heading)}`,
        question: heading,
        answer: body,
        topic,
        difficulty: detectDifficulty(heading, body),
      })
    }
  }

  if (questions.length === 0) {
    return parseQAPairs(content, topic)
  }

  return questions
}

function parseQAPairs(content: string, topic?: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = []
  const qaPattern = /\*\*Q[:\s]*\*\*(.+?)\*\*A[:\s]*\*\*(.+?)(?=\*\*Q|$)/gs
  let match
  let index = 0

  while ((match = qaPattern.exec(content)) !== null) {
    questions.push({
      id: `qa-${index++}`,
      question: match[1].trim(),
      answer: match[2].trim(),
      topic,
    })
  }

  return questions
}

function detectDifficulty(question: string, answer: string): 'easy' | 'medium' | 'hard' {
  const text = (question + answer).toLowerCase()
  if (text.includes('senior') || text.includes('internals') || text.includes('jmm')) return 'hard'
  if (text.includes('basic') || text.includes('what is')) return 'easy'
  return 'medium'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
}
