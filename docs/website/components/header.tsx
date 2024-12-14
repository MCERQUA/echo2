import Link from "next/link"
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Docs</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/welcome" className="transition-colors hover:text-foreground/80">Welcome</Link>
            <Link href="/guides" className="transition-colors hover:text-foreground/80">User Guides</Link>
            <Link href="/api" className="transition-colors hover:text-foreground/80">API Reference</Link>
            <Link href="/library" className="transition-colors hover:text-foreground/80">Library</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center space-x-2">
          <div className="flex h-9 w-full items-center space-x-2 md:w-2/3 lg:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="w-full pl-8"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ⌘K
              </kbd>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button>Go to Console</Button>
        </div>
      </div>
    </header>
  )
}

