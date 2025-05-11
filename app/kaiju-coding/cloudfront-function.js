/**
 * CloudFront Function to handle SPA routing
 * This function ensures that all non-file requests are redirected to index.html
 * for proper React Router handling
 */
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check if the request is for a file
    // If the URI contains a file extension (e.g., .html, .js, .css, .png, etc.)
    if (uri.includes('.')) {
        // It's a file request, don't modify
        return request;
    }
    
    // For all paths (including root and other app routes), serve index.html
    // This enables proper handling of React Router client-side routing
    request.uri = '/index.html';
    
    return request;
} 