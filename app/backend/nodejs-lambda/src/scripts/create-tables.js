/**
 * Script to create DynamoDB tables for the application
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  CreateTableCommand, 
  ListTablesCommand,
  UpdateTimeToLiveCommand
} = require('@aws-sdk/client-dynamodb');

// Configuration
const REGION = process.env.AWS_REGION || 'us-east-1';
const dbClient = new DynamoDBClient({ region: REGION });

// Table names
const USERS_TABLE = process.env.USERS_TABLE || 'kaiju-users';
const COURSES_TABLE = process.env.COURSES_TABLE || 'kaiju-courses';
const COURSE_CONTENT_TABLE = process.env.COURSE_CONTENT_TABLE || 'kaiju-course-content';
const ENROLLMENTS_TABLE = process.env.ENROLLMENTS_TABLE || 'kaiju-enrollments';
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'kaiju-assignments';
const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE || 'kaiju-submissions';
const ASSESSMENTS_TABLE = process.env.ASSESSMENTS_TABLE || 'kaiju-assessments';
const ASSESSMENT_RESULTS_TABLE = process.env.ASSESSMENT_RESULTS_TABLE || 'kaiju-assessment-results';
const FILES_TABLE = process.env.FILES_TABLE || 'kaiju-files';

/**
 * Check if a table exists
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} Whether the table exists
 */
const tableExists = async (tableName) => {
  try {
    const { TableNames } = await dbClient.send(new ListTablesCommand({}));
    return TableNames.includes(tableName);
  } catch (err) {
    console.error('Error checking table existence:', err);
    return false;
  }
};

/**
 * Create the Users table
 */
const createUsersTable = async () => {
  if (await tableExists(USERS_TABLE)) {
    console.log(`Table ${USERS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: USERS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${USERS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${USERS_TABLE}:`, err);
  }
};

/**
 * Create the Courses table
 */
const createCoursesTable = async () => {
  if (await tableExists(COURSES_TABLE)) {
    console.log(`Table ${COURSES_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: COURSES_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'educator_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EducatorIndex',
        KeySchema: [
          { AttributeName: 'educator_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${COURSES_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${COURSES_TABLE}:`, err);
  }
};

/**
 * Create the Course Content table
 */
const createCourseContentTable = async () => {
  if (await tableExists(COURSE_CONTENT_TABLE)) {
    console.log(`Table ${COURSE_CONTENT_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'course_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CourseIndex',
        KeySchema: [
          { AttributeName: 'course_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${COURSE_CONTENT_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${COURSE_CONTENT_TABLE}:`, err);
  }
};

/**
 * Create the Enrollments table
 */
const createEnrollmentsTable = async () => {
  if (await tableExists(ENROLLMENTS_TABLE)) {
    console.log(`Table ${ENROLLMENTS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: ENROLLMENTS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'student_id', AttributeType: 'S' },
      { AttributeName: 'course_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StudentIndex',
        KeySchema: [
          { AttributeName: 'student_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'CourseIndex',
        KeySchema: [
          { AttributeName: 'course_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'CourseStudentIndex',
        KeySchema: [
          { AttributeName: 'course_id', KeyType: 'HASH' },
          { AttributeName: 'student_id', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${ENROLLMENTS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${ENROLLMENTS_TABLE}:`, err);
  }
};

/**
 * Create the Assignments table
 */
const createAssignmentsTable = async () => {
  if (await tableExists(ASSIGNMENTS_TABLE)) {
    console.log(`Table ${ASSIGNMENTS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'course_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CourseIndex',
        KeySchema: [
          { AttributeName: 'course_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${ASSIGNMENTS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${ASSIGNMENTS_TABLE}:`, err);
  }
};

/**
 * Create the Submissions table
 */
const createSubmissionsTable = async () => {
  if (await tableExists(SUBMISSIONS_TABLE)) {
    console.log(`Table ${SUBMISSIONS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: SUBMISSIONS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'assignment_id', AttributeType: 'S' },
      { AttributeName: 'student_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'AssignmentIndex',
        KeySchema: [
          { AttributeName: 'assignment_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'StudentIndex',
        KeySchema: [
          { AttributeName: 'student_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${SUBMISSIONS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${SUBMISSIONS_TABLE}:`, err);
  }
};

/**
 * Create the Assessments table
 */
const createAssessmentsTable = async () => {
  if (await tableExists(ASSESSMENTS_TABLE)) {
    console.log(`Table ${ASSESSMENTS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: ASSESSMENTS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'course_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CourseIndex',
        KeySchema: [
          { AttributeName: 'course_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${ASSESSMENTS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${ASSESSMENTS_TABLE}:`, err);
  }
};

/**
 * Create the Assessment Results table
 */
const createAssessmentResultsTable = async () => {
  if (await tableExists(ASSESSMENT_RESULTS_TABLE)) {
    console.log(`Table ${ASSESSMENT_RESULTS_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: ASSESSMENT_RESULTS_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'assessment_id', AttributeType: 'S' },
      { AttributeName: 'student_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'AssessmentIndex',
        KeySchema: [
          { AttributeName: 'assessment_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'StudentIndex',
        KeySchema: [
          { AttributeName: 'student_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${ASSESSMENT_RESULTS_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${ASSESSMENT_RESULTS_TABLE}:`, err);
  }
};

/**
 * Create the Files table
 */
const createFilesTable = async () => {
  if (await tableExists(FILES_TABLE)) {
    console.log(`Table ${FILES_TABLE} already exists, skipping creation`);
    return;
  }
  
  const params = {
    TableName: FILES_TABLE,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'related_id', AttributeType: 'S' },
      { AttributeName: 'uploaded_by', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'RelatedIdIndex',
        KeySchema: [
          { AttributeName: 'related_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'UserIndex',
        KeySchema: [
          { AttributeName: 'uploaded_by', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };
  
  try {
    await dbClient.send(new CreateTableCommand(params));
    console.log(`Table ${FILES_TABLE} created successfully`);
  } catch (err) {
    console.error(`Error creating table ${FILES_TABLE}:`, err);
  }
};

/**
 * Main function to create all tables
 */
const createTables = async () => {
  console.log('Creating tables...');
  
  // Create tables
  await createUsersTable();
  await createCoursesTable();
  await createCourseContentTable();
  await createEnrollmentsTable();
  await createAssignmentsTable();
  await createSubmissionsTable();
  await createAssessmentsTable();
  await createAssessmentResultsTable();
  await createFilesTable();
  
  console.log('All tables created.');
};

// Run the script
createTables().catch(err => console.error('Error creating tables:', err)); 