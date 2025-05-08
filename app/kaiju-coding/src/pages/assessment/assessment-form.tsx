import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface AssessmentFormProps {
  mode: "create" | "edit"
}

export default function AssessmentForm({ mode }: AssessmentFormProps) {
  const { courseId, assessmentId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    file: null as File | null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement file upload and assessment creation/update
      console.log("Form data:", formData)
      // Navigate back to course management after successful submission
      navigate(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create New Assessment" : "Edit Assessment"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Upload an assessment file and set its details"
              : "Update assessment details and file"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assessment title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter assessment description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Assessment File</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required={mode === "create"}
                />
                {formData.file && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {formData.file.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create Assessment" : "Update Assessment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 