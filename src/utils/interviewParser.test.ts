import { describe, expect, it } from 'vitest'
import { parseInterviewQuestions, splitPromptAndAnswer } from './interviewParser'

describe('splitPromptAndAnswer', () => {
  it('keeps puzzle code in the prompt and Answer/Why in the answer', () => {
    const body = `\`\`\`java
System.out.println(1 + 2 + "3");
\`\`\`
**Answer:** \`33\`.
**Why:** Left-to-right concat.`

    const { prompt, answer } = splitPromptAndAnswer(body)
    expect(prompt).toContain('System.out.println')
    expect(prompt).not.toContain('**Answer:**')
    expect(answer).toContain('**Answer:**')
    expect(answer).toContain('**Why:**')
  })
})

describe('parseInterviewQuestions', () => {
  it('shows puzzle stem before reveal and skips Study Tips', () => {
    const md = `# Puzzles

## Puzzles

### Puzzle 1
\`\`\`java
System.out.println(1 + 2 + "3");
\`\`\`
**Answer:** \`33\`.
**Why:** concat.

### Puzzle 2
\`\`\`java
System.out.println(true);
\`\`\`
**Answer:** \`true\`.

## Study Tips

1. Trace types on paper.
2. Re-run in jshell.
`

    const qs = parseInterviewQuestions(md, 'Print Puzzles')
    expect(qs).toHaveLength(2)
    expect(qs[0].question).toContain('Puzzle 1')
    expect(qs[0].question).toContain('System.out.println')
    expect(qs[0].answer).toContain('**Answer:**')
    expect(qs[0].answer).not.toContain('```java')
  })

  it('parses rapid-fire lines into separate cards', () => {
    const md = `## Rapid-Fire (Q → A)

1. Is Java pure OOP? → No; it has primitives.
2. Default value of int? → 0.
`

    const qs = parseInterviewQuestions(md)
    expect(qs.length).toBeGreaterThanOrEqual(2)
    expect(qs[0].question).toContain('Is Java pure OOP?')
    expect(qs[0].answer).toContain('primitives')
  })
})
