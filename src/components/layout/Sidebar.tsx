import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, ChevronDown, FileText, Play, Bookmark } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TOPIC_SECTIONS } from '@/config/site'
import type { DocNode } from '@/types'
import { cn } from '@/utils/cn'

interface SidebarProps {
  tree: DocNode[]
  open: boolean
  onClose: () => void
}

export function Sidebar({ tree, open, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-72 border-r border-border bg-sidebar transition-transform duration-300 lg:sticky lg:translate-x-0 lg:shrink-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-1" aria-label="Documentation navigation">
            <Link
              to="/"
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === '/'
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent'
              )}
            >
              Home
            </Link>

            <Link
              to="/examples"
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname.startsWith('/examples')
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent'
              )}
            >
              <Play className="h-4 w-4 shrink-0" />
              Examples
            </Link>

            <Link
              to="/bookmarks"
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === '/bookmarks'
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent'
              )}
            >
              <Bookmark className="h-4 w-4 shrink-0" />
              Bookmarks
            </Link>

            {tree.map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                currentPath={location.pathname}
                onNavigate={onClose}
              />
            ))}

            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Interview Topics
              </p>
              {TOPIC_SECTIONS.find((s) => s.id === 'interview')?.topics?.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/docs/03-interview--${topic.file.replace('.md', '')}`}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    location.pathname.includes(topic.file.replace('.md', ''))
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-accent'
                  )}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <span className="truncate">{topic.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}

function SidebarSection({
  section,
  currentPath,
  onNavigate,
}: {
  section: DocNode
  currentPath: string
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(true)
  const isActive = section.children?.some((c) => currentPath.includes(c.slug))

  if (!section.children?.length) return null

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
          isActive && 'text-primary'
        )}
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <span>{section.title}</span>
        <span className="ml-auto text-xs text-muted-foreground">{section.children.length}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-0.5 mt-0.5">
        {section.children.map((child) => (
          <Link
            key={child.id}
            to={`/docs/${child.slug}`}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              currentPath === `/docs/${child.slug}`
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-sidebar-foreground hover:bg-accent'
            )}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="truncate">{child.title}</span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
