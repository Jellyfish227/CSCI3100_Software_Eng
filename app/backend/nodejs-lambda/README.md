# Kaiju Academy Backend (Node.js)

This is a Node.js implementation of the Kaiju Academy backend API using AWS Lambda, API Gateway, and MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or later)
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

## Project Structure

```
nodejs-lambda/
  ├── src/                  # Source code
  │   ├── handlers/         # Lambda handlers
  │   │   ├── auth/         # Authentication handlers
  │   │   │   ├── login.js  # Login handler
  │   │   │   ├── register.js # Registration handler
  │   │   │   ├── validate.js # Token validation handler
  │   │   │   └── index.js  # Auth handlers index
  │   │   ├── courses/      # Course handlers
  │   │   │   ├── list.js   # List courses handler
  │   │   │   ├── get.js    # Get course handler
  │   │   │   ├── create.js # Create course handler
  │   │   │   ├── update.js # Update course handler
  │   │   │   ├── delete.js # Delete course handler
  │   │   │   ├── featured.js # Featured course handler
  │   │   │   └── index.js  # Course handlers index
  │   │   └── code-execution/ # Code execution handlers
  │   │       ├── execute.js  # Code execution handler
  │   │       ├── evaluate.js # Code evaluation handler
  │   │       └── index.js    # Code execution handlers index
  │   ├── models/           # MongoDB data models
  │   │   ├── User.js       # User model
  │   │   └── Course.js     # Course model
  │   ├── scripts/          # Utility scripts
  │   │   └── seed-db.js    # Database seeding script
  │   ├── utils/            # Utility functions
  │   │   ├── response.js   # Response formatting utilities
  │   │   └── db.js         # Database connection utilities
  │   ├── local-server.js   # Local development server
  │   └── index.js          # Main Lambda handler
  ├── package.json          # Node.js dependencies
  ├── template.yaml         # SAM template for AWS deployment
  ├── build-and-deploy.sh   # Build and deployment script
  └── README.md             # This file
```

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. MongoDB Setup:

   You can either use a local MongoDB instance or connect to a hosted MongoDB service like MongoDB Atlas.

   ### Option 1: Local MongoDB
   
   a. Make sure MongoDB is installed and running on your system.
   
   b. Create a data directory for MongoDB:
   
   ```bash
   mkdir -p data
   ```
   
   c. Start MongoDB (or use your system's MongoDB service):
   
   ```bash
   npm run start-mongodb
   ```
   
   ### Option 2: Hosted MongoDB (MongoDB Atlas)
   
   #### Quick Setup (Recommended)
   
   We provide a complete setup script that will guide you through the entire process:
   
   ```bash
   ./setup-mongo-atlas.sh
   ```
   
   This interactive script will:
   - Configure your MongoDB Atlas connection
   - Seed your database with initial data
   - Test your API server connection
   
   #### Manual Setup
   
   a. Sign up for a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
   
   b. Create a new cluster and follow the setup instructions.
   
   c. Get your connection string from MongoDB Atlas.
   
   d. Use our setup helper to test and configure your MongoDB Atlas connection:
   
   ```bash
   npm run setup:atlas
   ```
   
   This interactive tool will:
   - Test your MongoDB Atlas connection
   - Update your .env file (if you choose to)
   - Update the dev:atlas script in package.json (if you choose to)

3. Seed the database with initial data:

```bash
npm run seed
```

4. Create a `.env` file in the project root with the following content:

```
# MongoDB Connection Parameters
MONGODB_USER=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_CLUSTER=your_cluster.mongodb.net
MONGODB_DATABASE=your_database_name
MONGODB_OPTIONS=retryWrites=true&w=majority&appName=YourAppName

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

**IMPORTANT**: Never commit your `.env` file or any file containing credentials to version control!

5. Run the local development server:

```bash
# For local MongoDB
npm run dev

# For MongoDB Atlas
npm run dev:atlas
```

The API will be accessible at http://localhost:3000.

## AWS Deployment

### Secure Credential Management

For secure AWS deployments, store sensitive information like MongoDB credentials and JWT secrets in AWS Systems Manager Parameter Store:

1. Create secure parameters in AWS SSM:

```bash
# Create MongoDB parameters
aws ssm put-parameter --name "/kaiju/mongodb/user" --value "your_mongodb_username" --type SecureString
aws ssm put-parameter --name "/kaiju/mongodb/password" --value "your_mongodb_password" --type SecureString
aws ssm put-parameter --name "/kaiju/mongodb/cluster" --value "your_cluster.mongodb.net" --type SecureString
aws ssm put-parameter --name "/kaiju/mongodb/database" --value "your_database_name" --type SecureString

# Create JWT secret parameter
aws ssm put-parameter --name "/kaiju/jwt/secret" --value "your_jwt_secret" --type SecureString
```

2. These parameters are automatically referenced in the `template.yaml` file.

### Optimizing Lambda Package Size

AWS Lambda has a deployment package size limit of 250MB unzipped. To optimize the package size:

1. Use the clean-build script to reduce package size:

```bash
npm run clean-build
```

2. The build script automatically:
   - Installs only production dependencies
   - Removes the aws-sdk (provided by Lambda)
   - Removes test files, documentation, and unnecessary files

3. If you encounter size limit errors, consider:
   - Moving large dependencies to Lambda Layers
   - Breaking down your application into smaller functions
   - Using the included build-and-deploy.sh script which has advanced optimization

### Basic Deployment

1. Test locally using SAM CLI:

```bash
sam local start-api
```

2. Build and deploy using our script:

```bash
# Just build
./build-and-deploy.sh

# Build and deploy
./build-and-deploy.sh --deploy your-deployment-bucket
```

3. Manual deployment to AWS:

```bash
# Package the application
sam package --output-template-file packaged.yaml --s3-bucket your-deployment-bucket

# Deploy the application
sam deploy --template-file packaged.yaml --stack-name kaiju-academy-backend --capabilities CAPABILITY_IAM
```

## MongoDB Production Setup

For production deployment, you can use:

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Fully managed cloud MongoDB service (Recommended)
   - Create an M0 (free) cluster for development or choose a paid tier for production
   - Enable network access for your application's IP address
   - Create a database user with appropriate permissions
   - Get the connection string and update your environment variables

2. Self-hosted MongoDB on AWS EC2
   - Launch an EC2 instance with appropriate security groups
   - Install and configure MongoDB
   - Set up backups and monitoring

3. [AWS DocumentDB](https://aws.amazon.com/documentdb/) - Amazon's MongoDB-compatible database service
   - Good option for AWS Lambda integration
   - Requires VPC configuration for Lambda functions
   - Provides high availability and scalability

Update the `MONGODB_URI` environment variable in your AWS Lambda configuration with the appropriate connection string.

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/validate` - Validate authentication token

### Courses
- `GET /courses` - List all courses
- `GET /courses/featured` - Get the featured course
- `GET /courses/{id}` - Get a specific course
- `POST /courses` - Create a new course
- `PUT /courses/{id}` - Update a course
- `DELETE /courses/{id}` - Delete a course

### Code Execution
- `POST /code/execute` - Execute code
- `POST /code/evaluate` - Evaluate code against test cases

## Client Example

```javascript
// Example: Login request
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'teacher@example.com',
    password: 'teacher123'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Example: Get courses request
fetch('http://localhost:3000/courses', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`, // Token received from login response
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## AWS SAM Deployment with MongoDB Atlas

The application is set up to deploy to AWS Lambda using SAM (Serverless Application Model). MongoDB Atlas connection parameters are configured directly in the `template.yaml` file:

```yaml
Environment:
  Variables:
    # MongoDB Connection Parameters
    MONGODB_USER: mefbayar
    MONGODB_PASSWORD: ZlTTw0S77HEU829H
    MONGODB_CLUSTER: kaiju.nwdjnfi.mongodb.net
    MONGODB_DATABASE: ''
    MONGODB_OPTIONS: retryWrites=true&w=majority&appName=Kaiju
```

### MongoDB Atlas Network Access for AWS Lambda

For your Lambda function to connect to MongoDB Atlas, you need to configure network access:

1. **Option 1: Allow all IP addresses (easiest but less secure)**
   - In MongoDB Atlas, go to Network Access
   - Add an entry with IP address `0.0.0.0/0` (allows all IPs)
   - Note: This is less secure but simplest for development

2. **Option 2: Deploy Lambda in a VPC with fixed IPs (more secure)**
   - Create a VPC with a NAT Gateway (to provide internet access)
   - Allocate Elastic IPs to your NAT Gateway
   - Add those Elastic IPs to MongoDB Atlas Network Access
   - Add VPC configuration to your SAM template:

```yaml
# Add to your MainFunction in template.yaml
VpcConfig:
  SecurityGroupIds:
    - sg-xxxxxxxxxxxxxxxxx  # your security group ID
  SubnetIds:
    - subnet-xxxxxxxxxxxxxxxxx  # your subnet ID
    - subnet-yyyyyyyyyyyyyyyyy  # another subnet ID in a different AZ
```

### Deployment Steps

1. Deploy using SAM CLI:

```bash
# Package the application
sam package --output-template-file packaged.yaml --s3-bucket your-deployment-bucket

# Deploy the application
sam deploy --template-file packaged.yaml --stack-name kaiju-academy-backend --capabilities CAPABILITY_IAM
```

2. Or use our build and deploy script:

```bash
./build-and-deploy.sh --deploy your-deployment-bucket
```

3. Once deployed, test your API endpoint:

```bash
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@example.com", "password": "teacher123"}'
```

4. If you encounter connection issues:
   - Check MongoDB Atlas Network Access settings
   - Verify Lambda IAM permissions (if using VPC)
   - Check Lambda logs in CloudWatch 