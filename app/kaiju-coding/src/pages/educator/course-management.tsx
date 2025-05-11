import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, PenSquare, Eye, Plus, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Helper function to determine if a course is published
const isPublished = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log(isDeleteModalOpen);

  useEffect(() => {
    fetchEducatorCourses();
  }, []);

  const fetchEducatorCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEducatorCourses();
      setCourses(response.courses);
      setError(null);
    } catch (err) {
      setError("Failed to load your courses. Please try again later.");
      console.error("Error fetching educator courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await apiService.deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleEditCourse = (course: Course) => {
    navigate(`/courses/edit/${course.id}`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleCreateCourse = () => {
    navigate("/courses/create");
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
        <Button onClick={fetchEducatorCourses}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Your Courses</h1>
        <Button onClick={handleCreateCourse} className="bg-[#4aafbf] hover:bg-[#3d9aa9]">
          <Plus className="h-4 w-4 mr-2" /> Create New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">You haven't created any courses yet</h3>
          <p className="text-slate-500 mb-6">Start creating your first course to share your knowledge!</p>
          <Button onClick={handleCreateCourse} className="bg-[#4aafbf] hover:bg-[#3d9aa9]">
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
                  <Badge variant={
                    isPublished(course.is_published) ? "default" : "secondary"
                  }>
                    {
                      isPublished(course.is_published) ? "Published" : "Draft"
                    }
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500 line-clamp-3">{course.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="block text-slate-500">Category</span>
                    <span>{course.category}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Difficulty</span>
                    <span>{course.difficulty}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Duration</span>
                    <span>{course.duration_hours} hours</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Price</span>
                    <span>${course.price}</span>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <Button 
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/educator/course/${course.id}/content`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" /> Manage Course Content
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="border-t bg-slate-50 flex justify-between p-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Delete Course</SheetTitle>
                      <SheetDescription>
                        Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => selectedCourse && handleDeleteCourse(selectedCourse.id)}
                      >
                        Delete Course
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => course.id && handleViewCourse(course.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
                    onClick={() => handleEditCourse(course)}
                  >
                    <PenSquare className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/educator/course/${course.id}/content`)}
                  >
                    <BookOpen className="h-4 w-4 mr-1" /> Content
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 