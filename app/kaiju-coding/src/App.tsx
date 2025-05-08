import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { PasswordReset } from './pages/auth/password-reset'
import CourseOverview from './pages/course-overview'
import CourseContent from './pages/course-content'
import { AuthProvider, useAuth } from './lib/auth'
import CourseManagement from './pages/course/course-management'
import CourseForm from './pages/course/course-form'
import AssessmentPage from './pages/assessment/assessment-page'
import AssessmentForm from './pages/assessment/assessment-form'
import AssessmentView from './pages/assessment/assessment-view'
import { StudentProfile } from './pages/profile/StudentProfile'
import { TeacherProfile } from './pages/profile/TeacherProfile'
import GradeSubmission from './pages/assessment/grade-submission'

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { isAuthenticated, user } = useAuth()
  // const isAuthenticated = true
  // const user = { role: "educator" }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // Allow access to both student and educator profiles when role is educator
  if (requiredRole && user?.role !== requiredRole && 
      !(user?.role === "educator" && (requiredRole === "student" || requiredRole === "educator"))) {
    return <Navigate to="/" replace />
  } 

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          
          {/* Student routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />
          
          {/* Educator-only routes */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute requiredRole="educator">
                <CourseForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/edit"
            element={
              <ProtectedRoute requiredRole="educator">
                <CourseForm mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assessment/new"
            element={
              <ProtectedRoute requiredRole="educator">
                <AssessmentForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assessment/:assessmentId/edit"
            element={
              <ProtectedRoute requiredRole="educator">
                <AssessmentForm mode="edit" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assessment/:assessmentId"
            element={
              <ProtectedRoute>
                <AssessmentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:assessmentId/grade/:submissionId"
            element={
              <ProtectedRoute requiredRole="educator">
                <GradeSubmission />
              </ProtectedRoute>
            }
          />
          
          {/* Profile routes */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentProfile 
                  name="John Doe"
                  email="john@example.com"
                  grade="12"
                  progress={75}
                  courses={[
                    {
                      name: "Introduction to Programming",
                      progress: 80,
                      status: "active"
                    }
                  ]}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/educator-profile"
            element={
              <ProtectedRoute requiredRole="educator">
                <TeacherProfile 
                  name="Jane Smith"
                  email="jane@example.com"
                  subjects={["Computer Science", "Mathematics"]}
                  bio="Experienced educator with 10 years of teaching experience"
                  classes={[
                    {
                      name: "Introduction to Programming",
                      students: 25,
                      schedule: "Mon, Wed 10:00 AM"
                    }
                  ]}
                  achievements={[
                    {
                      title: "Best Teacher Award 2023",
                      date: "2023-12-01",
                      description: "Recognized for excellence in teaching"
                    }
                  ]}
                />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
