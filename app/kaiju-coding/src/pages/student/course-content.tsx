import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { CourseContentList } from "@/types/courseContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Circle, FileText, Video, Book, Code, PlayCircle, CheckSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudentCourseContent() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseContent, setCourseContent] = useState<CourseContentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const fetchCourseContent = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getCourseContent(courseId);
      setCourseContent(data);
      setError(null);
    } catch (err) {
      setError("Failed to load course content. Please try again later.");
      console.error("Error fetching course content:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseContent();
      // In a real implementation, you'd fetch the student's progress here as well
      // For now, we'll simulate it with empty completed content
      setCompletedContent([]);
      setOverallProgress(0);
    }
  }, [courseId, fetchCourseContent]);

  const markContentAsCompleted = async (contentId: string) => {
    if (!courseId) return;
    
    try {
      // Toggle completion status
      const isCompleted = completedContent.includes(contentId);
      
      // Call API to update progress
      await apiService.updateCourseProgress(courseId, {
        content_id: contentId,
        completed: !isCompleted
      });
      
      // Update local state
      if (isCompleted) {
        setCompletedContent(prev => prev.filter(id => id !== contentId));
      } else {
        setCompletedContent(prev => [...prev, contentId]);
      }
      
      // Recalculate overall progress
      if (courseContent) {
        const totalContentItems = courseContent.topics.reduce(
          (count, topic) => count + topic.entries.length, 
          0
        );
        
        const newProgress = !isCompleted 
          ? (completedContent.length + 1) / totalContentItems * 100
          : (completedContent.length - 1) / totalContentItems * 100;
          
        setOverallProgress(Math.round(newProgress));
      }
    } catch (err) {
      console.error("Error updating course progress:", err);
      // Show error notification here
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'lesson':
        return <Book className="h-4 w-4" />;
      case 'tutorial':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
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
        <Button onClick={fetchCourseContent}>Try Again</Button>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          No content available for this course yet.
        </div>
        <Button onClick={() => navigate('/student/enrolled-courses')}>
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student/enrolled-courses')}
          className="mb-4"
        >
          ← Back to My Courses
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Course Content</h1>
          <div className="flex flex-col w-full md:w-1/3">
            <div className="flex justify-between text-sm mb-1">
              <span>Your Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-6">
          {courseContent.topics.map((topic, topicIndex) => (
            <Card key={topicIndex}>
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {topic.entries.map((content) => {
                    const isCompleted = completedContent.includes(content.id);
                    
                    return (
                      <AccordionItem key={content.id} value={content.id}>
                        <AccordionTrigger className="hover:bg-slate-50 p-3 rounded">
                          <div className="flex items-center gap-3 text-left">
                            {getContentTypeIcon(content.type)}
                            <div className="flex-1">
                              <span className="mr-2">{content.title}</span>
                              <span className="text-xs text-slate-500">
                                {content.duration_minutes} min
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 mr-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                markContentAsCompleted(content.id);
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300" />
                              )}
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t pt-4">
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 mb-4">{content.description}</p>
                            
                            {/* Here we would display the actual content based on its type */}
                            {content.type === 'video' && (
                              <div className="aspect-video bg-slate-100 flex items-center justify-center rounded overflow-hidden">
                                {/* In a real implementation, this would be a video player */}
                                <Button 
                                  variant="ghost" 
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    // Direct to the detailed content view
                                    navigate(`/student/course/${courseId}/content/${content.id}`);
                                  }}
                                >
                                  <PlayCircle className="h-12 w-12" />
                                  <span>Watch Video</span>
                                </Button>
                              </div>
                            )}
                            
                            {(content.type === 'lesson' || content.type === 'tutorial') && (
                              <Button 
                                className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
                                onClick={() => {
                                  // Direct to the detailed content view
                                  navigate(`/student/course/${courseId}/content/${content.id}`);
                                }}
                              >
                                Start {content.type === 'lesson' ? 'Lesson' : 'Tutorial'}
                              </Button>
                            )}
                            
                            {content.type === 'quiz' && (
                              <Button 
                                className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
                                onClick={() => {
                                  // Direct to the quiz
                                  navigate(`/student/course/${courseId}/quiz/${content.id}`);
                                }}
                              >
                                Start Quiz
                              </Button>
                            )}
                          </div>
                          
                          {content.resources && content.resources.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Additional Resources</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {content.resources.map((resource, idx) => (
                                  <li key={idx}>
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {resource.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Course Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Assignments Available</h3>
                <p className="text-slate-500">
                  This course doesn't have any assignments yet. Check back later!
                </p>
              </div>
              
              {/* In a real implementation, you would fetch and display assignments here */}
              {/* Example of what an assignment card would look like:
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Assignment Title</h3>
                    <p className="text-sm text-slate-500">Due: May 30, 2024</p>
                  </div>
                  <Badge variant="outline">Not Started</Badge>
                </div>
                <p className="mt-2 text-sm">Assignment description text here...</p>
                <Button 
                  className="mt-4 bg-[#4aafbf] hover:bg-[#3d9aa9]"
                  onClick={() => navigate(`/student/course/${courseId}/assignment/123`)}
                >
                  Start Assignment
                </Button>
              </div>
              */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 