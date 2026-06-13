export const SITE_CONFIG = {
  name: 'JavaMastery',
  title: 'JavaMastery — Learn Java from Basics to Senior Level',
  description:
    'Learn Java from basics to senior level. Tutorials, 1000+ interview questions, and reference guides — all in one place.',
  url: 'https://javamastery.srinivasrao.co.in',
  github: {
    owner: 'srinivasraoravinuthala',
    repo: 'JavaMastery',
    branch: 'main',
    url: 'https://github.com/srinivasraoravinuthala/JavaMastery',
  },
  stats: {
    interviewQuestions: '1000+',
    javaExamples: '500+',
    majorTopics: 18,
    learnChapters: 37,
  },
} as const

export type ContentMode = 'github' | 'local'

export const CONTENT_MODE: ContentMode =
  (import.meta.env.VITE_CONTENT_MODE as ContentMode) || 'github'

export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${SITE_CONFIG.github.owner}/${SITE_CONFIG.github.repo}/${SITE_CONFIG.github.branch}`

export const GITHUB_API_BASE = `https://api.github.com/repos/${SITE_CONFIG.github.owner}/${SITE_CONFIG.github.repo}`

export const LOCAL_DOCS_BASE = '/docs'

export const TOPIC_SECTIONS = [
  {
    id: 'orientation',
    title: 'Orientation',
    path: '01-orientation',
    icon: 'Compass',
    description: 'Getting started with Java and this project',
  },
  {
    id: 'learn',
    title: 'Learn',
    path: '02-learn',
    icon: 'GraduationCap',
    description: '37 tutorial chapters from basics to advanced',
  },
  {
    id: 'interview',
    title: 'Interview Q&A',
    path: '03-interview',
    icon: 'MessageSquare',
    description: '1500+ senior-depth interview questions',
    topics: [
      { id: 'core-java', title: 'Core Java', file: '01-CoreJava.md' },
      { id: 'oop-solid', title: 'OOP & SOLID', file: '02-OopAndSolid.md' },
      { id: 'collections', title: 'Collections', file: '03-Collections.md' },
      { id: 'concurrency', title: 'Concurrency', file: '04-Concurrency.md' },
      { id: 'jvm', title: 'JVM', file: '05-JVM.md' },
      { id: 'streams', title: 'Streams', file: '06-Streams.md' },
      { id: 'exceptions', title: 'Exceptions', file: '07-Exceptions.md' },
      { id: 'generics', title: 'Generics', file: '08-Generics.md' },
      { id: 'strings', title: 'Strings', file: '09-StringsAndPerformance.md' },
      { id: 'java-versions', title: 'Java Versions', file: '10-Java9To21Features.md' },
      { id: 'io-nio', title: 'I/O & NIO', file: '11-IOAndSerialization.md' },
      { id: 'reflection', title: 'Reflection', file: '12-ReflectionAndAnnotations.md' },
      { id: 'design-patterns', title: 'Design Patterns', file: '13-DesignPatterns.md' },
      { id: 'effective-java', title: 'Effective Java', file: '14-EffectiveJava.md' },
      { id: 'spring-boot', title: 'Spring Boot', file: '15-SpringBoot.md' },
      { id: 'jpa-hibernate', title: 'JPA & Hibernate', file: '16-JdbcJpaHibernate.md' },
      { id: 'interview-puzzles', title: 'Interview Puzzles', file: '17-PrintPuzzles.md' },
      { id: 'system-design', title: 'System Design', file: '18-SystemDesign.md' },
    ],
  },
  {
    id: 'reference',
    title: 'Reference',
    path: '04-reference',
    icon: 'BookOpen',
    description: 'Deep-dive topic guides',
  },
  {
    id: 'quick-ref',
    title: 'Quick Reference',
    path: '05-quick-ref',
    icon: 'Zap',
    description: 'Cheatsheets and one-page revision',
  },
  {
    id: 'career',
    title: 'Career',
    path: '06-career',
    icon: 'TrendingUp',
    description: 'Roadmap and interview strategy',
  },
] as const
