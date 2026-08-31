/** Fix common UTF-8 corruption in synced JavaMastery docs (em dash / arrows saved as ?). */
export function normalizeCorruptedMarkdown(content: string): string {
  return content
    .replace(/^(#\s+\d+)\s+\?\s+/gm, '$1 — ')
    .replace(/\uFFFD/g, '—')
    .replace(/\*\*([^*]+?)\s+\?\*\*/g, '**$1 →**')
}

/** Remove leading H1 when the page header already renders the doc title. */
export function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, '')
}
