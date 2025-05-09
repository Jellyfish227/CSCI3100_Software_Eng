export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  educator: {
    id: string;
    name: string;
    email: string;
    profile_image: string;
    bio: string;
  };
  created_at: string;
  updated_at: string;
  is_published: boolean;
  thumbnail: string;
  duration_hours: number;
  category: string;
  students: number;
  rating: number;
  reviews: number;
  price: number;
}