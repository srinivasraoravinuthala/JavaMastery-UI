export interface ExampleIndexEntry {
  path: string
  package: string
  className: string
  title: string
  explanation: string
  runCommand: string
  level: string
  learnChapter?: string
  prerequisites?: string
  expectedOutput?: string
}

export interface ExampleContent extends ExampleIndexEntry {
  source: string
}

export type ExamplesIndex = Record<string, ExampleIndexEntry>
