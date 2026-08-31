import { Link } from 'react-router-dom'
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Bookmark,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { SITE_CONFIG } from '@/config/site'

interface HeaderProps {
  onMenuToggle: () => void
  onSearchOpen: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuToggle, onSearchOpen, sidebarOpen }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
            JM
          </span>
          <span className="hidden sm:inline">{SITE_CONFIG.name}</span>
        </Link>

        <button
          onClick={onSearchOpen}
          className="flex flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors mx-auto"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search documentation...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
            Ctrl K
          </kbd>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/examples">
              <Play className="h-4 w-4" />
              Examples
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link to="/examples" aria-label="Examples">
              <Play className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/bookmarks" aria-label="Bookmarks">
              <Bookmark className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={SITE_CONFIG.github.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-1.005-.54-1.695-.185-2.1.105-.645.405-.54 1.23.105 1.875.405.405.855 1.05 1.155 1.62.315.615.945 1.005 1.74 1.185 1.26.285 2.46.12 3.375-.435.105-.81.405-1.365.735-1.68-2.565-.285-5.25-1.275-5.25-5.7 0-1.26.45-2.295 1.2-3.105-.12-.285-.54-1.395.12-2.91 0 0 .975-.315 3.2 1.185.93-.255 1.92-.39 2.91-.39.99 0 1.98.135 2.91.39 2.22-1.515 3.195-1.185 3.195-1.185.66 1.515.24 2.625.12 2.91.75.81 1.2 1.845 1.2 3.105 0 4.44-2.7 5.415-5.265 5.685.42.36.795 1.065.795 2.145 0 1.545-.015 2.79-.015 3.165 0 .315.225.69.84.57A8.995 8.995 0 0012 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
              </svg>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
