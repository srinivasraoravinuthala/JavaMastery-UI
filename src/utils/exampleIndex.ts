/** Package → learning level labels (keep in sync with scripts/lib/exampleUtils.js). */
export const PACKAGE_LEVELS: Record<string, string> = {
  pkg0intro: 'Orientation',
  pkg1core: 'Beginner',
  pkg2versions: 'Intermediate',
  pkg3datastructures: 'Computer Science',
  pkg4algorithms: 'Computer Science',
  pkg5leetcode: 'Computer Science',
  pkg6jvm: 'Senior',
  pkg7concurrency: 'Senior',
  pkg8patterns: 'Tech Lead',
  pkg9io: 'Applied Java',
  pkg10networking: 'Applied Java',
  pkg11jdbc: 'Applied Java',
  pkg12restapi: 'Applied Java',
  pkg13libs: 'Applied Java',
  pkg14testing: 'Ecosystem',
  pkg15modules: 'Ecosystem',
  pkg16advconcurrency: 'Senior',
  pkg17metaprogramming: 'Ecosystem',
  pkg18resiliencepatterns: 'Ecosystem',
  pkg19performance: 'Ecosystem',
  pkg20serialization: 'Ecosystem',
  pkg21spring: 'Ecosystem',
}

export function isExampleJavaPath(path: string): boolean {
  return /^pkg[\w]/.test(path) && path.endsWith('.java') && !path.includes('/src/test/')
}

export function exampleClassName(repoPath: string): string {
  return (repoPath.split('/').pop() || repoPath).replace(/\.java$/, '')
}

export function examplePackage(repoPath: string): string {
  const parts = repoPath.split('/')
  return parts[0] || ''
}

export function exampleRunCommand(repoPath: string): string {
  const path = repoPath.endsWith('.java') ? repoPath : `${repoPath}.java`
  return `java ${path.replace(/\.java$/, '')}.java`.replace(/\.java\.java$/, '.java')
}
