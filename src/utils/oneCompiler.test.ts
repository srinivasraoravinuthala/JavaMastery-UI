import { describe, expect, it } from 'vitest'
import { prepareOneCompilerSource, buildOneCompilerUrls } from './oneCompiler'

describe('prepareOneCompilerSource', () => {
  it('strips package and renames public class to Main', () => {
    const src = `package pkg1core;

public class core10Encapsulation {
  public static void main(String[] args) {
    System.out.println("hi");
  }
}
`
    const out = prepareOneCompilerSource(src)
    expect(out).not.toContain('package ')
    expect(out).toContain('public class Main')
    expect(out).not.toContain('public class core10Encapsulation')
  })

  it('marks very large payloads as too large for embed', () => {
    const big = 'public class Foo {\n' + '  // ' + 'x'.repeat(20000) + '\n}'
    const { tooLargeForEmbed, fullTabUrl } = buildOneCompilerUrls(big)
    expect(tooLargeForEmbed).toBe(true)
    expect(fullTabUrl).toContain('onecompiler.com/java')
  })
})
