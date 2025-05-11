export interface CourseContent {
  id: string;
  course_id: string;
  topic: string;
  title: string;
  type: "video" | "tutorial" | "lesson" | "quiz";
  description: string;
  content: string;
  duration_minutes: number;
  order: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  resources: ContentResource[];
}

export interface ContentResource {
  title: string;
  url: string;
  type: string;
}

export interface ContentTopic {
  name: string;
  entries: CourseContent[];
}

export interface CourseContentList {
  courseId: string;
  topics: ContentTopic[];
}

export interface CourseContentCreateData {
  topic: string;
  title: string;
  type: "video" | "tutorial" | "lesson" | "quiz";
  description: string;
  content: string;
  duration_minutes: number;
  status: "draft" | "published";
  resources?: ContentResource[];
}

export interface CourseContentUpdateData {
  title?: string;
  description?: string;
  content?: string;
  duration_minutes?: number;
  status?: "draft" | "published";
} 