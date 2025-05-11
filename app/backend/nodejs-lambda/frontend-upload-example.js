/**
 * Example frontend code for uploading files using presigned URLs
 */

// Example usage in a React or other frontend application
async function uploadFile(
  file,
  type,
  relatedId,
  description = null,
  apiBaseUrl = 'https://your-api-gateway-url.com/prod'
) {
  try {
    // Step 1: Get a presigned URL from the backend
    const token = getAuthToken(); // Your auth token retrieval function
    if (!token) {
      throw new Error('Authentication required');
    }

    // Request a presigned URL
    const presignedUrlResponse = await fetch(`${apiBaseUrl}/files/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        type, // thumbnail, content, assignment_submission, etc.
        relatedId,
        description,
        size: file.size
      })
    });

    if (!presignedUrlResponse.ok) {
      const errorData = await presignedUrlResponse.json();
      throw new Error(errorData.error?.message || 'Failed to get presigned URL');
    }

    const { presignedUrl, file: fileMetadata } = await presignedUrlResponse.json();

    // Step 2: Upload the file directly to S3 using the presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file // Send the raw file object
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    // Step 3: Confirm the upload with the backend
    const confirmResponse = await fetch(`${apiBaseUrl}/files/confirm-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileId: fileMetadata.id
      })
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json();
      throw new Error(errorData.error?.message || 'Failed to confirm upload');
    }

    const confirmData = await confirmResponse.json();
    
    // Return the file metadata from the confirmation response
    return confirmData.file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Example usage with your existing code
async function updateCourseThumbnail(courseId, thumbnailFile) {
  try {
    // Upload thumbnail using the new presigned URL approach
    const fileData = await uploadFile(
      thumbnailFile,
      'thumbnail',
      courseId,
      `Thumbnail for course ${courseId}`
    );
    
    // Update the course with the new thumbnail URL
    const courseUpdateResponse = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        thumbnail: fileData.url
      })
    });
    
    return courseUpdateResponse.json();
  } catch (error) {
    console.error('Error updating course thumbnail:', error);
    throw error;
  }
}

// Example usage with FormData (for compatibility with your existing code)
async function uploadFileWrapper(
  file,
  type,
  relatedId, 
  description
) {
  // This wrapper maintains the same API signature as your original function
  // but uses the new presigned URL approach internally
  return uploadFile(file, type, relatedId, description);
} 