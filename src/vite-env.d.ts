/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_MODE: 'github' | 'local'
  readonly VITE_CF_ANALYTICS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css' {
  const content: string
  export default content
}
