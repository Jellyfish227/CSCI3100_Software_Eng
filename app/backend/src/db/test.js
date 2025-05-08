/**
 * Database connection test file
 */
const { getConnection, closeConnection, initializeDatabase } = require('../../nodejs-lambda/src/db/connection');

/**
 * Test the database connection and schema
 */
const testDatabase = async () => {
  try {
    // Initialize the database (this will apply the schema)
    await initializeDatabase();
    
    // Get the database connection
    const db = await getConnection();
    
    // Test creating a user
    const newUser = {
      email: 'test@example.com',
      password: 'hashedpassword123', // In a real app, this would be properly hashed
      name: 'Test User',
      role: 'student',
      bio: 'A test user for development'
    };
    
    // Create the user
    console.log('Creating test user...');
    const createdUser = await db.create('user', newUser);
    console.log('Created user:', createdUser);
    
    // Query all users
    console.log('Querying users...');
    const users = await db.select('user');
    console.log('Users in database:', users);
    
    // Test creating a course
    const courseData = {
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with JavaScript',
      difficulty: 'beginner',
      tags: ['programming', 'javascript', 'beginner'],
      educator: createdUser[0].id,
      thumbnail: 'https://example.com/course-thumbnail.jpg',
      duration_hours: 10.5,
      is_published: true
    };
    
    console.log('Creating test course...');
    const createdCourse = await db.create('course', courseData);
    console.log('Created course:', createdCourse);
    
    // Query all courses
    console.log('Querying courses...');
    const courses = await db.select('course');
    console.log('Courses in database:', courses);
    
    // Close the connection
    await closeConnection();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing database:', error);
  }
};

// Run the test
testDatabase(); 