export const LEARN_SECTION_ID = 'learn'
export const LEARN_CHAPTER_COUNT = 37

export function isLearnChapter(path: string): boolean {
  return /^docs\/02-learn\/\d{2}-/.test(path) && !path.includes('00-INDEX')
}
