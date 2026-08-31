/** Learn chapter doc paths grouped by roadmap phase. */
export const ROADMAP_PHASES = [
  {
    phase: 'Foundation',
    chapters: '01–09',
    paths: [
      'docs/02-learn/01-GettingStarted.md',
      'docs/02-learn/02-VariablesAndTypes.md',
      'docs/02-learn/03-OperatorsAndCasting.md',
      'docs/02-learn/04-ControlFlow.md',
      'docs/02-learn/05-Loops.md',
      'docs/02-learn/06-Methods.md',
      'docs/02-learn/07-Arrays.md',
      'docs/02-learn/08-Strings.md',
      'docs/02-learn/09-UserInput.md',
    ],
    path: '02-learn--01-GettingStarted',
    topics: 'Syntax, Types, Loops, Methods, Arrays, Strings',
  },
  {
    phase: 'Object-Oriented',
    chapters: '10–15',
    paths: [
      'docs/02-learn/10-ClassesAndObjects.md',
      'docs/02-learn/11-ConstructorsAndEncapsulation.md',
      'docs/02-learn/12-InheritanceAndPolymorphism.md',
      'docs/02-learn/13-AbstractionAndInterfaces.md',
      'docs/02-learn/14-StaticAndEnums.md',
      'docs/02-learn/15-RecordsAndSealed.md',
    ],
    path: '02-learn--10-ClassesAndObjects',
    topics: 'Classes, Inheritance, Interfaces, Records',
  },
  {
    phase: 'Core APIs',
    chapters: '16–21',
    paths: [
      'docs/02-learn/16-Exceptions.md',
      'docs/02-learn/17-Collections.md',
      'docs/02-learn/18-Generics.md',
      'docs/02-learn/19-LambdasAndFunctional.md',
      'docs/02-learn/20-StreamsAndOptional.md',
      'docs/02-learn/21-JavaVersions.md',
    ],
    path: '02-learn--16-Exceptions',
    topics: 'Exceptions, Collections, Generics, Streams',
  },
  {
    phase: 'Computer Science',
    chapters: '22–24',
    paths: [
      'docs/02-learn/22-DataStructures.md',
      'docs/02-learn/23-Algorithms.md',
      'docs/02-learn/24-LeetCode.md',
    ],
    path: '02-learn--22-DataStructures',
    topics: 'DSA, Algorithms, LeetCode',
  },
  {
    phase: 'Senior Topics',
    chapters: '25–27',
    paths: [
      'docs/02-learn/25-JVMAndMemory.md',
      'docs/02-learn/26-Concurrency.md',
      'docs/02-learn/27-DesignPatterns.md',
    ],
    path: '02-learn--25-JVMAndMemory',
    topics: 'JVM, Concurrency, Design Patterns',
  },
  {
    phase: 'Applied Java',
    chapters: '28–32',
    paths: [
      'docs/02-learn/28-IOAndNIO.md',
      'docs/02-learn/29-Networking.md',
      'docs/02-learn/30-JDBC.md',
      'docs/02-learn/31-RestAPIs.md',
      'docs/02-learn/32-StandardLibraries.md',
    ],
    path: '02-learn--28-IOAndNIO',
    topics: 'I/O, HTTP, JDBC, REST APIs',
  },
  {
    phase: 'Professional',
    chapters: '33–40',
    paths: [
      'docs/02-learn/33-Testing.md',
      'docs/02-learn/34-Modules.md',
      'docs/02-learn/35-Serialization.md',
      'docs/02-learn/36-PerformanceAndBuild.md',
      'docs/02-learn/37-InterviewPrep.md',
      'docs/02-learn/38-Metaprogramming.md',
      'docs/02-learn/39-ResiliencePatterns.md',
      'docs/02-learn/40-SpringBootIntro.md',
    ],
    path: '02-learn--33-Testing',
    topics: 'Testing, Modules, Performance, Metaprogramming, Spring',
  },
  {
    phase: 'Projects & Full-stack',
    chapters: '41 + labs',
    paths: [
      'docs/02-learn/41-RestAndFrontend.md',
    ],
    path: '02-learn--41-RestAndFrontend',
    topics: 'CORS, browser fetch, Spring API + HTML UI',
  },
] as const

export function isPhaseComplete(phaseIndex: number, completedPaths: string[]): boolean {
  const phase = ROADMAP_PHASES[phaseIndex]
  return phase.paths.every((p) => completedPaths.includes(p))
}

export const LEARN_CHAPTER_SLUGS = ROADMAP_PHASES.flatMap((phase) =>
  phase.paths.map((p) => p.replace('docs/02-learn/', '02-learn--').replace('.md', ''))
)

export const LEARN_CHAPTER_PATHS = ROADMAP_PHASES.flatMap((phase) => [...phase.paths])

export function getNextLearnChapter(completedPaths: string[]): {
  slug: string
  path: string
  index: number
} | null {
  for (let i = 0; i < LEARN_CHAPTER_PATHS.length; i++) {
    if (!completedPaths.includes(LEARN_CHAPTER_PATHS[i])) {
      return {
        slug: LEARN_CHAPTER_SLUGS[i],
        path: LEARN_CHAPTER_PATHS[i],
        index: i + 1,
      }
    }
  }
  return null
}

export function getLearnChapterNumber(docPath: string): number | null {
  const idx = (LEARN_CHAPTER_PATHS as readonly string[]).indexOf(docPath)
  return idx >= 0 ? idx + 1 : null
}
