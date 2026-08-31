import { describe, it, expect } from 'vitest'
import { suggestSlugs } from './slugSuggestions'

describe('suggestSlugs', () => {
  const known = [
    '03-interview--01-CoreJava',
    '02-learn--02-VariablesAndTypes',
    '03-interview--06-Streams',
  ]

  it('suggests correct slug for malformed cross-section slug', () => {
    const suggestions = suggestSlugs('02-learn--03-interview/01-CoreJava', known)
    expect(suggestions[0]).toBe('03-interview--01-CoreJava')
  })

  it('returns empty for empty input', () => {
    expect(suggestSlugs('', known)).toEqual([])
  })
})
