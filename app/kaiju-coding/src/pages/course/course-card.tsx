import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { CourseData } from "@/data/course-data"

interface CourseCardProps {
  course: CourseData
}

export function CourseCard({ course }: CourseCardProps) {
  const { id, title, image, rating, reviews, duration, students, price, instructor } = course

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <img src={image || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-2">{title}</h3>
        {instructor && <p className="text-sm text-muted-foreground mb-2">{instructor}</p>}
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
            {duration}
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
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="font-bold">
          ${price} <span className="text-xs text-muted-foreground font-normal">/year</span>
        </div>
        <Button className="bg-[#1e2a4a] hover:bg-[#141d33]">Join</Button>
      </CardFooter>
    </Card>
  )
}
