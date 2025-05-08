import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, GripVertical, Trash2, Upload, Video, FileText, Code } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Section {
  id: string
  title: string
  description: string
  order_index: number
  materials: Material[]
}

interface Material {
  id: string
  title: string
  description: string
  type: "video" | "reading" | "quiz" | "code"
  content_url?: string
  duration_minutes: number
  order_index: number
}

export default function CourseEditor() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [sections, setSections] = useState<Section[]>([])
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [isAddingMaterial, setIsAddingMaterial] = useState<string | null>(null)
  const [newSection, setNewSection] = useState({ title: "", description: "" })
  const [newMaterial, setNewMaterial] = useState<{
    title: string
    description: string
    type: "video" | "reading" | "quiz" | "code"
    duration_minutes: number
  }>({
    title: "",
    description: "",
    type: "video",
    duration_minutes: 0,
  })

  const handleAddSection = async () => {
    try {
      // TODO: Implement API call to create section
      // const response = await fetch(`/api/courses/${courseId}/sections`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ...newSection,
      //     order_index: sections.length,
      //   }),
      // })
      // const data = await response.json()
      const newSectionData = {
        id: `section-${Date.now()}`,
        ...newSection,
        order_index: sections.length,
        materials: [],
      }
      setSections([...sections, newSectionData])
      setNewSection({ title: "", description: "" })
      setIsAddingSection(false)
    } catch (error) {
      console.error("Error adding section:", error)
    }
  }

  const handleAddMaterial = async (sectionId: string) => {
    try {
      // TODO: Implement API call to create material
      // const response = await fetch(`/api/sections/${sectionId}/materials`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ...newMaterial,
      //     order_index: sections.find(s => s.id === sectionId)?.materials.length || 0,
      //   }),
      // })
      // const data = await response.json()
      const newMaterialData = {
        id: `material-${Date.now()}`,
        ...newMaterial,
        order_index: sections.find((s) => s.id === sectionId)?.materials.length || 0,
      }
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? { ...section, materials: [...section.materials, newMaterialData] }
            : section
        )
      )
      setNewMaterial({
        title: "",
        description: "",
        type: "video",
        duration_minutes: 0,
      })
      setIsAddingMaterial(null)
    } catch (error) {
      console.error("Error adding material:", error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      // TODO: Implement API call to delete section
      // await fetch(`/api/courses/${courseId}/sections/${sectionId}`, {
      //   method: "DELETE",
      // })
      setSections(sections.filter((section) => section.id !== sectionId))
    } catch (error) {
      console.error("Error deleting section:", error)
    }
  }

  const handleDeleteMaterial = async (sectionId: string, materialId: string) => {
    try {
      // TODO: Implement API call to delete material
      // await fetch(`/api/materials/${materialId}`, {
      //   method: "DELETE",
      // })
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                materials: section.materials.filter((material) => material.id !== materialId),
              }
            : section
        )
      )
    } catch (error) {
      console.error("Error deleting material:", error)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, type } = result

    if (type === "section") {
      const newSections = Array.from(sections)
      const [removed] = newSections.splice(source.index, 1)
      newSections.splice(destination.index, 0, removed)
      setSections(newSections)
    } else if (type === "material") {
      const sourceSection = sections.find((s) => s.id === source.droppableId)
      const destSection = sections.find((s) => s.id === destination.droppableId)

      if (!sourceSection || !destSection) return

      const newSections = sections.map((section) => {
        if (section.id === source.droppableId) {
          const newMaterials = Array.from(section.materials)
          const [removed] = newMaterials.splice(source.index, 1)
          return { ...section, materials: newMaterials }
        }
        if (section.id === destination.droppableId) {
          const newMaterials = Array.from(section.materials)
          newMaterials.splice(destination.index, 0, result.draggableId)
          return { ...section, materials: newMaterials }
        }
        return section
      })

      setSections(newSections)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Content Editor</h1>
        <Button onClick={() => navigate(`/course/${courseId}`)}>Preview Course</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardTitle>{section.title}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Droppable droppableId={section.id} type="material">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {section.materials.map((material, index) => (
                                <Draggable
                                  key={material.id}
                                  draggableId={material.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        {material.type === "video" && <Video className="h-5 w-5" />}
                                        {material.type === "reading" && <FileText className="h-5 w-5" />}
                                        {material.type === "code" && <Code className="h-5 w-5" />}
                                        <div>
                                          <h3 className="font-medium">{material.title}</h3>
                                          <p className="text-sm text-muted-foreground">
                                            {material.description}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">
                                          {material.duration_minutes} min
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteMaterial(section.id, material.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {isAddingMaterial === section.id ? (
                          <div className="mt-4 space-y-4 p-4 border rounded-lg">
                            <div className="space-y-2">
                              <Label htmlFor="material-title">Title</Label>
                              <Input
                                id="material-title"
                                value={newMaterial.title}
                                onChange={(e) =>
                                  setNewMaterial({ ...newMaterial, title: e.target.value })
                                }
                                placeholder="Enter material title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="material-description">Description</Label>
                              <Textarea
                                id="material-description"
                                value={newMaterial.description}
                                onChange={(e) =>
                                  setNewMaterial({ ...newMaterial, description: e.target.value })
                                }
                                placeholder="Enter material description"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="material-type">Type</Label>
                                <Select
                                  value={newMaterial.type}
                                  onValueChange={(value: any) =>
                                    setNewMaterial({ ...newMaterial, type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="reading">Reading</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="code">Code Exercise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="material-duration">Duration (minutes)</Label>
                                <Input
                                  id="material-duration"
                                  type="number"
                                  value={newMaterial.duration_minutes}
                                  onChange={(e) =>
                                    setNewMaterial({
                                      ...newMaterial,
                                      duration_minutes: parseInt(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddingMaterial(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={() => handleAddMaterial(section.id)}>
                                Add Material
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => setIsAddingMaterial(section.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Material
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isAddingSection ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Title</Label>
                <Input
                  id="section-title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-description">Description</Label>
                <Textarea
                  id="section-description"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Enter section description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingSection(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>Add Section</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={() => setIsAddingSection(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}
    </div>
  )
} 