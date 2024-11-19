# API Documentation

## Authentication Endpoints

### Sign In
```typescript
POST /auth/signin
Content-Type: application/json

Request:
{
  "email": string,
  "password": string
}

Response:
{
  "user": {
    "id": string,
    "email": string,
    "role": string
  },
  "session": {
    "access_token": string,
    "refresh_token": string
  }
}
```

### Sign Up
```typescript
POST /auth/signup
Content-Type: application/json

Request:
{
  "email": string,
  "password": string,
  "full_name": string
}

Response:
{
  "user": {
    "id": string,
    "email": string,
    "role": string
  },
  "session": {
    "access_token": string,
    "refresh_token": string
  }
}
```

## Profile Endpoints

### Get Profile
```typescript
GET /profiles/:id
Authorization: Bearer <token>

Response:
{
  "id": string,
  "user_id": string,
  "email": string,
  "username": string,
  "full_name": string,
  "avatar_url": string,
  "role": string,
  "streak": number,
  "exercises_done": number,
  "practice_time": number
}
```

### Update Profile
```typescript
PUT /profiles/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "username": string,
  "full_name": string,
  "avatar_url": string
}

Response:
{
  "id": string,
  "user_id": string,
  "email": string,
  "username": string,
  "full_name": string,
  "avatar_url": string,
  "role": string,
  "streak": number,
  "exercises_done": number,
  "practice_time": number
}
```

## Exercise Endpoints

### List Exercises
```typescript
GET /exercises
Authorization: Bearer <token>

Query Parameters:
- category: string
- difficulty: string
- search: string

Response:
{
  "exercises": [
    {
      "id": string,
      "title": string,
      "duration": string,
      "target_area": string,
      "description": string,
      "image_url": string,
      "video_url": string,
      "category": string,
      "difficulty": string,
      "instructions": string[],
      "benefits": string[]
    }
  ]
}
```

### Create Exercise
```typescript
POST /exercises
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "duration": string,
  "target_area": string,
  "description": string,
  "image_url": string,
  "video_url": string,
  "category": string,
  "difficulty": string,
  "instructions": string[],
  "benefits": string[]
}

Response:
{
  "id": string,
  "title": string,
  "duration": string,
  "target_area": string,
  "description": string,
  "image_url": string,
  "video_url": string,
  "category": string,
  "difficulty": string,
  "instructions": string[],
  "benefits": string[]
}
```

### Update Exercise
```typescript
PUT /exercises/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "duration": string,
  "target_area": string,
  "description": string,
  "image_url": string,
  "video_url": string,
  "category": string,
  "difficulty": string,
  "instructions": string[],
  "benefits": string[]
}

Response:
{
  "id": string,
  "title": string,
  "duration": string,
  "target_area": string,
  "description": string,
  "image_url": string,
  "video_url": string,
  "category": string,
  "difficulty": string,
  "instructions": string[],
  "benefits": string[]
}
```

### Delete Exercise
```typescript
DELETE /exercises/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

## Progress Endpoints

### List Progress
```typescript
GET /progress
Authorization: Bearer <token>

Response:
{
  "progress": [
    {
      "id": string,
      "user_id": string,
      "image_url": string,
      "notes": string,
      "created_at": string
    }
  ]
}
```

### Create Progress Entry
```typescript
POST /progress
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
- image: File
- notes: string

Response:
{
  "id": string,
  "user_id": string,
  "image_url": string,
  "notes": string,
  "created_at": string
}
```

### Delete Progress Entry
```typescript
DELETE /progress/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

## Course Endpoints

### List Courses
```typescript
GET /courses
Authorization: Bearer <token>

Response:
{
  "courses": [
    {
      "id": string,
      "title": string,
      "description": string,
      "image_url": string,
      "difficulty": string,
      "duration": string,
      "sections": [
        {
          "id": string,
          "title": string,
          "description": string,
          "order_index": number,
          "exercises": [
            {
              "id": string,
              "title": string,
              "duration": string
            }
          ]
        }
      ]
    }
  ]
}
```

### Create Course
```typescript
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "description": string,
  "image_url": string,
  "difficulty": string,
  "duration": string
}

Response:
{
  "id": string,
  "title": string,
  "description": string,
  "image_url": string,
  "difficulty": string,
  "duration": string
}
```

### Update Course
```typescript
PUT /courses/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "description": string,
  "image_url": string,
  "difficulty": string,
  "duration": string
}

Response:
{
  "id": string,
  "title": string,
  "description": string,
  "image_url": string,
  "difficulty": string,
  "duration": string
}
```

### Delete Course
```typescript
DELETE /courses/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

## AI Coach Endpoints

### Send Message
```typescript
POST /ai/chat
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "message": string
}

Response:
{
  "response": string,
  "thread_id": string
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": string
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "details": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "details": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```