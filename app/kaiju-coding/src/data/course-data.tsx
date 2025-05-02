// CourseData interface definition
export interface CourseData {
    id: string
    title: string
    description?: string
    image: string
    category: string
    tags: string[]
    rating: number
    reviews: number
    duration: string
    students: string
    price: number
    instructor?: string
    instructorTitle?: string
    featured?: boolean
  }
  
  // Topics interface
  export interface Topic {
    id: string
    title: string
    icon: string
  }
  
  // Mock course data
  export const coursesData: CourseData[] = [
    {
      id: "1",
      title: "Introduction to Python Programming",
      description: "Learn the basics of Python programming language and start building your own applications.",
      image: "/python-course.png",
      category: "programming-languages",
      tags: ["python", "programming", "beginner"],
      rating: 4.8,
      reviews: 176,
      duration: "10 hrs",
      students: "50 students",
      price: 200,
      instructor: "Dr. Sarah Johnson",
    },
    {
      id: "2",
      title: "Digital Marketing Fundamentals",
      description: "Master the core concepts of digital marketing and learn how to create effective campaigns.",
      image: "/marketing-course.png",
      category: "marketing",
      tags: ["marketing", "digital", "social media"],
      rating: 4.5,
      reviews: 124,
      duration: "8 hrs",
      students: "40 students",
      price: 200,
      instructor: "Mark Williams",
    },
    {
      id: "3",
      title: "Data Science with R",
      description: "Learn how to analyze and visualize data using R programming language.",
      image: "/data-science-course.png",
      category: "data-science",
      tags: ["data science", "R", "statistics"],
      rating: 4.7,
      reviews: 142,
      duration: "12 hrs",
      students: "45 students",
      price: 200,
      instructor: "Dr. Emily Chen",
    },
    {
      id: "4",
      title: "Advanced JavaScript Techniques",
      description: "Take your JavaScript skills to the next level with advanced concepts and patterns.",
      image: "/javascript-course.png",
      category: "web-development",
      tags: ["javascript", "web development", "advanced"],
      rating: 4.9,
      reviews: 98,
      duration: "15 hrs",
      students: "35 students",
      price: 250,
      instructor: "Jason Miller",
    },
    {
      id: "5",
      title: "UI/UX Design Principles",
      description: "Learn the fundamental principles of creating user-friendly and visually appealing interfaces.",
      image: "/design-course.png",
      category: "design",
      tags: ["design", "UI", "UX", "user interface"],
      rating: 4.6,
      reviews: 112,
      duration: "14 hrs",
      students: "60 students",
      price: 220,
      instructor: "Anna Kuznova",
      instructorTitle: "Senior UX Designer at Google",
      featured: true,
    },
    {
      id: "6",
      title: "Mobile App Development with React Native",
      description: "Build cross-platform mobile applications using React Native framework.",
      image: "/react-native-course.png",
      category: "mobile-development",
      tags: ["react native", "mobile", "javascript"],
      rating: 4.8,
      reviews: 86,
      duration: "18 hrs",
      students: "30 students",
      price: 280,
      instructor: "David Park",
    },
    {
      id: "7",
      title: "SQL for Data Analysis",
      description: "Master SQL queries for effective data analysis and database management.",
      image: "/sql-course.png",
      category: "database-management",
      tags: ["SQL", "database", "data analysis"],
      rating: 4.5,
      reviews: 132,
      duration: "8 hrs",
      students: "55 students",
      price: 180,
      instructor: "Michael Brown",
    },
    {
      id: "8",
      title: "Cybersecurity Fundamentals",
      description: "Learn the basics of cybersecurity and how to protect systems from common threats.",
      image: "/cybersecurity-course.png",
      category: "cybersecurity",
      tags: ["security", "cyber", "network"],
      rating: 4.7,
      reviews: 94,
      duration: "12 hrs",
      students: "40 students",
      price: 240,
      instructor: "Lisa Chen",
    },
    {
      id: "9",
      title: "Machine Learning with Python",
      description: "Implement machine learning algorithms using Python and popular libraries.",
      image: "/machine-learning-course.png",
      category: "data-science",
      tags: ["machine learning", "python", "AI"],
      rating: 4.9,
      reviews: 108,
      duration: "20 hrs",
      students: "35 students",
      price: 300,
      instructor: "Dr. Robert Kim",
    },
    {
      id: "10",
      title: "Full Stack Web Development",
      description: "Master both frontend and backend development to build complete web applications.",
      image: "/fullstack-course.png",
      category: "web-development",
      tags: ["web development", "full stack", "javascript"],
      rating: 4.8,
      reviews: 156,
      duration: "25 hrs",
      students: "45 students",
      price: 320,
      instructor: "Jennifer Lopez",
    },
    {
      id: "11",
      title: "C++ Programming for Beginners",
      description: "Learn the fundamentals of C++ programming language from scratch.",
      image: "/cpp-course.png",
      category: "programming-languages",
      tags: ["C++", "programming", "beginner"],
      rating: 4.6,
      reviews: 118,
      duration: "15 hrs",
      students: "50 students",
      price: 220,
      instructor: "Prof. Alan Smith",
    },
    {
      id: "12",
      title: "Masterclass in Design Thinking, Innovation & Creativity",
      description: "Learn how to apply design thinking principles to solve complex problems and drive innovation.",
      image: "/design-thinking-course.png",
      category: "design",
      tags: ["design thinking", "innovation", "creativity"],
      rating: 4.9,
      reviews: 210,
      duration: "16 hrs",
      students: "75 students",
      price: 350,
      instructor: "Ann Kuznova",
      instructorTitle: "Innovation Director",
      featured: true,
    },
  ]
  
  // Topics data
  export const topicsData: Topic[] = [
    {
      id: "topic1",
      title: "Python Core",
      icon: "/python-icon.png",
    },
    {
      id: "topic2",
      title: "C++",
      icon: "/cpp-icon.png",
    },
    {
      id: "topic3",
      title: "Java",
      icon: "/java-icon.png",
    },
    {
      id: "topic4",
      title: "JavaScript",
      icon: "/js-icon.png",
    },
    {
      id: "topic5",
      title: "SQL",
      icon: "/sql-icon.png",
    },
    {
      id: "topic6",
      title: "React",
      icon: "/react-icon.png",
    },
  ]
  
  // Helper functions
  export const getCategories = (): string[] => {
    const categories = coursesData.map((course) => course.category)
    return [
      "programming-languages",
      "web-development",
      "mobile-development",
      "database-management",
      "cybersecurity",
      "data-science",
      "design",
      "marketing",
    ]
  }
  
  export const getFeaturedCourse = (): CourseData => {
    return coursesData.find((course) => course.featured) || coursesData[4]
  }
  
  // Search function
  export const searchCourses = (query: string): CourseData[] => {
    if (!query.trim()) {
      return coursesData
    }
  
    const searchTerm = query.toLowerCase()
    return coursesData.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm)) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
    )
  }
  
  // Get courses by category
  export const getCoursesByCategory = (category: string): CourseData[] => {
    if (category === "all") return coursesData
    return coursesData.filter((course) => course.category === category)
  }
  
  // Get related courses
  export const getRelatedCourses = (courseId: string, limit = 3): CourseData[] => {
    const course = coursesData.find((c) => c.id === courseId)
    if (!course) return []
  
    return coursesData.filter((c) => c.category === course.category && c.id !== course.id).slice(0, limit)
  }
  
  // Get trending courses
  export const getTrendingCourses = (limit = 4): CourseData[] => {
    return coursesData
      .filter((course) => course.rating >= 4.7)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }
  
  // Get course by ID
  export const getCourseById = (id: string): CourseData | undefined => {
    return coursesData.find((course) => course.id === id)
  }
  