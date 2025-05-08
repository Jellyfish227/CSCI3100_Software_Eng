#!/bin/bash
set -e

echo "Building and deploying Node.js Lambda function..."

# Install dependencies
npm install

# Create the build directory
mkdir -p .aws-sam/build/MainFunction

# Copy files to the build directory
cp -r src node_modules package.json .aws-sam/build/MainFunction/

echo "Build completed."

# Check if we should deploy
if [ "$1" == "--deploy" ]; then
    # Get S3 bucket name
    S3_BUCKET=${2:-"your-deployment-bucket"}
    echo "Packaging application to S3 bucket: $S3_BUCKET"
    
    # Package the application
    sam package \
        --output-template-file packaged.yaml \
        --s3-bucket $S3_BUCKET
    
    # Deploy the application
    echo "Deploying application..."
    sam deploy \
        --template-file packaged.yaml \
        --stack-name kaiju-academy-backend-sam \
        --capabilities CAPABILITY_IAM
        
    echo "Deployment completed successfully!"
else
    echo "Build completed. Use --deploy option to deploy to AWS."
fi 