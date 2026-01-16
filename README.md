# LMS Backend API

Learning Management System (LMS) Backend built with **NestJS**, **Prisma**, and **PostgreSQL**.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## ✨ Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 👥 **User Management**: Support for STUDENT and LECTURER roles
- 📚 **Course Management**: Create, read, update, delete courses
- 📝 **Assignments**: Create and manage assignments for courses
- ✅ **Submissions**: Students can submit assignments
- 📊 **Enrollments**: Students can enroll to courses
- 🚀 **Swagger Documentation**: Interactive API docs
- ✔️ **E2E Testing**: Comprehensive test suite

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) 11.0
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/))
- **Git**

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd crack-be-awxbila/lms-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Then edit `.env` with your configuration (see [Configuration](#configuration) section)

## ⚙️ Configuration

Create a `.env` file in the project root based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms_db"

# JWT Secret (use a strong random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-me-in-production"

# Server
PORT=3000
NODE_ENV=development
```

### Environment Variables Explanation

| Variable       | Description                                  | Example                                        |
| -------------- | -------------------------------------------- | ---------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                 | `postgresql://user:pass@localhost:5432/lms_db` |
| `JWT_SECRET`   | Secret key for JWT signing                   | `your-secret-key`                              |
| `PORT`         | Server port                                  | `3000`                                         |
| `NODE_ENV`     | Environment (development/staging/production) | `development`                                  |

## 🗄️ Database Setup

1. **Create PostgreSQL database**

```bash
createdb lms_db
```

Or via PostgreSQL client:

```sql
CREATE DATABASE lms_db;
```

2. **Run Prisma migrations**

```bash
npm run prisma migrate dev
```

3. **Seed test data**

```bash
npm run prisma:seed
```

This will create:

- Test lecturer: `lecturer@example.com` / `password123`
- Test students: `student1@example.com` / `password123`
- Test courses: Node.js Fundamentals & React Advanced
- Enrollments and assignments

## 🏃 Running the Application

### Development Mode (with watch)

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Documentation

Once the server is running, visit:

**Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

-

### Authentication

1. Login to get JWT token:

```bash
POST /api/auth/login
{
  "email": "lecturer@example.com",
  "password": "password123"
}
```

2. Copy the `access_token` from response

3. In Swagger UI, click **Authorize** button (🔓) and paste:

```
Bearer <your_access_token>
```

### Core Endpoints

**Auth**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Courses**

- `GET /api/courses` - Get all courses (STUDENT, LECTURER)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (LECTURER only)
- `PATCH /api/courses/:id` - Update course (LECTURER only)
- `DELETE /api/courses/:id` - Delete course (LECTURER only)

**Enrollments**

- `POST /api/enrollments` - Enroll to course (STUDENT only)
- `GET /api/enrollments/me` - Get my enrollments (STUDENT)
- `GET /api/enrollments/course/:courseId` - Get students in course (LECTURER)

## ✅ Testing

### Run Unit Tests

```bash
npm run test
```

### Run Test in Watch Mode

```bash
npm run test:watch
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 🚀 Deployment

The application is deployed on Railway:

- **API URL**: https://revoedu-backend-production.up.railway.app
- **Swagger Docs**: https://revoedu-backend-production.up.railway.app/api-docs

## 📁 Project Structure

```
lms-backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── dto/                # Request DTOs
│   │   ├── guards/             # JWT & Roles guards
│   │   ├── strategies/         # Passport strategies
│   │   ├── decorators/         # Custom decorators
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── courses/                 # Courses module
│   │   ├── dto/
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   └── courses.module.ts
│   ├── enrollments/             # Enrollments module
│   │   ├── dto/
│   │   ├── enrollments.controller.ts
│   │   ├── enrollments.service.ts
│   │   └── enrollments.module.ts
│   ├── assignments/             # Assignments module
│   │   ├── dto/
│   │   ├── assignments.controller.ts
│   │   ├── assignments.service.ts
│   │   └── assignments.module.ts
│   ├── prisma/                  # Prisma service & module
│   ├── users/                   # Users module
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── app.controller.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Seed script
│   └── migrations/              # Database migrations
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example                 # Environment variables template
├── .eslintrc.js                 # ESLint configuration
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication
- **Role-Based Access Control (RBAC)**: Different permissions for STUDENT and LECTURER
- **Input Validation**: Class-validator for request validation
- **CORS Enabled**: Configured for development
- **Global Error Handling**: Centralized exception handling

## 🐛 Common Issues

### Database Connection Error

- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### Port Already in Use

```bash
# Kill process on port 3000
taskkill /F /IM node.exe  # Windows
lsof -ti :3000 | xargs kill -9  # Mac/Linux
```

### JWT Token Issues

- Make sure JWT_SECRET is set in `.env`
- Token format: `Bearer <token>` in Authorization header

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding!** 🚀
