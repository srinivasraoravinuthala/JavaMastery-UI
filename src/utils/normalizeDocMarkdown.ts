/** Fix common UTF-8 corruption and broken footer bold in synced JavaMastery docs. */
export function normalizeCorruptedMarkdown(content: string): string {
  return content
    .replace(/^(#\s+\d+)\s+\?\s+/gm, '$1 — ')
    .replace(/\uFFFD/g, '—')
    .replace(/\*\*([^*]+?)\s+\?\*\*/g, '**$1 →**')
    // Label-less footers like ** →** [Link](...) — show as Next/Related
    .replace(/\*\*\s*→\*\*\s*\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      const label = /03-interview|04-reference/.test(href) ? 'Related' : 'Next'
      return `**${label} →** [${text}](${href})`
    })
}

/** Remove leading H1 when the page header already renders the doc title. */
export function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, '')
}
