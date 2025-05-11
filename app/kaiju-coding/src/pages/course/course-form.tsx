import { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/services/apiService"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"

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

export default function CourseForm({ initialData, mode: propMode, courseId: propsCourseId }: CourseFormProps) {
  const params = useParams<{ id?: string; courseId?: string }>();
  // Get ID from props or route params (checking both possible param names)
  const courseId = propsCourseId || params.id || params.courseId;
  
  console.log("CourseForm - Route params:", params);
  console.log("CourseForm - Course ID:", courseId);
  
  // Determine mode based on props or URL path
  const pathname = window.location.pathname;
  const mode = propMode || (pathname.includes('/edit/') ? "edit" : "create");
  
  console.log("CourseForm - Mode:", mode);
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingCourse, setIsFetchingCourse] = useState(mode === "edit" && !!courseId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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
  );
  
  // State for tag input
  const [tagInput, setTagInput] = useState("");

  // Fetch course data when in edit mode
  useEffect(() => {
    const fetchCourseData = async () => {
      console.log("fetchCourseData - Starting with mode:", mode, "courseId:", courseId);
      
      if (mode === "edit" && courseId) {
        try {
          setIsFetchingCourse(true);
          console.log("fetchCourseData - Fetching course data for ID:", courseId);
          
          const course = await apiService.getCourse(courseId);
          console.log("fetchCourseData - Received course data:", course);
          
          setFormData({
            title: course.title || "",
            description: course.description || "",
            category: course.category || "",
            difficulty: course.difficulty || "",
            price: course.price || 0,
            tags: course.tags || [],
            thumbnail: course.thumbnail || "",
            is_published: course.is_published || false,
            duration_hours: course.duration_hours || 1,
          });
        } catch (error) {
          console.error("Error fetching course data:", error);
          alert("Failed to fetch course data. Please try again.");
          navigate("/courses");
        } finally {
          setIsFetchingCourse(false);
        }
      } else {
        console.log("fetchCourseData - Not in edit mode or no courseId, skipping fetch");
      }
    };

    fetchCourseData();
  }, [mode, courseId, navigate]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0])
    }
  }

  const handleUploadThumbnail = async () => {
    if (!thumbnailFile) return

    try {
      setIsUploading(true)
      
      // For new courses without IDs, we'll need a valid related_id
      // Check if this is a new course (no courseId) or existing course
      let relatedId = courseId;
      
      if (!relatedId) {
        // For new courses, we need to create a temporary ID or use a placeholder
        // that the backend will accept until the actual course is created
        relatedId = `temp_course_${Date.now()}`; // Use timestamp for uniqueness
        
        // Alternatively, if the backend requires a valid ID in a specific format:
        // Show a message to create the course first
        alert('Please save the course first before uploading a thumbnail');
        setIsUploading(false);
        return;
      }
      
      // Upload the file with required relatedId
      const uploadedFile = await apiService.uploadFile(
        thumbnailFile,
        'thumbnail',
        relatedId,
        `Thumbnail for ${formData.title}`
      )
      
      // Update the form with the thumbnail URL
      setFormData({
        ...formData,
        thumbnail: uploadedFile.url
      })
      
      // Clear the file input
      setThumbnailFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Failed to upload thumbnail. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveThumbnail = () => {
    setFormData({
      ...formData,
      thumbnail: ''
    })
    setThumbnailFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if a thumbnail file is selected but not uploaded
    if (thumbnailFile) {
      const confirmUpload = window.confirm('You have a thumbnail selected but not uploaded. Do you want to upload it before saving the course?')
      if (confirmUpload) {
        // If user confirms, upload the thumbnail first
        try {
          await handleUploadThumbnail()
        } catch (error) {
          console.error('Error uploading thumbnail before submit:', error)
          const proceedAnyway = window.confirm('Failed to upload thumbnail. Do you want to continue saving the course without it?')
          if (!proceedAnyway) {
            return // Stop the submission if user doesn't want to proceed
          }
        }
      }
    }
    
    setIsLoading(true)
    
    try {
      if (mode === "create") {
        console.log("Creating new course with data:", formData);
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
        
        // If there's a thumbnail and this is a new course, we need to update the thumbnail 
        // with the correct course ID
        if (thumbnailFile && course.id) {
          try {
            const uploadedFile = await apiService.uploadFile(
              thumbnailFile,
              'thumbnail',
              course.id,
              `Thumbnail for ${course.title}`
            )
            
            // Update the course with the new thumbnail URL
            await apiService.updateCourse(course.id, {
              thumbnail: uploadedFile.url
            })
          } catch (uploadError) {
            console.error('Error uploading thumbnail after course creation:', uploadError)
            // Continue anyway since the course was created
          }
        }
        
        alert("Course created successfully!")
        navigate(`/courses/${course.id}`)
      } else if (mode === "edit" && courseId) {
        console.log("Updating course with ID:", courseId, "Data:", formData);
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
      } else {
        console.error("Invalid mode or missing courseId for edit operation");
        alert("Error: Could not determine if creating or editing course.")
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
            {isFetchingCourse ? (
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center">
                  <Loader2 size={40} className="animate-spin text-primary" />
                  <p className="mt-4 text-slate-600">Loading course data...</p>
                </div>
              </div>
            ) : (
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
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <div className="mt-1 flex items-center gap-4">
                    {formData.thumbnail ? (
                      <div className="relative">
                        <img 
                          src={formData.thumbnail}
                          alt="Course thumbnail"
                          className="h-32 w-48 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                          onClick={handleRemoveThumbnail}
                        >
                          <X size={16} className="text-slate-700" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-48 flex flex-col items-center justify-center border border-dashed rounded-md bg-slate-50">
                        <ImageIcon size={24} className="text-slate-400" />
                        <span className="text-sm text-slate-500 mt-1">No thumbnail</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id="thumbnail"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Upload size={16} className="mr-2" />
                          Select Image
                        </Button>
                        {thumbnailFile && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUploadThumbnail}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Upload'
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {thumbnailFile ? `Selected: ${thumbnailFile.name}` : 'Recommended size: 1280x720px'}
                      </div>
                    </div>
                  </div>
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
                  <Button variant="outline" onClick={() => navigate("/courses")} type="button" disabled={isLoading || isUploading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isUploading || isFetchingCourse}>
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        {mode === "create" ? "Creating..." : "Saving..."}
                      </>
                    ) : (
                      mode === "create" ? "Create Course" : "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 