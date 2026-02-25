"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, FileText, Target, GitBranch, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfilePane } from "./profile-pane";

const NAV = [
  { href: "/discovery", label: "Discovery", icon: Search },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/graph", label: "Graph", icon: GitBranch },
  { href: "/prds", label: "PRDs", icon: FileText },
  { href: "/objectives", label: "Objectives", icon: Target },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/roadmap" className="text-lg font-semibold tracking-tight">
          Foundry AI
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <ProfilePane />
    </aside>
  );
}
