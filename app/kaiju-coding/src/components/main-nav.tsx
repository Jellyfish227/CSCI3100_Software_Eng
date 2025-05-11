import { Link } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { user } = useAuth()
  
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link 
        to="/" 
        className="text-sm font-medium text-primary transition-colors hover:text-primary"
      >
        Browse Courses
      </Link>
      {user?.role === "educator" && (
        <Link 
          to="/educator/courses" 
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Manage Courses
        </Link>
      )}
      <Link 
        to="/assessment" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Assessment
      </Link>
    </nav>
  )
}