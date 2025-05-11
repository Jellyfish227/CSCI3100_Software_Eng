/**
 * File upload and management handlers
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const busboy = require('busboy');
const { createFile, getFileById, getFilesByRelatedId, deleteFile } = require('../../utils/db');
const { success, error } = require('../../utils/response');

// Initialize S3 client with proper configuration
const s3 = new AWS.S3({
  signatureVersion: 'v4', // Use v4 signature for better compatibility
  region: process.env.AWS_REGION || 'ap-southeast-1' // Use the region from environment or default
});

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET || 'kaiju-academy-files';

/**
 * Helper to parse multipart/form-data from event using busboy
 * @param {object} event - API Gateway event
 * @returns {Promise<object>} Parsed form data
 */
const parseFormData = (event) => {
  return new Promise((resolve, reject) => {
    try {
      const contentType = event.headers['Content-Type'] || event.headers['content-type'];
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return reject(new Error('Content-Type must be multipart/form-data'));
      }

      console.log('Parsing multipart form data');
      
      // Convert base64 body to buffer if needed
      let body = event.body;
      if (event.isBase64Encoded) {
        console.log('Decoding base64 encoded body');
        body = Buffer.from(body, 'base64');
      } else if (typeof body === 'string') {
        console.log('Converting string body to buffer');
        body = Buffer.from(body);
      }

      const fields = {};
      let fileData = null;

      const bb = busboy({ 
        headers: { 'content-type': contentType },
        limits: {
          fileSize: 20 * 1024 * 1024, // 20MB limit
          files: 1 // Only allow one file
        }
      });

      console.log('Busboy instance created');

      bb.on('field', (fieldname, value) => {
        console.log('Received field:', fieldname);
        fields[fieldname] = value;
      });

      bb.on('file', (fieldname, file, info) => {
        console.log('Received file field:', fieldname, 'Filename:', info.filename);
        if (fieldname === 'file') {
          const { filename, encoding, mimeType } = info;
          const chunks = [];

          file.on('data', (data) => {
            console.log('Received file chunk, size:', data.length);
            chunks.push(data);
          });

          file.on('end', () => {
            console.log('File upload complete, concatenating chunks');
            const buffer = Buffer.concat(chunks);
            console.log('Total file size:', buffer.length);
            fileData = {
              content: buffer,
              filename: filename,
              contentType: mimeType,
              size: buffer.length
            };
          });
        }
      });

      bb.on('finish', () => {
        console.log('Busboy parsing completed');
        console.log('Fields received:', Object.keys(fields));
        if (fileData) {
          console.log('File received:', fileData.filename, 'Size:', fileData.size);
        } else {
          console.log('No file data received');
        }
        resolve({
          fields,
          file: fileData
        });
      });

      bb.on('error', (err) => {
        console.error('Error parsing form data:', err);
        reject(err);
      });

      // Write data to busboy
      bb.write(body);
      bb.end();
    } catch (err) {
      console.error('Exception in parseFormData:', err);
      reject(err);
    }
  });
};

/**
 * Upload file to S3 and save metadata to DynamoDB
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const uploadFile = async (event) => {
  try {
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }

    console.log('Processing file upload request');
    console.log('Content-Type:', event.headers['Content-Type'] || event.headers['content-type']);
    console.log('Is Base64 Encoded:', event.isBase64Encoded);
    
    // Parse multipart form data
    const { fields, file } = await parseFormData(event);
    
    if (!file) {
      console.log('No file found in parsed request');
      return error(400, 'Bad Request', 'No file found in request');
    }

    console.log('File parsed successfully:', file.filename, 'Size:', file.size, 'Content Type:', file.contentType);
    
    if (!fields.type) {
      return error(400, 'Bad Request', 'File type is required');
    }
    
    if (!fields.related_id) {
      return error(400, 'Bad Request', 'Related ID is required');
    }
    
    // Check file type permissions
    const allowedTypes = ['thumbnail', 'content', 'assignment_submission', 'profile_image', 'course_resource'];
    if (!allowedTypes.includes(fields.type)) {
      return error(400, 'Bad Request', `Invalid file type. Must be one of: ${allowedTypes.join(', ')}`);
    }
    
    // Generate a unique filename to prevent collisions
    const fileExtension = file.filename.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const fileKey = `${fields.type}/${uniqueFileName}`;
    
    console.log('Uploading to S3:', fileKey, 'Bucket:', BUCKET_NAME);
    
    // Upload to S3 with public-read ACL to make it accessible
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file.content,
      ContentType: file.contentType,
    };
    
    console.log('Starting S3 upload...');
    const uploadResult = await s3.upload(s3Params).promise();
    console.log('S3 upload successful, URL:', uploadResult.Location);
    
    // Use the URL from the upload result directly
    const fileUrl = uploadResult.Location;
    
    // Create file metadata in DynamoDB
    const fileData = {
      id: `file:${uuidv4()}`,
      filename: file.filename,
      url: fileUrl,
      type: fields.type,
      size_bytes: file.size,
      mime_type: file.contentType,
      description: fields.description || null,
      related_id: fields.related_id,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString()
    };
    
    const fileRecord = await createFile(fileData);
    console.log('File record created in DynamoDB:', fileRecord.id);
    
    return success(200, {
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Generate a presigned URL for direct S3 upload
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const getPresignedUrl = async (event) => {
  try {
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    console.log('Generating presigned URL for file upload');
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.filename) {
      return error(400, 'Bad Request', 'Filename is required');
    }
    
    if (!body.contentType) {
      return error(400, 'Bad Request', 'Content type is required');
    }
    
    if (!body.type) {
      return error(400, 'Bad Request', 'File type is required');
    }
    
    if (!body.relatedId) {
      return error(400, 'Bad Request', 'Related ID is required');
    }
    
    // Check file type permissions
    const allowedTypes = ['thumbnail', 'content', 'assignment_submission', 'profile_image', 'course_resource'];
    if (!allowedTypes.includes(body.type)) {
      return error(400, 'Bad Request', `Invalid file type. Must be one of: ${allowedTypes.join(', ')}`);
    }
    
    // Generate a unique filename to prevent collisions
    const fileExtension = body.filename.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const fileKey = `${body.type}/${uniqueFileName}`;
    
    console.log('Generating presigned URL for:', fileKey, 'Bucket:', BUCKET_NAME);
    
    // Generate file ID for database
    const fileId = `file:${uuidv4()}`;
    
    // Generate presigned URL for file upload
    const presignedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: body.contentType,
      Expires: 300, // URL expires in 5 minutes
    });
    
    console.log('Presigned URL generated successfully');
    
    // Create file metadata entry in DynamoDB (marked as pending until upload confirmed)
    const fileData = {
      id: fileId,
      filename: body.filename,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`,
      type: body.type,
      size_bytes: body.size || 0, // Will be updated after upload
      mime_type: body.contentType,
      description: body.description || null,
      related_id: body.relatedId,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
      status: 'pending' // Mark as pending until upload is confirmed
    };
    
    const fileRecord = await createFile(fileData);
    console.log('File record created in DynamoDB:', fileRecord.id);
    
    // Return presigned URL and file metadata
    return success(200, {
      presignedUrl,
      file: fileRecord
    });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Confirm a file upload was completed
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const confirmFileUpload = async (event) => {
  try {
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.fileId) {
      return error(400, 'Bad Request', 'File ID is required');
    }
    
    // Get file record from DynamoDB
    const fileRecord = await getFileById(body.fileId);
    if (!fileRecord) {
      return error(404, 'Not Found', 'File record not found');
    }
    
    // Verify user owns the file
    if (fileRecord.uploaded_by !== userId && role !== 'admin') {
      return error(403, 'Forbidden', 'You do not have permission to update this file');
    }
    
    // Check if file exists in S3
    const fileKey = fileRecord.url.split(`${BUCKET_NAME}.s3.amazonaws.com/`)[1];
    
    try {
      await s3.headObject({
        Bucket: BUCKET_NAME,
        Key: fileKey
      }).promise();
      
      // Update file record status to completed
      const updatedFile = await updateFileStatus(body.fileId, 'completed');
      
      return success(200, {
        message: 'File upload confirmed',
        file: updatedFile
      });
    } catch (err) {
      console.error('Error checking file in S3:', err);
      return error(404, 'Not Found', 'File not found in storage');
    }
  } catch (err) {
    console.error('Error confirming file upload:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Update file status
 * @param {string} fileId - File ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated file record
 */
const updateFileStatus = async (fileId, status) => {
  // Implementation would typically use a similar pattern to updateUser in db.js
  // For now, we'll just return the file record
  const file = await getFileById(fileId);
  file.status = status;
  return file;
};

/**
 * 
 * Get files by related entity
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const getFiles = async (event) => {
  try {
    const { id: userId } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    const { related_id: relatedId, type } = event.queryStringParameters || {};
    
    if (!relatedId) {
      return error(400, 'Bad Request', 'Related ID is required');
    }
    
    // Get files from DynamoDB
    const files = await getFilesByRelatedId(relatedId, type);
    
    return success(200, { files });
  } catch (err) {
    console.error('Error getting files:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Delete a file
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const deleteFileHandler = async (event) => {
  try {
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    const { id: fileId } = event.pathParameters || {};
    
    // Get file from DynamoDB
    const file = await getFileById(fileId);
    if (!file) {
      return error(404, 'Not Found', 'File not found');
    }
    
    // Check permissions
    if (file.uploaded_by !== userId && role !== 'admin') {
      return error(403, 'Forbidden', 'You do not have permission to delete this file');
    }
    
    // Delete from S3
    const fileKey = file.url.split('.com/')[1];
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };
    
    await s3.deleteObject(s3Params).promise();
    
    // Delete from DynamoDB
    await deleteFile(fileId);
    
    return success(200, {
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

module.exports = {
  getPresignedUrl,
  confirmFileUpload,
  getFiles,
  deleteFileHandler
}; 