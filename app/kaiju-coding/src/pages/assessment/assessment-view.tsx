import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { useState } from "react"

export default function AssessmentView() {
  const navigate = useNavigate()
  // const [setFile] = useState<File | null>(null)

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>View and submit your assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              // onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            <Button onClick={() => navigate('/assessment')}>
              Submit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 