import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface Assessment {
  id: string
  title: string
  description: string
  courseTitle: string
  fileUrl: string
  dueDate: string
  submissions: {
    id: string
    studentName: string
    submittedAt: string
    status: "pending" | "graded"
    grade?: number
    fileUrl: string
  }[]
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEducator = user?.role === "educator"
  const [assessments, setAssessments] = useState<Assessment[]>([])

  // Mock data - replace with actual API calls
  const mockAssessments: Assessment[] = [
    {
      id: "1",
      title: "Assignment 1",
      description: "Basic programming concepts",
      courseTitle: "Introduction to Programming",
      fileUrl: "/sample.pdf",
      dueDate: "2024-04-01",
      submissions: [
        {
          id: "sub1",
          studentName: "John Doe",
          submittedAt: "2024-03-28",
          status: "pending",
          fileUrl: "/submissions/sub1.pdf"
        },
        {
          id: "sub2",
          studentName: "Jane Smith",
          submittedAt: "2024-03-29",
          status: "graded",
          grade: 85,
          fileUrl: "/submissions/sub2.pdf"
        }
      ]
    }
  ]

  useEffect(() => {
    // TODO: Replace with actual API call
    setAssessments(mockAssessments)
  }, [])

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank')
  }

  const handleGrade = (assessmentId: string, submissionId: string) => {
    navigate(`/assessment/${assessmentId}/grade/${submissionId}`)
  }

  // Filter submissions based on user role
  const getFilteredSubmissions = (assessment: Assessment) => {
    if (isEducator) {
      return assessment.submissions
    } else {
      // For students, only show their own submission
      return assessment.submissions.filter(
        submission => submission.studentName === user?.name
      )
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Course Assessments</h1>

      <div className="space-y-4">
        {assessments.map(assessment => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{assessment.title}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(assessment.fileUrl)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Course:</span> {assessment.courseTitle}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span> {assessment.dueDate}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Submissions</h3>
                  <div className="space-y-2">
                    {getFilteredSubmissions(assessment).map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{submission.studentName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Submitted: {submission.submittedAt}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(submission.fileUrl)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {isEducator && (
                            submission.status === "pending" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGrade(assessment.id, submission.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Grade
                              </Button>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">Grade: {submission.grade}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGrade(assessment.id, submission.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Update Grade
                                </Button>
                              </div>
                            )
                          )}
                          {!isEducator && submission.status === "graded" && (
                            <span className="text-sm font-medium">Grade: {submission.grade}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 