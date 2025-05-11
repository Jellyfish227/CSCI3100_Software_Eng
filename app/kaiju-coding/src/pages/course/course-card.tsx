import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { Course } from "@/types/course"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate()
  const { id, title, thumbnail, duration_hours, students, category, educator, rating, reviews, price } = course

  const handleJoinCourse = () => {
    navigate(`/course/${id}`)
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative w-full" style={{ height: "160px", overflow: "hidden" }}>
        <img 
          src={thumbnail || "/placeholder.svg"} 
          alt={title} 
          className="object-cover w-full h-full" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-base mb-2 line-clamp-2 h-12">{title}</h3>
        {educator && <p className="text-sm text-muted-foreground mb-2 truncate">{educator.name}</p>}
        <div className="flex items-center mb-2">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          <span className="text-sm text-muted-foreground ml-1">({reviews})</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration_hours}
          </div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {students}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0 mt-auto">
        <div className="font-bold">
          ${price} <span className="text-xs text-muted-foreground font-normal">/year</span>
        </div>
        <Button 
          className="bg-[#1e2a4a] hover:bg-[#141d33]"
          onClick={handleJoinCourse}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  )
}
