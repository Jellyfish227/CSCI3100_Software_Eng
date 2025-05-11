import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { CourseContent } from "@/types/courseContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

type QuizQuestion = {
  id: string;
  question: string;
  type: "multiple_choice" | "essay";
  options?: string[];
  points: number;
};

type QuizAnswer = {
  questionId: string;
  answer: string | number | null;
};

export default function Quiz() {
  const { courseId, contentId } = useParams<{ courseId: string; contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (courseId && contentId) {
      fetchQuizContent();
    }
  }, [courseId, contentId]);

  const fetchQuizContent = async () => {
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
      
      if (foundContent && foundContent.type === 'quiz') {
        setContent(foundContent);
        
        // In a real application, the quiz questions would be part of the content
        // Here we'll create some dummy questions for demonstration
        const dummyQuestions: QuizQuestion[] = [
          {
            id: "q1",
            question: "What is the main benefit of using React?",
            type: "multiple_choice",
            options: [
              "Virtual DOM for improved performance",
              "Built-in state management",
              "Native mobile development",
              "Server-side rendering"
            ],
            points: 10
          },
          {
            id: "q2",
            question: "Which hook is used to perform side effects in a function component?",
            type: "multiple_choice",
            options: [
              "useState",
              "useEffect",
              "useContext",
              "useReducer"
            ],
            points: 10
          },
          {
            id: "q3",
            question: "Explain the difference between props and state in React.",
            type: "essay",
            points: 20
          }
        ];
        
        setQuestions(dummyQuestions);
        
        // Initialize answers
        setAnswers(dummyQuestions.map(q => ({
          questionId: q.id,
          answer: null
        })));
        
        setError(null);
      } else {
        setError("Quiz content not found");
        setContent(null);
      }
    } catch (err) {
      setError("Failed to load quiz. Please try again later.");
      console.error("Error fetching quiz content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string | number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      answer: value
    };
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would submit the answers to the backend
      // For this demo, we'll just simulate a successful submission
      
      // Calculate a dummy score
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = 
        Math.floor(Math.random() * (totalPoints * 0.7)) + // Random score between 0 and 70% of total
        Math.floor(totalPoints * 0.3); // Plus at least 30% of total (so score is 30-100%)
      
      setScore(earnedPoints);
      setQuizSubmitted(true);
      
      // Mark the quiz as completed
      await apiService.updateCourseProgress(courseId!, {
        content_id: contentId!,
        completed: true
      });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          {error || "Quiz not found"}
        </div>
        <Button 
          onClick={() => navigate(`/student/course/${courseId}/content`)}
        >
          Back to Course Content
        </Button>
      </div>
    );
  }

  if (quizSubmitted) {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score! / totalPoints) * 100);
    
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/student/course/${courseId}/content`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course Content
        </Button>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{content.title} - Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#4aafbf] mb-2">{percentage}%</div>
              <p className="text-lg text-slate-600">Your Score: {score} out of {totalPoints} points</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Your progress</p>
              <Progress value={percentage} className="h-2" />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-md border">
              <div className="flex items-start gap-3">
                {percentage >= 70 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <h3 className="font-medium">{percentage >= 70 ? "Quiz Passed!" : "Quiz Not Passed"}</h3>
                  <p className="text-sm text-slate-500">
                    {percentage >= 70 
                      ? "Great job! You have successfully completed this quiz." 
                      : "You need to score at least 70% to pass this quiz. Consider reviewing the material and trying again."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-3">
            <Button 
              onClick={() => navigate(`/student/course/${courseId}/content`)}
              className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
            >
              Continue Learning
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswer = answers[currentQuestionIndex]?.answer !== null;

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/student/course/${courseId}/content`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course Content
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{content.title}</CardTitle>
            <span className="text-sm text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Progress</p>
            <Progress 
              value={(currentQuestionIndex / questions.length) * 100} 
              className="h-2" 
            />
          </div>
          
          {currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {currentQuestion.question}
                </h3>
                <p className="text-sm text-slate-500">
                  {currentQuestion.points} points
                </p>
              </div>
              
              {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                <RadioGroup 
                  value={answers[currentQuestionIndex]?.answer?.toString() || ""}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion.type === "essay" && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestionIndex]?.answer as string || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-24"
                />
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button 
                className="bg-[#4aafbf] hover:bg-[#3d9aa9]"
                disabled={!hasAnswer || isSubmitting}
                onClick={handleSubmitQuiz}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button 
                className="bg-[#4aafbf] hover:bg-[#3d9aa9]" 
                onClick={handleNextQuestion}
                disabled={!hasAnswer}
              >
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 