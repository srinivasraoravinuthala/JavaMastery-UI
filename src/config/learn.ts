export const LEARN_SECTION_ID = 'learn'
export const LEARN_CHAPTER_COUNT = 40

const LEARN_CHAPTER_RE = /^docs\/02-learn\/\d+-[\w-]+\.md$/

export function isLearnChapter(path: string): boolean {
  return LEARN_CHAPTER_RE.test(path) && !path.endsWith('00-INDEX.md')
}
