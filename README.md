# Fermata Music Course Backend System

REST API backend system for Fermata Music Course management using Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (Admin, Teacher, Student, Parent)
- Course package management
- Student enrollment and scheduling
- Attendance tracking
- Make-up class management

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fermata-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root directory:
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Routes

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- GET `/api/users` - Get all users (Admin only)

### Packages
- GET `/api/packages` - Get all packages
- POST `/api/packages` - Create package (Admin)
- PUT `/api/packages/:id` - Update package (Admin)
- DELETE `/api/packages/:id` - Delete package (Admin)

### Student Packages
- POST `/api/student-packages` - Create enrollment (Admin)
- GET `/api/student-packages` - Get enrollments (Admin/Teacher)
- POST `/api/student-packages/:id/attendance` - Record attendance (Teacher)

## Database Models

- User (Admin, Teacher, Student, Parent)
- Package (Course packages)
- StudentPackage (Enrollments)

## Testing

Use Postman for API testing:
1. Import provided Postman collection
2. Set environment variables
3. Run requests

## Error Handling

The API uses standard HTTP status codes and returns error messages in JSON format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Security

- JWT authentication
- Password hashing
- Role-based access control
- Request validation
- Error handling middleware

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

