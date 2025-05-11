#!/bin/bash
set -e

echo "Building and deploying Node.js Lambda function..."

# Create the build directory
mkdir -p .aws-sam/build/MainFunction

# Copy only necessary files to the build directory
cp -r src .aws-sam/build/MainFunction/
cp template.yaml .aws-sam/build/MainFunction/

# Copy package files
cp package.json .aws-sam/build/MainFunction/

# Change to the build directory
cd .aws-sam/build/MainFunction

# Install only production dependencies
echo "Installing production dependencies..."
npm install --only=production --no-package-lock
npm prune --production

# Remove aws-sdk v2 entirely (we're using v3)
echo "Removing AWS SDK v2 (using v3)..."
rm -rf node_modules/aws-sdk 2>/dev/null || true

# Aggressive optimization to reduce package size
echo "Optimizing package size..."
# Remove test directories
find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
# Remove example code
find node_modules -type d -name "example" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true
# Remove documentation
find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name ".github" -exec rm -rf {} + 2>/dev/null || true
# Remove markdown and text files
find node_modules -name "*.md" -type f -delete
find node_modules -name "*.ts" -type f -delete
find node_modules -name "LICENSE" -type f -delete
find node_modules -name "CHANGELOG*" -type f -delete
find node_modules -name "README*" -type f -delete
find node_modules -name ".npmignore" -type f -delete
find node_modules -name ".gitignore" -type f -delete
# Remove typescript definition files if not needed at runtime
find node_modules -name "*.d.ts" -type f -delete
# Remove sourcemaps to save space
find node_modules -name "*.map" -type f -delete

# Check package size
echo "Package size after optimization:"
du -sh .

# Return to project root
cd ../../../

echo "Build completed."

# Check if we should deploy
if [ "$1" == "--deploy" ]; then
    # Get S3 bucket name
    S3_BUCKET=${2:-"your-deployment-bucket"}
    echo "Packaging application to S3 bucket: $S3_BUCKET"
    
    # Create or update the JWT secret
    echo "Creating/updating JWT secret..."
    aws secretsmanager create-secret \
        --name "/kaiju/jwt/secret" \
        --description "JWT secret for Kaiju Academy" \
        --secret-string "kaiju-academy-jwt-secret-$(date +%s)" \
        --force-overwrite-replica-secret || true
    
    # Package the application
    sam package \
        --output-template-file packaged.yaml \
        --s3-bucket $S3_BUCKET
    
    # Deploy the application
    echo "Deploying application..."
    sam deploy \
        --template-file packaged.yaml \
        --stack-name kaiju-academy-backend-sam \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides \
            "UsersTableName=kaiju-users" \
            "CoursesTableName=kaiju-courses"
        
    echo "Deployment completed successfully!"
else
    echo "Build completed. Use --deploy option to deploy to AWS."
fi 