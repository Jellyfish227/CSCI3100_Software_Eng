import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { PasswordReset } from './pages/auth/password-reset'
import CourseOverview from './pages/course-overview'
import CourseContent from './pages/course-content'
import { AuthProvider, useAuth } from './lib/auth'
import CourseForm from './pages/course/course-form'
import AssessmentPage from './pages/assessment/assessment-page'
import AssessmentForm from './pages/assessment/assessment-form'
import AssessmentView from './pages/assessment/assessment-view'
import { StudentProfile } from './pages/profile/StudentProfile'
import { TeacherProfile } from './pages/profile/TeacherProfile'
import GradeSubmission from './pages/assessment/grade-submission'
import EducatorCourseManagement from './pages/educator/course-management'
import CourseContentManagement from './pages/educator/course-content-management'
import EnrolledCourses from './pages/student/enrolled-courses'
import StudentCourseContent from './pages/student/course-content'
import ContentDetail from './pages/student/content-detail'
import Quiz from './pages/student/quiz'
import { Toaster } from './components/ui/toaster'

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
          
          {/* General course routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseOverview />
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
          
          {/* Student routes */}
          <Route
            path="/student/enrolled-courses"
            element={
              <ProtectedRoute requiredRole="student">
                <EnrolledCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:courseId/content"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentCourseContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:courseId/content/:contentId"
            element={
              <ProtectedRoute requiredRole="student">
                <ContentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:courseId/quiz/:contentId"
            element={
              <ProtectedRoute requiredRole="student">
                <Quiz />
              </ProtectedRoute>
            }
          />
          
          {/* Assessment routes */}
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentPage />
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
          
          {/* Educator-only routes */}
          <Route
            path="/educator/courses"
            element={
              <ProtectedRoute requiredRole="educator">
                <EducatorCourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/educator/course/:courseId/content"
            element={
              <ProtectedRoute requiredRole="educator">
                <CourseContentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/create"
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
            path="/courses/edit/:id"
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
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App
