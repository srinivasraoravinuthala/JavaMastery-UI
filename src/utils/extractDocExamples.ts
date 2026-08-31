import {
  extractExampleRefs,
  expandExampleRefs,
  normalizeExamplePath,
  splitExampleLine,
} from '@/utils/examplePath'
import { getExamplesService } from '@/services/examplesService'

/** Resolve all example repo paths referenced in a learn chapter markdown body */
export async function extractChapterExamples(content: string): Promise<string[]> {
  const service = getExamplesService()
  await service.getIndex()
  const classIndex = service.getClassIndex()
  const allPaths = await service.getAllPaths()

  const paths = new Set<string>()

  for (const line of content.split('\n')) {
    if (line.includes('▶')) {
      for (const part of splitExampleLine(line)) {
        const arrowParts = part.split(/\s*→\s*/)
        if (arrowParts.length === 2) {
          const expanded = expandExampleRefs([part], allPaths)
          expanded.forEach((p) => paths.add(p))
        } else {
          const normalized = normalizeExamplePath(part, classIndex)
          if (normalized) paths.add(normalized)
        }
      }
    }
  }

  for (const ref of extractExampleRefs(content)) {
    const normalized = normalizeExamplePath(ref, classIndex)
    if (normalized) paths.add(normalized)
  }

  return [...paths].sort()
}
