import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocsSidebarNavProps {
  items: {
    title: string
    href: string
    items?: {
      title: string
      href: string
    }[]
  }[]
}

export function Sidebar() {
  const items = [
    {
      title: "Getting Started",
      href: "/getting-started",
      items: [
        {
          title: "Introduction",
          href: "/getting-started/introduction",
        },
        {
          title: "Installation",
          href: "/getting-started/installation",
        },
      ],
    },
    {
      title: "Using the API",
      href: "/api",
      items: [
        {
          title: "Authentication",
          href: "/api/authentication",
        },
        {
          title: "Endpoints",
          href: "/api/endpoints",
        },
      ],
    },
  ]

  return (
    <div className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
      <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
        <div className="w-full">
          {items.map((item) => (
            <div key={item.href} className="pb-4">
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">
                {item.title}
              </h4>
              {item.items?.length && (
                <DocsSidebarNavItems items={item.items} />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function DocsSidebarNavItems({ items }: { items: { title: string; href: string }[] }) {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline",
            "hover:bg-muted"
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  )
}

