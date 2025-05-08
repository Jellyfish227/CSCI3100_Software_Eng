import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Course } from "@/types/course"
import { useNavigate } from "react-router-dom"
interface CourseSearchProps {
  onSearch: (results: Course[]) => void
  allCourses: Course[]
}

export function CourseSearch({ onSearch, allCourses }: CourseSearchProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions] = useState(["react", "python", "web", "java", "sql"])

  // Search logic
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      onSearch(allCourses)
      return
    }

    const query = searchQuery.toLowerCase()
    const results = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.tags.some((tag) => tag.toLowerCase().includes(query)),
    )

    onSearch(results)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)

    const query = suggestion.toLowerCase()
    const results = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.tags.some((tag) => tag.toLowerCase().includes(query)),
    )

    onSearch(results)
  }

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-medium mb-2">What do you want to learn?</h2>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Find courses, skills, software, etc."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button className="bg-[#4aafbf] hover:bg-[#3d9aa9]" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Suggestion:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button key={suggestion} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
      <Button onClick={() => navigate("/course-overview")} variant="link" className="w-full text-white h-12 hover:no-underline hover:bg-[#3d9aa9] mt-4 bg-[#4aafbf]">
        View All Courses
      </Button>
    </div>
  )
}
