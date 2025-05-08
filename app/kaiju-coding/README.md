# Kaiju Academy Frontend

## Authentication Setup

The frontend authentication system is now connected to the backend API. Here's how it works:

1. The `src/services/auth-service.ts` file contains the service that communicates with the backend API endpoints.
2. The `src/lib/auth.tsx` file provides the authentication context used throughout the application.
3. The login and signup pages in `src/pages/auth/` use these services to authenticate users.
4. Token validation is handled by the `/auth/validate` endpoint and used on application startup to restore sessions.

### Configuration

For **development**, the API is configured to connect to `http://localhost:3000`.

For **production**, update the API target URL in `vite.config.ts`:
```ts
server: {
  proxy: {
    '/api': {
      target: 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

If needed, you can also update the `API_BASE_URL` in `src/services/auth-service.ts` to point to your API directly instead of using the proxy.

### Test Users

The backend includes these test users:

- Admin: admin@example.com / admin123
- Teacher: teacher@example.com / teacher123
- Student: student@example.com / student123

## Development

To start the development server:

```bash
npm run dev
```

This will start the frontend application and proxy API requests to `http://localhost:3000`. 