import { describe, it, expect } from 'vitest'
import {
  resolveRelativePath,
  resolveMdPath,
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
    ).toBe('06-career/02-InterviewGuide.md')
  })

  it('resolves absolute-style paths from docs root', () => {
    expect(
      resolveRelativePath('03-interview/01-CoreJava.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('docs/03-interview/01-CoreJava.md')
  })
})

describe('resolveMdLink', () => {
  it('converts cross-section relative link to correct slug', () => {
    expect(
      resolveMdLink('../03-interview/01-CoreJava.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('03-interview--01-CoreJava')
  })

  it('converts same-folder link to correct slug', () => {
    expect(
      resolveMdLink('03-OperatorsAndCasting.md', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('02-learn--03-OperatorsAndCasting')
  })

  it('preserves hash anchors', () => {
    expect(
      resolveMdLink('../03-interview/01-CoreJava.md#q1', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('03-interview--01-CoreJava#q1')
  })
})

describe('resolveMdPath', () => {
  it('adds .md extension when missing', () => {
    expect(
      resolveMdPath('../03-interview/01-CoreJava', 'docs/02-learn/02-VariablesAndTypes.md')
    ).toBe('docs/03-interview/01-CoreJava.md')
  })
})

describe('resolveRepoLink', () => {
  it('rewrites pkg directory links to GitHub tree', () => {
    expect(
      resolveRepoLink('../../pkg1core', 'docs/03-interview/02-OopAndSolid.md')
    ).toBe('https://github.com/srinivasraoravinuthala/JavaMastery/tree/main/pkg1core')
  })

  it('rewrites pkg java file links to GitHub blob', () => {
    expect(
      resolveRepoLink('../../pkg1core/core9StringsDemo.java', 'docs/03-interview/09-StringsAndPerformance.md')
    ).toBe('https://github.com/srinivasraoravinuthala/JavaMastery/blob/main/pkg1core/core9StringsDemo.java')
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
