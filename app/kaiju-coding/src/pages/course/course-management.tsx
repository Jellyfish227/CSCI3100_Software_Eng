import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye, Upload } from "lucide-react"
import { useAuth } from "@/lib/auth"
import type { CourseData } from "@/data/course-data"

export default function CourseManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("published")
  const isEducator = user?.role === "educator"

  // Mock data - replace with actual API calls
  const courses = [
    {
      id: "1",
      title: "Introduction to Python Programming",
      description: "Learn the basics of Python programming language",
      status: "published",
      students: 50,
      lastUpdated: "2024-03-15",
    },
    {
      id: "2",
      title: "Advanced JavaScript",
      description: "Master advanced JavaScript concepts",
      status: "draft",
      students: 0,
      lastUpdated: "2024-03-10",
    },
  ]

  const handleCreateCourse = () => {
    navigate("/courses/new")
  }

  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`)
  }

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  const handleDeleteCourse = async (courseId: string) => {
    // TODO: Implement course deletion
    console.log("Delete course:", courseId)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isEducator ? "Course Management" : "My Courses"}
        </h1>
        {isEducator && (
          <Button onClick={handleCreateCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        )}
      </div>
      

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published</TabsTrigger>
          {isEducator && (
            <>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {courses
            .filter((course) => course.status === activeTab)
            .map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCourse(course.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {isEducator && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEditCourse(course.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/courses/${course.id}/assessment/new`)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add Assessment
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Status:</span> {course.status}
                    </div>
                    <div>
                      <span className="font-medium">Students:</span> {course.students}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {course.lastUpdated}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
} 