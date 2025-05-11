import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/services/apiService"

// Simple custom toggle component
const Toggle = ({ 
  checked, 
  onCheckedChange, 
  id 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  id: string 
}) => {
  return (
    <div 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
      />
      <input 
        type="checkbox" 
        id={id}
        checked={checked} 
        onChange={() => {}} 
        className="sr-only" 
      />
    </div>
  )
}

interface CourseFormProps {
  initialData?: {
    title: string
    description: string
    category: string
    difficulty: string
    price: number
    tags?: string[]
    thumbnail?: string
    is_published?: boolean
    duration_hours?: number
  }
  mode: "create" | "edit"
  courseId?: string
}

export default function CourseForm({ initialData, mode, courseId }: CourseFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      category: "",
      difficulty: "",
      price: 0,
      tags: [],
      thumbnail: "",
      is_published: false,
      duration_hours: 1,
    }
  )
  
  // State for tag input
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(tag => tag !== tagToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (mode === "create") {
        const course = await apiService.createCourse({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          price: formData.price,
          tags: formData.tags,
          thumbnail: formData.thumbnail,
          is_published: formData.is_published,
          duration_hours: formData.duration_hours
        })
        alert("Course created successfully!")
        navigate(`/courses/${course.id}`)
      } else if (mode === "edit" && courseId) {
        await apiService.updateCourse(courseId, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          price: formData.price,
          tags: formData.tags,
          thumbnail: formData.thumbnail,
          is_published: formData.is_published,
          duration_hours: formData.duration_hours
        })
        alert("Course updated successfully!")
        navigate(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Failed to save course. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "create" ? "Create New Course" : "Edit Course"}</CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Fill in the details to create your new course"
                : "Update your course information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter course description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Enter thumbnail URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <span>{tag}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="Enter course price"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                    placeholder="Enter course duration"
                    required
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Toggle
                  checked={!!formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  id="published"
                />
                <Label htmlFor="published">Publish course immediately</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate("/courses")} type="button" disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : mode === "create" ? "Create Course" : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 