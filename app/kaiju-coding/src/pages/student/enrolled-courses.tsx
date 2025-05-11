import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type EnrolledCourse = {
  id: string;
  title: string;
  description: string;
  educator: {
    id: string;
    name: string;
  };
  enrollment: {
    id: string;
    enrolled_at: string;
    progress: number;
    status: string;
    last_accessed: string;
  };
  thumbnail: string;
};

export default function EnrolledCourses() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const courses = await apiService.getEnrolledCourses();
      setEnrolledCourses(courses);
      setError(null);
    } catch (err) {
      setError("Failed to load your enrolled courses. Please try again later.");
      console.error("Error fetching enrolled courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleContinueLearning = (courseId: string) => {
    navigate(`/student/course/${courseId}/content`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4aafbf]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Button onClick={fetchEnrolledCourses}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Enrolled Courses</h1>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">You haven't enrolled in any courses yet</h3>
          <p className="text-slate-500 mb-6">Explore our course catalog to find courses that interest you!</p>
          <Button 
            onClick={() => navigate('/courses')} 
            className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              <div 
                className="aspect-video bg-slate-100 relative" 
                style={{ 
                  backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!course.thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    No thumbnail
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="default">{course.enrollment.status}</Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500 line-clamp-3">{course.description}</p>
                
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="block text-slate-500">Instructor</span>
                    <span>{course.educator.name}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Enrolled on</span>
                    <span>{formatDate(course.enrollment.enrolled_at)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Last accessed</span>
                    <span>{course.enrollment.last_accessed ? formatDate(course.enrollment.last_accessed) : 'Never'}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span>{course.enrollment.progress}%</span>
                    </div>
                    <Progress value={course.enrollment.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t bg-slate-50 flex justify-between p-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewCourse(course.id)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Overview
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
                  onClick={() => handleContinueLearning(course.id)}
                >
                  <BookOpen className="h-4 w-4 mr-1" /> Continue Learning
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 