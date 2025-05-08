/**
 * Test script for SurrealDB connection
 */
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using provided credentials');
}

const { getConnection, closeConnection, initializeDatabase, configure } = require('./src/db/connection');

// Provide credentials directly if needed
configure({
  url: 'wss://kaiju-academy-06bb1uvdphtaf1d3m6nrc2rgvo.aws-use1.surreal.cloud',
  namespace: 'code_learning_platform',
  database: 'code_learning_platform',
  username: 'kaiju',
  password: '69420'
});

/**
 * Main test function
 */
async function main() {
  try {
    console.log('Testing SurrealDB connection...');
    
    // // Initialize database with schema
    // await initializeDatabase();
    // console.log('Database initialized with schema');
    
    // Get connection
    const db = await getConnection();
    console.log('Connected to SurrealDB');
    
    // Try to create a test user
    const testUser = {
      email: 'mefbayar.bigdaddy@gmail.com',
      password: 'bigdaddy',
      name: 'mefbayar',
      role: 'student',
      bio: 'I am a student at the CUHK',
      last_login: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      profile_image: 'https://example.com/profile.jpg'
      
    };
    
    console.log('Creating test user...');
    const user = await db.create('user', testUser);
    console.log('Created user:', user);
    
    // Query all users
    console.log('Querying users...');
    const users = await db.select('user');
    console.log('Users:', users);
    
    // Close the connection
    await closeConnection();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing database:', error);
    await closeConnection();
  }
}

// Run the test
main(); 