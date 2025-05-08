/**
 * Database Seed Script
 * Populates the MongoDB database with initial data
 */
const mongoose = require('mongoose');
const { connectToDatabase } = require('../utils/db');
const User = require('../models/User');
const Course = require('../models/Course');

// Initial user data
const userData = [
  {
    email: 'admin@example.com',
    password: 'admin123', // In a real app, these would be hashed
    name: 'Admin User',
    role: 'admin',
    bio: 'Administrator account'
  },
  {
    email: 'teacher@example.com',
    password: 'teacher123',
    name: 'Teacher User',
    role: 'educator',
    bio: 'Educator account specializing in web development and programming'
  },
  {
    email: 'student@example.com',
    password: 'student123',
    name: 'Student User',
    role: 'student',
    bio: 'Student account learning web development'
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to the database
    const connection = await connectToDatabase();
    
    console.log('\n===================================');
    console.log('MongoDB Database Seed Tool');
    console.log('===================================\n');
    
    console.log(`Connected to MongoDB: ${connection.name}`);
    console.log(`MongoDB host: ${connection.host}`);
    
    console.log('\nStarting seed process...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    
    console.log('✅ Cleared existing data.');
    
    // Insert users
    console.log('Creating users...');
    const createdUsers = await User.insertMany(userData);
    console.log(`✅ Inserted ${createdUsers.length} users.`);
    
    // Get the educator user for courses
    const educator = createdUsers.find(user => user.role === 'educator');
    
    // Initial course data
    const courseData = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming language',
        difficulty: 'beginner',
        tags: ['javascript', 'web development', 'programming'],
        educator: educator._id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 10,
        category: 'web development',
        students: 100,
        rating: 4.5,
        reviews: 100,
        price: 100
      },
      {
        title: 'Advanced Python Programming',
        description: 'Deep dive into Python with advanced concepts',
        difficulty: 'advanced',
        tags: ['python', 'data science', 'programming'],
        educator: educator._id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 15,
        category: 'data science',
        students: 200,
        rating: 4.8,
        reviews: 200,
        price: 150
      },
      {
        title: 'Web Development with React',
        description: 'Build modern web applications with React',
        difficulty: 'intermediate',
        tags: ['javascript', 'react', 'web development'],
        educator: educator._id,
        thumbnail: 'https://picsum.photos/200',
        is_published: false,
        duration_hours: 12,
        category: 'web development',
        students: 150,
        rating: 4.2,
        reviews: 150,
        price: 120
      },
      {
        title: 'Introduction to Python',
        description: 'Learn the basics of Python programming language',
        difficulty: 'beginner',
        tags: ['python', 'programming'],
        educator: educator._id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 8,
        category: 'programming',
        students: 200,
        rating: 4.6,
        reviews: 200,
        price: 120
      },
      {
        title: 'Web Development with Node.js',
        description: 'Build server-side applications with Node.js',
        difficulty: 'intermediate',
        tags: ['javascript', 'node.js', 'web development'],
        educator: educator._id,
        thumbnail: 'https://picsum.photos/200',
        is_published: true,
        duration_hours: 10,
        category: 'web development',
        students: 150,
        rating: 4.4,
        reviews: 150,
        price: 100
      }
    ];
    
    // Insert courses
    console.log('Creating courses...');
    const createdCourses = await Course.insertMany(courseData);
    console.log(`✅ Inserted ${createdCourses.length} courses.`);
    
    console.log('\n🎉 Database seed completed successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    try {
      // Try to close the connection
      if (mongoose.connection) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      }
      
      process.exit(1);
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
      process.exit(1);
    }
  }
}

// Run the seed function
seedDatabase().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
}); 