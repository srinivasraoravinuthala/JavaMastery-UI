export interface AnswerSection {
  label: string | null
  text: string
}

/** Parse "- **Short:** …" style lines used across interview docs. */
export function parseLabeledSections(content: string): AnswerSection[] | null {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const sections: AnswerSection[] = []
  let matchedLabeled = 0

  for (const line of lines) {
    const labeled = line.match(/^[-*•]\s*\*\*(.+?):\*\*\s*(.*)$/)
    if (labeled) {
      matchedLabeled += 1
      sections.push({ label: labeled[1].trim(), text: labeled[2].trim() })
      continue
    }

    const plainBullet = line.match(/^[-*•]\s+(.*)$/)
    if (plainBullet) {
      sections.push({ label: null, text: plainBullet[1].trim() })
      continue
    }

    sections.push({ label: null, text: line })
  }

  if (matchedLabeled === 0) return null
  return sections
}
