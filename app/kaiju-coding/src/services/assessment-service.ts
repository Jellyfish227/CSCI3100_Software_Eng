interface Assessment {
  id: string
  title: string
  description: string
  courseTitle: string
  fileUrl: string
  dueDate: string
}

export const assessmentService = {
  async getAssessments(): Promise<Assessment[]> {
    // Mock data for now
    return [
      {
        id: "1",
        title: "Assignment 1",
        description: "Basic programming concepts",
        courseTitle: "Introduction to Programming",
        fileUrl: "/sample.pdf",
        dueDate: "2024-04-01"
      }
    ]
  }
} 