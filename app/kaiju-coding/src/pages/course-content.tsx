import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, MessageSquare, Award } from "lucide-react"

interface CourseModule {
  id: string
  title: string
  description: string
  type: "video" | "reading" | "quiz"
  duration: string
  completed: boolean
}

interface CourseSection {
  id: string
  title: string
  modules: CourseModule[]
}

// Mock data - replace with actual data from your backend
const mockCourseData = {
  id: "intro-python",
  title: "Introduction to Python Programming",
  instructor: "Dr. Sarah Chen",
  description: "Learn the fundamentals of Python programming language, from basic syntax to advanced concepts.",
  progress: 35,
  sections: [
    {
      id: "section-1",
      title: "Getting Started with Python",
      modules: [
        {
          id: "module-1",
          title: "Introduction to Python",
          description: "Overview of Python and its applications",
          type: "video",
          duration: "15 min",
          completed: true
        },
        {
          id: "module-2",
          title: "Setting up your Python Environment",
          description: "Install Python and set up your development environment",
          type: "reading",
          duration: "20 min",
          completed: true
        },
        {
          id: "module-3",
          title: "Basic Syntax Quiz",
          description: "Test your understanding of Python basics",
          type: "quiz",
          duration: "10 min",
          completed: false
        }
      ]
    },
    {
      id: "section-2",
      title: "Python Fundamentals",
      modules: [
        {
          id: "module-4",
          title: "Variables and Data Types",
          description: "Learn about Python's basic data types and variables",
          type: "video",
          duration: "25 min",
          completed: false
        },
        {
          id: "module-5",
          title: "Control Flow",
          description: "Understanding if statements and loops",
          type: "reading",
          duration: "30 min",
          completed: false
        }
      ]
    }
  ]
}

export default function CourseContent() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  // In a real application, you would fetch the course data based on courseId
  const courseData = mockCourseData

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{courseData.title}</h1>
            <p className="text-muted-foreground">Instructor: {courseData.instructor}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={courseData.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{courseData.progress}% Complete</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {courseData.sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.modules.map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            {module.type === "video" && <Video className="h-5 w-5" />}
                            {module.type === "reading" && <FileText className="h-5 w-5" />}
                            {module.type === "quiz" && <Award className="h-5 w-5" />}
                            <div>
                              <h3 className="font-medium">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">{module.duration}</span>
                            <Button variant={module.completed ? "outline" : "default"}>
                              {module.completed ? "Review" : "Start"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{courseData.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Course Materials
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/assessment')}  >
                  <FileText className="mr-2 h-4 w-4" />
                  Assignments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 