# Kaiju Academy Deployment Guide

This guide provides step-by-step instructions for deploying the Kaiju Academy web application to AWS using S3 for static website hosting and CloudFront for content delivery.

## Prerequisites

Before you begin, make sure you have:

1. [AWS CLI](https://aws.amazon.com/cli/) installed and configured
2. An AWS account with appropriate permissions to:
   - Create and manage S3 buckets
   - Create and manage CloudFront distributions
   - Create CloudFront functions
   - Create IAM policies
3. Node.js and npm installed

## Deployment Steps

### 1. AWS CLI Setup

If you haven't already set up the AWS CLI, follow these steps:

```bash
# Install AWS CLI (instructions vary by OS)
# For macOS with Homebrew
brew install awscli

# For Ubuntu/Debian
sudo apt-get install awscli

# Configure AWS CLI with your credentials
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region, and output format when prompted.

### 2. Configure Deployment Script

Edit the `deploy.sh` script to set your specific configuration:

```bash
# Configuration variables
S3_BUCKET_NAME="kaiju-academy" # Replace with your preferred S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID="" # Leave empty for now, you'll add this later
AWS_REGION="ap-southeast-1" # Replace with your preferred AWS region
CLOUDFRONT_FUNCTION_NAME="KaijuAcademySpaRouter" # Name for the CloudFront function
```

### 3. Run Initial Deployment

Make the script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Build your application
- Create an S3 bucket if it doesn't exist
- Configure the bucket for static website hosting
- Upload your application files to the bucket
- Create a CloudFront Function for SPA routing (if the file exists)
- Provide a URL where your website is accessible

At this point, your website should be accessible via the S3 website URL, which looks like:
`http://your-bucket-name.s3-website-your-region.amazonaws.com`

### 4. Set Up CloudFront

CloudFront provides faster content delivery through a global CDN network and adds HTTPS support. Follow these steps to set up CloudFront:

1. Open the [CloudFront console](https://console.aws.amazon.com/cloudfront/)
2. Click "Create Distribution"
3. For "Origin Domain Name", select your S3 bucket
4. Configure the distribution settings:
   - **Origin Settings**:
     - Origin Path: Leave empty
     - Origin ID: Leave as default
     - Restrict Bucket Access: No (unless you want to restrict direct S3 access)
   
   - **Default Cache Behavior Settings**:
     - Viewer Protocol Policy: Redirect HTTP to HTTPS
     - Allowed HTTP Methods: GET, HEAD
     - Cache Based on Selected Request Headers: None
     - Object Caching: Use Origin Cache Headers
     - Forward Cookies: None
     - Query String Forwarding and Caching: None
     - Smooth Streaming: No
     - Compress Objects Automatically: Yes
   
   - **Distribution Settings**:
     - Price Class: Choose based on your budget and global needs
     - AWS WAF Web ACL: None (unless you want to add WAF protection)
     - Alternate Domain Names (CNAMEs): Leave empty or add your custom domain
     - SSL Certificate: Default CloudFront Certificate (or custom if using your domain)
     - Security Policy: TLSv1.2_2021
     - Supported HTTP Versions: HTTP/2, HTTP/1.1, HTTP/1.0
     - Default Root Object: `index.html`
     - Logging: Off (or enable if needed)
     - IPv6: Enabled

5. Click "Create Distribution"

6. Wait for the distribution to deploy (status will change from "In Progress" to "Deployed")

7. Note your CloudFront Distribution ID and URL (e.g., `d1234abcdef8.cloudfront.net`)

8. Update your `deploy.sh` script with the CloudFront Distribution ID:

```bash
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID" # Replace with your actual Distribution ID
```

### 5. Configure CloudFront Function for SPA Routing

The deployment script creates a CloudFront Function to handle SPA routing, but you need to associate it with your distribution:

1. Go to the CloudFront console and select your distribution
2. Go to the "Behaviors" tab
3. Select the default behavior and click "Edit"
4. Scroll down to "Function associations"
5. Under "Viewer request", select "Function" and choose the `KaijuAcademySpaRouter` function from the dropdown
6. Click "Save changes"

This function ensures all non-file routes are directed to index.html, allowing React Router to handle client-side routing correctly.

### 6. Future Deployments

For future deployments, simply run:

```bash
./deploy.sh
```

The script will:
- Build your app
- Sync the changes to the S3 bucket
- Update the CloudFront Function if needed
- Create a CloudFront invalidation to ensure that the latest content is served

## Understanding the CloudFront Function

The `cloudfront-function.js` file contains a simple function that redirects all non-file URLs to `index.html`. This is crucial for single-page applications that use client-side routing like React Router.

The function works as follows:
1. If the request is for a file with an extension (e.g., `.js`, `.css`, `.png`), it passes through unchanged
2. If the request is for the root path `/`, it passes through unchanged
3. All other requests (like `/student/enrolled-courses`) are rewritten to `/index.html`

This allows React Router to handle the routing on the client side, which is essential for a single-page application.

## Connecting a Custom Domain (Optional)

To use a custom domain (e.g., `kaiju-academy.com`) with your CloudFront distribution:

1. Register a domain through Route 53 or another domain registrar
2. Create a certificate in AWS Certificate Manager (ACM)
3. Verify domain ownership through DNS or email
4. Update your CloudFront distribution to use the custom domain and certificate
5. Create DNS records to point your domain to the CloudFront distribution

Detailed instructions for this process are available in the [AWS documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html).

## Troubleshooting

### Common Issues

1. **Access Denied errors**: Check your bucket policy and permissions
2. **Blank page or 404 errors after navigation**: Ensure the CloudFront Function is correctly associated with your distribution
3. **CloudFront showing old content**: Create an invalidation for "/*" to clear the cache
4. **Deployment script fails**: Check AWS CLI configuration and permissions

### Getting Help

If you encounter issues:
1. Check AWS service status: [AWS Service Health Dashboard](https://status.aws.amazon.com/)
2. Review CloudWatch logs if enabled
3. Check S3 bucket and CloudFront distribution settings

## Cost Considerations

Using AWS S3 and CloudFront incurs costs based on:
- Storage used in S3
- Data transfer out of S3 to CloudFront
- CloudFront data transfer to users
- Number of CloudFront requests
- CloudFront invalidations (first 1,000 paths per month are free)
- CloudFront Functions executions (first 2 million invocations per month are free)

Monitor your AWS billing dashboard regularly to avoid unexpected charges. 