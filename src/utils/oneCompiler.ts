/** Prepare Java source for OneCompiler (expects a public class Main, no package). */
export function prepareOneCompilerSource(source: string): string {
  let code = source.replace(/^package\s+[\w.]+;\s*/m, '')

  // OneCompiler's single-file runner expects public class Main
  const publicClass = code.match(/public\s+class\s+(\w+)/)
  if (publicClass && publicClass[1] !== 'Main') {
    const name = publicClass[1]
    code = code
      .replace(new RegExp(`\\bpublic\\s+class\\s+${name}\\b`), 'public class Main')
      .replace(new RegExp(`\\bnew\\s+${name}\\s*\\(`, 'g'), 'new Main(')
      .replace(new RegExp(`\\b${name}\\s*\\.`, 'g'), 'Main.')
  }

  return code.trim()
}

/** Soft limit: very large query strings are unreliable; prefer postMessage / clipboard. */
const ONECOMPILER_QUERY_SOFT_LIMIT = 12000

export function buildOneCompilerUrls(source: string): {
  /** Prepared source (no package, public class Main) */
  preparedCode: string
  /** Embed iframe — use with postMessage populateCode (listenToEvents=true). */
  embedUrl: string
  /** Full-tab URL; code= is best-effort and often ignored for large/complex sources. */
  fullTabUrl: string
  tooLargeForEmbed: boolean
} {
  const preparedCode = prepareOneCompilerSource(source)
  const encoded = encodeURIComponent(preparedCode)
  const tooLargeForEmbed = encoded.length > ONECOMPILER_QUERY_SOFT_LIMIT

  // Official embed API: listenToEvents + postMessage populateCode (not ?code=).
  const embedUrl =
    'https://onecompiler.com/embed/java?theme=dark&listenToEvents=true&hideNew=true&hideLanguageSelection=true'

  // Best-effort full-tab deep link; browsers/OneCompiler may still open default Hello World.
  const fullTabUrl = tooLargeForEmbed
    ? 'https://onecompiler.com/java'
    : `https://onecompiler.com/java?code=${encoded}`

  return { preparedCode, embedUrl, fullTabUrl, tooLargeForEmbed }
}

/** Inject prepared Java into a OneCompiler embed iframe (requires listenToEvents=true). */
export function populateOneCompilerEmbed(
  iframe: HTMLIFrameElement,
  preparedCode: string
): void {
  iframe.contentWindow?.postMessage(
    {
      eventType: 'populateCode',
      language: 'java',
      files: [{ name: 'Main.java', content: preparedCode }],
    },
    '*'
  )
}
