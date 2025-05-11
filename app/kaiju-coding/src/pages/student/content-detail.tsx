import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { CourseContent } from "@/types/courseContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, BookOpen, Video, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export default function ContentDetail() {
  const { courseId, contentId } = useParams<{ courseId: string; contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchContentDetail = useCallback(async () => {
    try {
      setLoading(true);
      // In a real implementation, you would have an API endpoint to get a specific content item
      // For now, we'll get all course content and filter
      const courseContentData = await apiService.getCourseContent(courseId!);
      
      // Find the specific content item
      let foundContent: CourseContent | null = null;
      for (const topic of courseContentData.topics) {
        const contentItem = topic.entries.find(entry => entry.id === contentId);
        if (contentItem) {
          foundContent = contentItem;
          break;
        }
      }
      
      if (foundContent) {
        setContent(foundContent);
        setError(null);
        
        // Check if this content is already completed
        // In a real implementation, you would fetch the user's progress
        // For now, we'll set it to false
        setIsCompleted(false);
      } else {
        setError("Content not found");
        setContent(null);
      }
    } catch (err) {
      setError("Failed to load content. Please try again later.");
      console.error("Error fetching content detail:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, contentId]);

  useEffect(() => {
    if (courseId && contentId) {
      fetchContentDetail();
    }
  }, [courseId, contentId, fetchContentDetail]);

  const markAsCompleted = async () => {
    if (!courseId || !contentId) return;
    
    try {
      await apiService.updateCourseProgress(courseId, {
        content_id: contentId,
        completed: !isCompleted
      });
      
      setIsCompleted(!isCompleted);
    } catch (err) {
      console.error("Error updating content progress:", err);
      // Show error notification here
    }
  };

  const getContentTypeIcon = () => {
    if (!content) return null;
    
    switch (content.type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'lesson':
        return <BookOpen className="h-5 w-5" />;
      case 'tutorial':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4aafbf]"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Content not found"}
        </div>
        <Button 
          onClick={() => navigate(`/student/course/${courseId}/content`)}
        >
          Back to Course Content
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/student/course/${courseId}/content`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course Content
      </Button>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Badge className="px-2 py-1">{content.type}</Badge>
          <h1 className="text-2xl font-bold">{content.title}</h1>
        </div>
        
        <Button 
          variant={isCompleted ? "outline" : "default"}
          className={isCompleted ? "border-green-600 text-green-600" : "bg-[#4aafbf] hover:bg-[#3d9aa9]"}
          onClick={markAsCompleted}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" /> Completed
            </>
          ) : (
            "Mark as Completed"
          )}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          {getContentTypeIcon()}
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.type === 'video' ? (
              <div className="relative aspect-video bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                {/* In a real implementation, this would be a video player */}
                {/* For this demo, we'll display a placeholder */}
                <div className="text-center p-4">
                  <Video className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">Video Player</p>
                  <p className="text-sm text-slate-400 mt-2">
                    In a real implementation, the video would be embedded here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown 
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  remarkPlugins={[remarkGfm]}
                >
                  {content.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {content.resources && content.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.resources.map((resource, idx) => (
                <li key={idx} className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-slate-500" />
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
          </CardContent>
        </Card>
      )}
    </div>
  );
} 