import type React from "react"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <a href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
        Dashboard
      </a>
      <a href="/courses" className="text-sm font-medium text-primary transition-colors hover:text-primary">
        Courses
      </a>
      <a href="/assessment" className="text-sm font-medium transition-colors hover:text-primary">
        Assessment
      </a>
      <a href="/community" className="text-sm font-medium transition-colors hover:text-primary">
        Community
      </a>
    </nav>
  )
}
