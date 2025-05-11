#!/bin/bash
set -e

# Configuration variables
S3_BUCKET_NAME="kaiju-academy-frontend-bucket" # Replace with your S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID="E3MBJG9XBRXHRH" # CloudFront distribution ID
AWS_REGION="ap-southeast-1" # Replace with your preferred AWS region
BUILD_DIRECTORY="dist" # Vite builds to the "dist" directory by default
CLOUDFRONT_FUNCTION_NAME="KaijuAcademySpaRouter" # Name for the CloudFront function

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Kaiju Academy Deployment Script ===${NC}"

# Prompt for CloudFront distribution ID if not set
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}CloudFront distribution ID is not set in the script.${NC}"
    read -p "Enter your CloudFront distribution ID (leave empty to skip CloudFront invalidation): " CLOUDFRONT_DISTRIBUTION_ID
    echo ""
fi

echo -e "${YELLOW}Building and deploying to S3 bucket: ${S3_BUCKET_NAME}${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is logged in to AWS
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo -e "${RED}You are not logged in to AWS. Please run 'aws configure' first.${NC}"
    exit 1
}

# Check for production Vite config
if [ -f "vite.config.production.ts" ]; then
    echo -e "${YELLOW}Using production Vite configuration...${NC}"
    # Build the project with production config
    echo -e "${YELLOW}Building project...${NC}"
    npm run build -- --config vite.config.production.ts
else
    # Build the project with default config
    echo -e "${YELLOW}Production config not found. Using default configuration...${NC}"
    echo -e "${YELLOW}Building project...${NC}"
    npm run build
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIRECTORY" ]; then
    echo -e "${RED}Build directory not found. Build failed?${NC}"
    exit 1
fi

# Check if S3 bucket exists, create it if it doesn't
echo -e "${YELLOW}Checking if S3 bucket exists...${NC}"
if ! aws s3api head-bucket --bucket "$S3_BUCKET_NAME" 2>/dev/null; then
    echo -e "${YELLOW}S3 bucket doesn't exist. Creating bucket...${NC}"
    aws s3api create-bucket \
        --bucket "$S3_BUCKET_NAME" \
        --region "$AWS_REGION" \
        --create-bucket-configuration LocationConstraint="$AWS_REGION"
    
    # Configure bucket block public access
    echo -e "${YELLOW}Configuring bucket to block public access...${NC}"
    aws s3api put-public-access-block \
        --bucket "$S3_BUCKET_NAME" \
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
fi

# Set proper cache control headers for different file types
echo -e "${YELLOW}Preparing to upload files with appropriate cache settings...${NC}"

# Upload HTML files with no caching
echo -e "${YELLOW}Uploading HTML files...${NC}"
aws s3 sync "$BUILD_DIRECTORY" "s3://$S3_BUCKET_NAME" \
    --delete \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html; charset=utf-8"

# Upload JS and CSS files with long-term caching
echo -e "${YELLOW}Uploading JS and CSS files...${NC}"
aws s3 sync "$BUILD_DIRECTORY" "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "*.js" \
    --include "*.css" \
    --cache-control "public, max-age=31536000, immutable" 

# Upload assets with long-term caching
echo -e "${YELLOW}Uploading asset files...${NC}"
aws s3 sync "$BUILD_DIRECTORY/assets" "s3://$S3_BUCKET_NAME/assets" \
    --cache-control "public, max-age=31536000, immutable"

# Upload the rest of the files
echo -e "${YELLOW}Uploading remaining files...${NC}"
aws s3 sync "$BUILD_DIRECTORY" "s3://$S3_BUCKET_NAME" \
    --delete \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --exclude "assets/*" \
    --cache-control "public, max-age=86400"

# Create/Update CloudFront Function for SPA routing if it doesn't exist
if [ -f "cloudfront-function.js" ]; then
    echo -e "${YELLOW}Checking CloudFront Function for SPA routing...${NC}"
    
    # Always get the current function if it exists
    if FUNCTION_OUTPUT=$(aws cloudfront describe-function --name "$CLOUDFRONT_FUNCTION_NAME" 2>/dev/null); then
        echo -e "${YELLOW}CloudFront Function already exists. Updating...${NC}"
        
        # Update existing function
        ETAG=$(echo "$FUNCTION_OUTPUT" | grep -o '"ETag": "[^"]*"' | cut -d'"' -f4)
        
        aws cloudfront update-function \
            --name "$CLOUDFRONT_FUNCTION_NAME" \
            --function-config '{"Comment":"SPA Router for Kaiju Academy","Runtime":"cloudfront-js-1.0"}' \
            --function-code fileb://cloudfront-function.js \
            --if-match "$ETAG"
        
        echo -e "${GREEN}CloudFront Function updated successfully.${NC}"
    else
        echo -e "${YELLOW}Creating CloudFront Function...${NC}"
        
        # Try to create new function, handling potential errors
        if aws cloudfront create-function \
            --name "$CLOUDFRONT_FUNCTION_NAME" \
            --function-config '{"Comment":"SPA Router for Kaiju Academy","Runtime":"cloudfront-js-1.0"}' \
            --function-code fileb://cloudfront-function.js; then
            
            echo -e "${GREEN}CloudFront Function created successfully.${NC}"
        else
            echo -e "${YELLOW}Error creating CloudFront function. It might already exist.${NC}"
            echo -e "${YELLOW}Try manually updating it through the AWS console or fixing permissions.${NC}"
        fi
        
        echo -e "${YELLOW}Remember to associate the function with your CloudFront distribution.${NC}"
        echo -e "${YELLOW}Go to CloudFront console > Your distribution > Behaviors > Edit > Function associations > Viewer request${NC}"
    fi
else
    echo -e "${YELLOW}CloudFront Function file not found. Skipping function creation.${NC}"
fi

# If CloudFront distribution ID is provided, create an invalidation
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}CloudFront distribution ID provided: $CLOUDFRONT_DISTRIBUTION_ID${NC}"
    
    # Set bucket policy to allow CloudFront access
    echo -e "${YELLOW}Setting bucket policy for CloudFront access...${NC}"
    POLICY='{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$S3_BUCKET_NAME'/*",
                "Condition": {
                    "StringEquals": {
                        "AWS:SourceArn": "arn:aws:cloudfront::'$(aws sts get-caller-identity --query Account --output text)':distribution/'$CLOUDFRONT_DISTRIBUTION_ID'"
                    }
                }
            }
        ]
    }'
    
    echo "$POLICY" > /tmp/bucket_policy.json
    aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/bucket_policy.json
    rm /tmp/bucket_policy.json
    
    echo -e "${YELLOW}Creating CloudFront invalidation...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    
    echo -e "${GREEN}Deployment completed. CloudFront invalidation created.${NC}"
    echo -e "${GREEN}Your website should be available through CloudFront.${NC}"
else
    echo -e "${YELLOW}No CloudFront distribution ID provided.${NC}"
    echo -e "${YELLOW}IMPORTANT: Your bucket is currently not publicly accessible.${NC}"
    echo -e "${YELLOW}To deploy with CloudFront, create a distribution in the AWS console and run this script again with the distribution ID.${NC}"
fi 