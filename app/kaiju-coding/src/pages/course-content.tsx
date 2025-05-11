import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/services/apiService"
import { Course } from "@/types/course"
import { CourseContentList } from "@/types/courseContent"
import { useAuth } from "../lib/auth"

export default function CourseContent() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [courseContent, setCourseContent] = useState<CourseContentList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!courseId) return

    const fetchCourseAndContent = async () => {
      try {
        setLoading(true)
        // Fetch course details
        const courseData = await apiService.getCourse(courseId)
        setCourse(courseData)
        
        // Fetch course content
        const contentData = await apiService.getCourseContent(courseId)
        setCourseContent(contentData)
        
        // Calculate progress (in a real app, this would come from user's progress data)
        calculateProgress(contentData)
      } catch (err) {
        console.error("Error fetching course data:", err)
        setError("Failed to load course content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseAndContent()
  }, [courseId])

  // Calculate progress based on content (simplified version)
  const calculateProgress = (content: CourseContentList) => {
    if (!content || !content.topics) return
    
    let totalItems = 0
    let completedItems = 0
    
    content.topics.forEach(topic => {
      topic.entries.forEach(entry => {
        totalItems++
        // This would be based on user progress data in a real app
        if (entry.status === "published") {
          // For now, we're just simulating progress with random data
          // In a real app, you would check if the user has completed this content
          if (Math.random() > 0.6) completedItems++
        }
      })
    })
    
    const calculatedProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    setProgress(calculatedProgress)
  }
  
  // Map content type to icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "tutorial":
      case "lesson":
        return <FileText className="h-5 w-5" />
      case "quiz":
        return <Award className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading course content...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error || !course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">{error || "Course not found"}</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Instructor: {course.educator.name}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{progress}% Complete</p>
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
              {courseContent?.topics.map((topic) => (
                <Card key={topic.name}>
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topic.entries.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            {getContentTypeIcon(content.type)}
                            <div>
                              <h3 className="font-medium">{content.title}</h3>
                              <p className="text-sm text-muted-foreground">{content.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">{content.duration_minutes} min</span>
                            <Button variant="default">
                              Start
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Show message if no content */}
              {(!courseContent?.topics || courseContent.topics.length === 0) && (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">No content available for this course yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Discussion forum coming soon.</p>
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
          
          {/* Show Edit Content button for educators */}
          {user && course && user.id === course.educator.id && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/educator/course/${courseId}/content`)}
                  >
                    Manage Course Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 