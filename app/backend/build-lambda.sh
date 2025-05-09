#!/bin/bash
set -e

echo "Building AWS Lambda functions using Docker..."

# Build the Docker image
docker build -t kaiju-academy-lambda-builder .

# Create a temporary container and copy the bootstrap file
CONTAINER_ID=$(docker create kaiju-academy-lambda-builder)
mkdir -p .aws-sam/build

# Extract bootstrap binary from container
docker cp $CONTAINER_ID:/bootstrap .aws-sam/build/bootstrap
docker rm $CONTAINER_ID

# List of all function names in template.yaml
FUNCTIONS=("AuthFunction" "UserFunction" "CourseFunction" "QuizFunction")

# Copy bootstrap to each function directory
for func in "${FUNCTIONS[@]}"; do
    mkdir -p .aws-sam/build/$func
    cp .aws-sam/build/bootstrap .aws-sam/build/$func/bootstrap
done

echo "Build completed successfully. You can now deploy with 'sam deploy'" 