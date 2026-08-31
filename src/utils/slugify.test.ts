import { describe, it, expect } from 'vitest'
import {
  resolveRelativePath,
  resolveMdLink,
  resolveRepoLink,
  pathToSlug,
} from './slugify'

describe('resolveRelativePath', () => {
  it('resolves same-folder links', () => {
    expect(
      resolveRelativePath('00-INDEX.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('docs/02-learn/00-INDEX.md')
  })

  it('resolves single-level parent links', () => {
    expect(
      resolveRelativePath('../03-interview/01-CoreJava.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('docs/03-interview/01-CoreJava.md')
  })

  it('resolves multi-level parent links', () => {
    expect(
      resolveRelativePath('../../06-career/02-InterviewGuide.md', 'docs/02-learn/37-InterviewPrep.md')
    ).toBe('docs/06-career/02-InterviewGuide.md')
  })
})

describe('resolveMdLink', () => {
  it('converts cross-section relative link to correct slug', () => {
    expect(
      resolveMdLink('../03-interview/01-CoreJava.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('03-interview--01-CoreJava')
  })

  it('preserves hash anchors', () => {
    expect(
      resolveMdLink('../03-interview/01-CoreJava.md#q1', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('03-interview--01-CoreJava#q1')
  })
})

describe('resolveRepoLink', () => {
  it('rewrites pkg directory links to GitHub tree', () => {
    expect(
      resolveRepoLink('../../pkg1core', 'docs/03-interview/02-OopAndSolid.md')
    ).toBe('https://github.com/srinivasraoravinuthala/JavaMastery/tree/main/pkg1core')
  })

  it('rewrites README links', () => {
    expect(
      resolveRepoLink('../../README.md', 'docs/02-learn/37-InterviewPrep.md')
    ).toBe('https://github.com/srinivasraoravinuthala/JavaMastery/blob/main/README.md')
  })

  it('returns null for markdown links', () => {
    expect(
      resolveRepoLink('../03-interview/01-CoreJava.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBeNull()
  })
})

describe('pathToSlug', () => {
  it('converts nested paths to double-dash slugs', () => {
    expect(pathToSlug('docs/03-interview/01-CoreJava.md')).toBe('03-interview--01-CoreJava')
  })
})
