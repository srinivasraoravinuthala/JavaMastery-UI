import { describe, expect, it } from 'vitest'
import { parseLabeledSections } from './interviewAnswer'

describe('parseLabeledSections', () => {
  it('parses Short/Detailed/Example without keeping markdown markers', () => {
    const sections = parseLabeledSections(`- **Short:** Measure first.
- **Detailed:** Avoid premature optimization.
- **Example:** Fix the algorithm.`)

    expect(sections).toEqual([
      { label: 'Short', text: 'Measure first.' },
      { label: 'Detailed', text: 'Avoid premature optimization.' },
      { label: 'Example', text: 'Fix the algorithm.' },
    ])
  })

  it('returns null for free-form answers so markdown can handle them', () => {
    expect(parseLabeledSections('Use **JMH** for benchmarks.')).toBeNull()
  })
})
