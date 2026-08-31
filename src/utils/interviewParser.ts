import type { InterviewQuestion } from '@/types'

const SKIP_HEADINGS =
  /^(index|table of|detailed questions|puzzles|study tips|overview|introduction|contents|rapid-?fire)/i

/** Split puzzle/body content so the stem (e.g. code) is visible before reveal. */
export function splitPromptAndAnswer(body: string): { prompt: string; answer: string } {
  const markers = [
    /\n\*\*Answer:\*\*/i,
    /\n\*\*Answers?:\*\*/i,
    /\n\*\*Why:\*\*/i,
    /\n\*\*Solution:\*\*/i,
    /\n\*\*Output:\*\*/i,
    /\nAnswer:/i,
  ]

  let cut = -1
  for (const re of markers) {
    const m = body.match(re)
    if (m?.index != null && (cut < 0 || m.index < cut)) {
      cut = m.index
    }
  }

  if (cut < 0) {
    return { prompt: '', answer: body.trim() }
  }

  return {
    prompt: body.slice(0, cut).trim(),
    answer: body.slice(cut).trim(),
  }
}

export function parseInterviewQuestions(content: string, topic?: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = []
  const sections = content.split(/(?=^#{2,3}\s)/m)

  for (const section of sections) {
    const headingMatch = section.match(/^#{2,3}\s+(.+)$/m)
    if (!headingMatch) continue

    const heading = headingMatch[1].replace(/[*_`]/g, '').trim()
    const body = section.replace(/^#{2,3}\s+.+$/m, '').trim()

    if (SKIP_HEADINGS.test(heading)) {
      // Still expand rapid-fire Q → A lines under that section heading.
      if (/rapid-?fire/i.test(heading) && body) {
        questions.push(...parseRapidFireLines(body, topic))
      }
      continue
    }

    if (!body || body.length < 10) continue

    // Numbered rapid-fire lines without a Rapid-Fire heading
    if (/^\d+\.\s+.+\s*→\s*.+/m.test(body) && body.split(/\n/).filter((l) => /^\d+\.\s+/.test(l)).length >= 3) {
      const rf = parseRapidFireLines(body, topic)
      if (rf.length > 0) {
        questions.push(...rf)
        continue
      }
    }

    const isQuestion =
      heading.includes('?') ||
      /^(q\d+|question|puzzle|what|how|why|when|where|explain|describe|compare|difference|\d+[).])/i.test(
        heading
      )

    if (!isQuestion && body.length < 50) continue

    const { prompt, answer } = splitPromptAndAnswer(body)
    const questionText = prompt ? `${heading}\n\n${prompt}` : heading

    questions.push({
      id: `q-${slugify(heading)}`,
      question: questionText,
      answer: answer || body,
      topic,
      difficulty: detectDifficulty(heading, answer || body),
    })
  }

  if (questions.length === 0) {
    return parseQAPairs(content, topic)
  }

  return questions
}

function parseRapidFireLines(body: string, topic?: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = []
  const lineRe = /^\d+\.\s+(.+?)\s*→\s*(.+)$/gm
  let match
  let index = 0

  while ((match = lineRe.exec(body)) !== null) {
    const q = match[1].trim()
    const a = match[2].trim()
    if (!q || !a) continue
    questions.push({
      id: `rf-${index++}-${slugify(q)}`,
      question: q,
      answer: a,
      topic,
      difficulty: 'easy',
    })
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
  if (text.includes('basic') || text.includes('what is') || text.includes('puzzle')) return 'easy'
  return 'medium'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
}
