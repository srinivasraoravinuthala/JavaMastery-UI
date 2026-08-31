function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/** Normalize malformed slugs like "02-learn--03-interview/01-CoreJava" for matching. */
function normalizeAttemptedSlug(slug: string): string {
  return slug.replace(/\//g, '--').toLowerCase()
}

export function suggestSlugs(attempted: string, knownSlugs: string[], limit = 3): string[] {
  if (!attempted || knownSlugs.length === 0) return []

  const normalized = normalizeAttemptedSlug(attempted)

  return knownSlugs
    .map((slug) => ({
      slug,
      distance: levenshtein(normalized, slug.toLowerCase()),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .filter((item) => item.distance <= Math.max(8, normalized.length / 2))
    .map((item) => item.slug)
}
