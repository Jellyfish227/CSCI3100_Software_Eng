/**
 * Database Seed Script
 * Populates the DynamoDB database with initial data
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // For local development with DynamoDB local
  ...(process.env.IS_LOCAL === 'true' && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local'
    }
  })
});

const docClient = DynamoDBDocumentClient.from(client);

// Table names
const USERS_TABLE = process.env.USERS_TABLE || 'kaiju-users';
const COURSES_TABLE = process.env.COURSES_TABLE || 'kaiju-courses';

// Initial user data
const userData = [
  {
    id: `user:${uuidv4()}`,
    email: 'admin@example.com',
    password: 'admin123', // In a real app, these would be hashed
    name: 'Admin User',
    role: 'admin',
    bio: 'Administrator account',
    profile_image: null,
    created_at: new Date().toISOString()
  },
  {
    id: `user:${uuidv4()}`,
    email: 'teacher@example.com',
    password: 'teacher123',
    name: 'Teacher User',
    role: 'educator',
    bio: 'Educator account specializing in web development and programming',
    profile_image: null,
    created_at: new Date().toISOString()
  },
  {
    id: `user:${uuidv4()}`,
    email: 'student@example.com',
    password: 'student123',
    name: 'Student User',
    role: 'student',
    bio: 'Student account learning web development',
    profile_image: null,
    created_at: new Date().toISOString()
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('\n===================================');
    console.log('DynamoDB Database Seed Tool');
    console.log('===================================\n');
    
    console.log('Starting seed process...');
    
    // Insert users
    console.log('Creating users...');
    const userPromises = userData.map(user => {
      return docClient.send(new PutCommand({
        TableName: USERS_TABLE,
        Item: user
      }));
    });
    
    await Promise.all(userPromises);
    console.log(`✅ Inserted ${userData.length} users.`);
    
    // Get the educator user for courses
    const educator = userData.find(user => user.role === 'educator');
    
    // Initial course data
    const courseData = [
      {
        id: `course:${uuidv4()}`,
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming language',
        difficulty: 'beginner',
        tags: ['javascript', 'web development', 'programming'],
        educator: educator.id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 10,
        category: 'web development',
        students: 100,
        rating: 4.5,
        reviews: 100,
        price: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `course:${uuidv4()}`,
        title: 'Advanced Python Programming',
        description: 'Deep dive into Python with advanced concepts',
        difficulty: 'advanced',
        tags: ['python', 'data science', 'programming'],
        educator: educator.id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 15,
        category: 'data science',
        students: 200,
        rating: 4.8,
        reviews: 200,
        price: 150,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `course:${uuidv4()}`,
        title: 'Web Development with React',
        description: 'Build modern web applications with React',
        difficulty: 'intermediate',
        tags: ['javascript', 'react', 'web development'],
        educator: educator.id,
        thumbnail: 'https://picsum.photos/200',
        is_published: false,
        duration_hours: 12,
        category: 'web development',
        students: 150,
        rating: 4.2,
        reviews: 150,
        price: 120,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `course:${uuidv4()}`,
        title: 'Introduction to Python',
        description: 'Learn the basics of Python programming language',
        difficulty: 'beginner',
        tags: ['python', 'programming'],
        educator: educator.id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 8,
        category: 'programming',
        students: 200,
        rating: 4.6,
        reviews: 200,
        price: 120,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `course:${uuidv4()}`,
        title: 'Web Development with Node.js',
        description: 'Build server-side applications with Node.js',
        difficulty: 'intermediate',
        tags: ['javascript', 'node.js', 'web development'],
        educator: educator.id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 10,
        category: 'web development',
        students: 150,
        rating: 4.4,
        reviews: 150,
        price: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Insert courses
    console.log('Creating courses...');
    const coursePromises = courseData.map(course => {
      return docClient.send(new PutCommand({
        TableName: COURSES_TABLE,
        Item: course
      }));
    });
    
    await Promise.all(coursePromises);
    console.log(`✅ Inserted ${courseData.length} courses.`);
    
    console.log('\n🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
}); 