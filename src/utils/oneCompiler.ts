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

const ONECOMPILER_QUERY_SOFT_LIMIT = 12000

export function buildOneCompilerUrls(source: string): {
  embedUrl: string
  fullTabUrl: string
  tooLargeForEmbed: boolean
} {
  const code = prepareOneCompilerSource(source)
  const encoded = encodeURIComponent(code)
  const tooLargeForEmbed = encoded.length > ONECOMPILER_QUERY_SOFT_LIMIT
  const fullTabUrl = `https://onecompiler.com/java?code=${encoded}`
  const embedUrl = `https://onecompiler.com/embed/java?code=${encoded}&theme=dark`
  return { embedUrl, fullTabUrl, tooLargeForEmbed }
}
