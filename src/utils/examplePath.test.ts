import { describe, it, expect } from 'vitest'
import {
  isExampleReference,
  isExampleRunLine,
  parseRunCommand,
  normalizeExamplePath,
  toRunCommand,
  exampleLabel,
  extractExampleRefs,
  splitExampleLine,
  expandExampleRefs,
} from './examplePath'

describe('isExampleReference', () => {
  it('recognizes java run commands', () => {
    expect(isExampleReference('java pkg1core/core2Variables.java')).toBe(true)
  })

  it('recognizes bare core class names', () => {
    expect(isExampleReference('core26ConstructorsDemo')).toBe(true)
  })

  it('recognizes bare class names with .java suffix', () => {
    expect(isExampleReference('networking5HttpClient.java')).toBe(true)
  })
})

describe('isExampleRunLine', () => {
  it('recognizes corrupted ?? example lines', () => {
    expect(
      isExampleRunLine('?? `pkg10networking/networking1InetAddress.java` ? `networking5HttpClient.java`')
    ).toBe(true)
  })

  it('rejects corrupted ?? callout lines', () => {
    expect(isExampleRunLine('?? **Dynamic dispatch:** JVM calls')).toBe(false)
  })
})

describe('parseRunCommand', () => {
  it('strips java prefix', () => {
    expect(parseRunCommand('java pkg1core/core2Variables.java')).toBe('pkg1core/core2Variables.java')
  })
})

describe('normalizeExamplePath', () => {
  it('normalizes full java path', () => {
    expect(normalizeExamplePath('java pkg1core/core2Variables.java')).toBe(
      'pkg1core/core2Variables.java'
    )
  })

  it('normalizes bare core class to pkg1core', () => {
    expect(normalizeExamplePath('core26ConstructorsDemo')).toBe(
      'pkg1core/core26ConstructorsDemo.java'
    )
  })

  it('normalizes bare algorithms class with .java suffix', () => {
    expect(normalizeExamplePath('algorithms7DivideAndConquer.java')).toBe(
      'pkg4algorithms/algorithms7DivideAndConquer.java'
    )
  })

  it('normalizes intro class to pkg0intro', () => {
    expect(normalizeExamplePath('intro1AboutJava')).toBe('pkg0intro/intro1AboutJava.java')
  })
})

describe('splitExampleLine', () => {
  it('splits ▶️ line by middle dot and strips backticks', () => {
    const parts = splitExampleLine('▶️ `java pkg1core/core2Variables.java` · `java pkg1core/core3DataTypes.java`')
    expect(parts).toEqual([
      'java pkg1core/core2Variables.java',
      'java pkg1core/core3DataTypes.java',
    ])
  })
})

describe('toRunCommand', () => {
  it('builds run command from repo path', () => {
    expect(toRunCommand('pkg1core/core2Variables.java')).toBe('java pkg1core/core2Variables.java')
  })
})

describe('exampleLabel', () => {
  it('returns class name without extension', () => {
    expect(exampleLabel('pkg1core/core2Variables.java')).toBe('core2Variables')
  })
})

describe('extractExampleRefs', () => {
  it('extracts refs from ▶️ line', () => {
    const content = '▶️ `java pkg1core/core2Variables.java` · `java pkg1core/core3DataTypes.java`'
    const refs = extractExampleRefs(content)
    expect(refs).toContain('java pkg1core/core2Variables.java')
    expect(refs).toContain('java pkg1core/core3DataTypes.java')
  })
})

describe('expandExampleRefs', () => {
  const paths = [
    'pkg4algorithms/algorithms1SortingAlgorithms.java',
    'pkg4algorithms/algorithms2SearchingAlgorithms.java',
    'pkg4algorithms/algorithms7DivideAndConquer.java',
  ]

  it('expands range with arrow', () => {
    const ref = 'pkg4algorithms/algorithms1SortingAlgorithms.java → algorithms7DivideAndConquer.java'
    const expanded = expandExampleRefs([ref], paths)
    expect(expanded).toHaveLength(3)
  })
})
