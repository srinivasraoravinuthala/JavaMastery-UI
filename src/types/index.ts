export interface DocNode {
  id: string
  title: string
  path: string
  slug: string
  type: 'file' | 'directory'
  section?: string
  sectionTitle?: string
  tags?: string[]
  children?: DocNode[]
  order?: number
}

export interface DocContent {
  path: string
  slug: string
  title: string
  content: string
  section?: string
  sectionTitle?: string
  tags?: string[]
  headings: HeadingItem[]
  readingTimeMinutes: number
  isInterview?: boolean
}

export interface HeadingItem {
  id: string
  text: string
  level: number
}

export interface SearchResult {
  path: string
  slug: string
  title: string
  section?: string
  excerpt: string
  score: number
  headings?: string[]
  kind?: 'doc' | 'example'
  package?: string
  runCommand?: string
}

export interface Bookmark {
  path: string
  slug: string
  title: string
  section?: string
  addedAt: number
  questionId?: string
  type?: 'page' | 'question'
}

export interface Favorite extends Bookmark {
  type: 'page' | 'question'
  questionId?: string
}

export interface RecentPage {
  path: string
  slug: string
  title: string
  section?: string
  visitedAt: number
  progress?: number
}

export interface TopicProgress {
  sectionId: string
  completed: string[]
  total: number
  percentage: number
}

export interface InterviewQuestion {
  id: string
  question: string
  answer: string
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  interviewMode: boolean
  showAnswersOnly: boolean
}

export interface ContentProvider {
  getTree(): Promise<DocNode[]>
  getContent(path: string): Promise<DocContent>
  getAllContents(): Promise<DocContent[]>
}

export interface GitHubTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}
