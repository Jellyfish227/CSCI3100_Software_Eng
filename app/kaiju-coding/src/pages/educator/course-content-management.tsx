import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiService } from "@/services/apiService"
import { Course } from "@/types/course"
import { CourseContent, CourseContentCreateData, CourseContentList } from "@/types/courseContent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Video, FileText, Award, PlusCircle, Trash2, Edit, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CourseContentManagement() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [courseContent, setCourseContent] = useState<CourseContentList | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("view")
  const [newTopic, setNewTopic] = useState<string>("")
  
  // Form state for adding new content
  const [formData, setFormData] = useState<CourseContentCreateData>({
    topic: "",
    title: "",
    type: "lesson",
    description: "",
    content: "",
    duration_minutes: 10,
    status: "draft"
  })
  
  // State for edit mode
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null)
  
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
        console.log("Fetched course content:", contentData)
        
        // Initialize content data structure if needed
        if (!contentData) {
          setCourseContent({
            courseId,
            topics: []
          })
        } else {
          setCourseContent(contentData)
        }
        
        // Extract unique topics
        if (contentData && contentData.topics) {
          const uniqueTopics = Array.from(new Set(contentData.topics.map(t => t.name)))
          setTopics(uniqueTopics)
        }
      } catch (err) {
        console.error("Error fetching course data:", err)
        setError("Failed to load course content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourseAndContent()
  }, [courseId])
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === "duration_minutes" ? parseInt(value) || 0 : value }))
  }
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === "topic") {
      if (value === "__new__") {
        // User selected to create a new topic
        // Don't update formData.topic yet, wait for input
        setNewTopic("") // Reset any previous new topic value
        setFormData(prev => ({ ...prev, topic: "__new__" })) // Set topic to __new__ to trigger new topic input
      } else {
        // Normal case, just set the selected topic
        setFormData(prev => ({ ...prev, [name]: value }))
        setNewTopic("") // Clear the new topic field
      }
    } else {
      // For other select fields (type, status), just set the value
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }
  
  // Handle new topic input change
  const handleNewTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewTopic(value)
    // We don't update formData.topic here anymore - we'll use newTopic directly when submitting
  }
  
  // Function to refresh content from the API
  const refreshContent = async () => {
    if (!courseId) return
    
    try {
      // Fetch course content
      const contentData = await apiService.getCourseContent(courseId)
      console.log("Refreshed course content:", contentData)
      
      // Initialize content data structure if needed
      if (!contentData) {
        setCourseContent({
          courseId,
          topics: []
        })
      } else {
        setCourseContent(contentData)
      }
      
      // Extract unique topics
      if (contentData && contentData.topics) {
        const uniqueTopics = Array.from(new Set(contentData.topics.map(t => t.name)))
        setTopics(uniqueTopics)
      }
    } catch (err) {
      console.error("Error refreshing course content:", err)
    }
  }
  
  // Handle form submission for adding new content
  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!courseId) return
    
    // Determine the actual topic to use (either selected topic or new topic)
    const topicToUse = formData.topic === "__new__" ? newTopic : formData.topic
    
    // Validate required fields
    if (!topicToUse || topicToUse === "__new__" || !formData.title || !formData.type) {
      toast({
        title: "Missing Required Fields",
        description: formData.topic === "__new__" && !newTopic 
          ? "Please enter a name for the new topic." 
          : "Topic, title, and type are all required fields.",
        variant: "destructive"
      })
      return
    }
    
    // Create a copy of form data with the correct topic
    const submissionData = {
      ...formData,
      topic: topicToUse
    }
    
    try {
      const result = await apiService.addCourseContent(courseId, submissionData)
      console.log("API response after adding content:", result)
      
      // Refresh content from the API instead of manually updating state
      await refreshContent()
      
      // Add to topics list if it's a new topic
      if (!topics.includes(topicToUse)) {
        setTopics(prev => [...prev, topicToUse])
      }
      
      // Reset form
      setNewTopic("")
      setFormData({
        topic: topicToUse, // Keep the same topic for consecutive additions
        title: "",
        type: "lesson",
        description: "",
        content: "",
        duration_minutes: 10,
        status: "draft"
      })
      
      // Show success message
      toast({
        title: "Content Added",
        description: "The content has been added to your course."
      })
      
      // Switch to view tab
      setActiveTab("view")
    } catch (err) {
      console.error("Error adding content:", err)
      toast({
        title: "Error",
        description: "Failed to add content. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle editing content
  const handleEditContent = (content: CourseContent) => {
    setEditingContent(content)
    setFormData({
      topic: content.topic,
      title: content.title,
      type: content.type,
      description: content.description,
      content: content.content,
      duration_minutes: content.duration_minutes,
      status: content.status
    })
    setActiveTab("edit")
  }
  
  // Handle updating content
  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingContent) return
    
    try {
      const result = await apiService.updateCourseContent(editingContent.id, {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        duration_minutes: formData.duration_minutes,
        status: formData.status
      })
      
      // Update the local state with the updated content
      setCourseContent(prev => {
        if (!prev) return null
        
        const updatedTopics = prev.topics.map(topic => {
          if (topic.name === result.topic) {
            return {
              ...topic,
              entries: topic.entries.map(entry => 
                entry.id === result.id ? result : entry
              )
            }
          }
          return topic
        })
        
        return { ...prev, topics: updatedTopics }
      })
      
      // Reset editing state
      setEditingContent(null)
      setFormData({
        topic: "",
        title: "",
        type: "lesson",
        description: "",
        content: "",
        duration_minutes: 10,
        status: "draft"
      })
      setNewTopic("")
      
      // Show success message
      toast({
        title: "Content Updated",
        description: "The content has been updated successfully."
      })
      
      // Switch to view tab
      setActiveTab("view")
    } catch (err) {
      console.error("Error updating content:", err)
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle deleting content
  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return
    
    try {
      await apiService.deleteCourseContent(contentId)
      
      // Update the local state
      setCourseContent(prev => {
        if (!prev) return null
        
        const updatedTopics = prev.topics.map(topic => ({
          ...topic,
          entries: topic.entries.filter(entry => entry.id !== contentId)
        })).filter(topic => topic.entries.length > 0) // Remove empty topics
        
        return { ...prev, topics: updatedTopics }
      })
      
      // Update topics list
      if (courseContent) {
        const updatedContent = {
          ...courseContent,
          topics: courseContent.topics.map(topic => ({
            ...topic,
            entries: topic.entries.filter(entry => entry.id !== contentId)
          })).filter(topic => topic.entries.length > 0)
        }
        
        const uniqueTopics = Array.from(new Set(updatedContent.topics.map(t => t.name)))
        setTopics(uniqueTopics)
      }
      
      // Show success message
      toast({
        title: "Content Deleted",
        description: "The content has been removed from your course."
      })
    } catch (err) {
      console.error("Error deleting content:", err)
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive"
      })
    }
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
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center"
        onClick={() => navigate(`/course/${courseId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Course Content</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>
            Manage your course content by adding new sections, lessons, quizzes, and more.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="view">View Content</TabsTrigger>
          <TabsTrigger value="add">Add Content</TabsTrigger>
          {editingContent && <TabsTrigger value="edit">Edit Content</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="view">
          <div style={{ display: "none" }} data-debug="true"></div>
          {(() => {
            console.log("Rendering view tab. Content:", courseContent);
            return null;
          })()}
          
          {(!courseContent?.topics || courseContent.topics.length === 0) ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">This course has no content yet.</p>
                  <Button onClick={() => setActiveTab("add")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {courseContent.topics.map((topic) => (
                <AccordionItem key={topic.name} value={topic.name}>
                  <AccordionTrigger className="px-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between w-full pr-4">
                      <h3>{topic.name}</h3>
                      <span className="text-muted-foreground">{topic.entries.length} items</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="space-y-4 pt-4">
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
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-muted-foreground">{content.duration_minutes} min</span>
                                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                  {content.status === "published" ? "Published" : "Draft"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditContent(content)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteContent(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <form onSubmit={handleAddContent}>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
                <CardDescription>
                  Create a new lesson, video, or quiz for your course.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={newTopic ? "__new__" : formData.topic}
                      onValueChange={(value) => handleSelectChange("topic", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or create a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">+ Create new topic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formData.topic === "__new__") && (
                    <div className="space-y-2">
                      <Label htmlFor="newTopic">New Topic Name</Label>
                      <Input
                        id="newTopic"
                        name="newTopic"
                        placeholder="Enter new topic name"
                        value={newTopic}
                        onChange={handleNewTopicChange}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Content title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this content"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder={
                      formData.type === "video" 
                        ? "Video URL or embed code" 
                        : "Markdown content"
                    }
                    value={formData.content}
                    onChange={handleInputChange}
                    className="min-h-[200px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Add Content</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          {editingContent && (
            <Card>
              <form onSubmit={handleUpdateContent}>
                <CardHeader>
                  <CardTitle>Edit Content</CardTitle>
                  <CardDescription>
                    Update your course content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Content title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of this content"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder={
                        formData.type === "video" 
                          ? "Video URL or embed code" 
                          : "Markdown content"
                      }
                      value={formData.content}
                      onChange={handleInputChange}
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        name="duration_minutes"
                        type="number"
                        min="1"
                        value={formData.duration_minutes}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingContent(null)
                      setActiveTab("view")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Content</Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 