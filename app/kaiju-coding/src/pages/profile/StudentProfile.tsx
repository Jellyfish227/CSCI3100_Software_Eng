import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Book, BookOpen, GraduationCap, UserCircle } from "lucide-react"

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
    <div className="container mx-auto py-8 mt-16">
      <div className="flex items-center gap-2 mb-6">
        <UserCircle className="h-6 w-6 text-[#4aafbf]" />
        <h1 className="text-2xl font-bold">Student Profile</h1>
      </div>
      <hr className="mb-6" />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="shadow-lg border-t-4 border-t-[#4aafbf]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-[#4aafbf] shadow-md">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-[#4aafbf] text-white text-xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{name}</CardTitle>
                <CardDescription className="text-base mt-1">{email}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-[#f0f9fa] text-[#4aafbf]">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Grade {grade}
                  </Badge>
                  <Badge variant="outline">Student</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-[#f0f9fa] p-4 rounded-lg">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#4aafbf]" />
                  Overall Learning Progress
                </h3>
                <Progress value={progress} className="mt-3 h-3 bg-[#e0eef0]" />
                <p className="text-sm text-muted-foreground mt-2 font-medium">{progress}% Complete</p>
              </div>
              <div className="flex gap-3">
                <Button className="w-full bg-[#4aafbf] hover:bg-[#3d9aa9]">Edit Profile</Button>
                <Button variant="outline" className="w-full border-[#4aafbf] text-[#4aafbf] hover:bg-[#f0f9fa]">Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card className="shadow-lg border-t-4 border-t-[#4aafbf]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-[#4aafbf]" />
              <CardTitle>My Courses</CardTitle>
            </div>
            <CardDescription>Track your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courses.map((course, index) => (
                <div key={index} className="p-4 rounded-lg hover:bg-[#f0f9fa] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{course.name}</h4>
                    <Badge
                      className={
                        course.status === "completed"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : course.status === "active"
                          ? "bg-[#f0f9fa] text-[#4aafbf] hover:bg-[#e0eef0]"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={course.progress} 
                    className={`h-2 ${course.status === "completed" ? "bg-green-100" : "bg-[#e0eef0]"}`}
                  />
                  <p className="text-sm text-muted-foreground mt-2">{course.progress}% Complete</p>
                  {index < courses.length - 1 && <hr className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 