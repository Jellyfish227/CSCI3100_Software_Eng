import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface StudentProfileProps {
  name: string
  email: string
  grade: string
  avatarUrl?: string
  progress: number
  courses: {
    name: string
    progress: number
    status: "active" | "completed" | "upcoming"
  }[]
}

export function StudentProfile({
  name,
  email,
  grade,
  avatarUrl,
  progress,
  courses,
}: StudentProfileProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  Grade {grade}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Overall Progress</h3>
                <Progress value={progress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{progress}% Complete</p>
              </div>
              <Button className="w-full">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Track your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{course.name}</h4>
                    <Badge
                      variant={
                        course.status === "completed"
                          ? "default"
                          : course.status === "active"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{course.progress}% Complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 