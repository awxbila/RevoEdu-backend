# Assignment Submission API Documentation

## Overview

Sistem submission assignment yang lengkap dengan fitur untuk student submit assignment dan lecturer untuk menerima, melihat, menilai, dan mereject submission.

## Database Schema

### Submission Model

```prisma
enum SubmissionStatus {
  SUBMITTED  // Default ketika student submit
  GRADED     // Setelah lecturer memberi nilai
  REJECTED   // Jika lecturer mereject submission
}

model Submission {
  id           String           @id @default(uuid())
  assignmentId String
  studentId    Int
  content      String
  status       SubmissionStatus @default(SUBMITTED)
  grade        Float?
  feedback     String?
  submittedAt  DateTime         @default(now())
  gradedAt     DateTime?

  @@unique([assignmentId, studentId])
}
```

---

## Endpoints untuk STUDENT

### 1. Submit Assignment

**POST** `/assignments/:id/submit`

Submit assignment baru. Status otomatis jadi `SUBMITTED`.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "content": "Link Google Drive atau jawaban text"
}
```

**Response (201):**

```json
{
  "id": "submission-uuid",
  "assignmentId": "assignment-uuid",
  "studentId": 1,
  "content": "Link Google Drive atau jawaban text",
  "status": "SUBMITTED",
  "grade": null,
  "feedback": null,
  "submittedAt": "2026-01-17T04:10:36.000Z",
  "gradedAt": null
}
```

---

### 2. Lihat Submission Detail

**GET** `/assignments/submission/:submissionId`

Student bisa lihat detail submission mereka sendiri, termasuk status, nilai, dan feedback dari lecturer.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "submission-uuid",
  "assignmentId": "assignment-uuid",
  "studentId": 1,
  "content": "Link Google Drive",
  "status": "GRADED",
  "grade": 85.5,
  "feedback": "Good work! But needs improvement in...",
  "submittedAt": "2026-01-17T04:10:36.000Z",
  "gradedAt": "2026-01-17T05:20:00.000Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignment": {
    "id": "assignment-uuid",
    "title": "Assignment 1",
    "course": {
      "id": 1,
      "title": "Course Title"
    }
  }
}
```

---

### 3. Lihat Assignment dengan Status Submission

**GET** `/assignments/my-assignments/course/:courseId`

Lihat semua assignment di course tertentu beserta status submission (sudah submit atau belum).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "id": "assignment-uuid-1",
    "title": "Assignment 1",
    "description": "Description",
    "courseId": 1,
    "course": {
      "id": 1,
      "title": "Course Title"
    },
    "createdAt": "2026-01-15T00:00:00.000Z",
    "updatedAt": "2026-01-15T00:00:00.000Z",
    "isSubmitted": true,
    "submission": {
      "id": "submission-uuid",
      "content": "Link Google Drive",
      "status": "GRADED",
      "grade": 85.5,
      "submittedAt": "2026-01-17T04:10:36.000Z"
    }
  },
  {
    "id": "assignment-uuid-2",
    "title": "Assignment 2",
    "description": "Description",
    "courseId": 1,
    "course": {
      "id": 1,
      "title": "Course Title"
    },
    "createdAt": "2026-01-16T00:00:00.000Z",
    "updatedAt": "2026-01-16T00:00:00.000Z",
    "isSubmitted": false,
    "submission": null
  }
]
```

---

## Endpoints untuk LECTURER

### 4. Lihat Semua Submission untuk Assignment

**GET** `/assignments/:id/submissions`

Lecturer bisa lihat semua submission dari student untuk assignment tertentu.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "assignment": {
    "id": "assignment-uuid",
    "title": "Assignment 1",
    "description": "Description"
  },
  "totalSubmissions": 15,
  "submissions": [
    {
      "id": "submission-uuid-1",
      "assignmentId": "assignment-uuid",
      "studentId": 1,
      "content": "Link Google Drive",
      "status": "SUBMITTED",
      "grade": null,
      "feedback": null,
      "submittedAt": "2026-01-17T04:10:36.000Z",
      "gradedAt": null,
      "student": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "submission-uuid-2",
      "assignmentId": "assignment-uuid",
      "studentId": 2,
      "content": "Another link",
      "status": "GRADED",
      "grade": 90,
      "feedback": "Excellent!",
      "submittedAt": "2026-01-17T03:00:00.000Z",
      "gradedAt": "2026-01-17T05:00:00.000Z",
      "student": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### 5. Lihat Detail Submission

**GET** `/assignments/submission/:submissionId`

Lecturer bisa lihat detail submission tertentu.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** (Sama seperti student submission detail)

---

### 6. Grade Submission (Beri Nilai)

**PATCH** `/assignments/submission/:submissionId/grade`

Lecturer memberi nilai pada submission. Status otomatis berubah jadi `GRADED`.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "grade": 85.5,
  "feedback": "Good work! But needs improvement in the analysis section."
}
```

**Validation:**

- `grade`: Number, required, min: 0, max: 100
- `feedback`: String, optional

**Response (200):**

```json
{
  "id": "submission-uuid",
  "assignmentId": "assignment-uuid",
  "studentId": 1,
  "content": "Link Google Drive",
  "status": "GRADED",
  "grade": 85.5,
  "feedback": "Good work! But needs improvement in the analysis section.",
  "submittedAt": "2026-01-17T04:10:36.000Z",
  "gradedAt": "2026-01-17T05:20:00.000Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignment": {
    "id": "assignment-uuid",
    "title": "Assignment 1"
  }
}
```

---

### 7. Reject Submission

**PATCH** `/assignments/submission/:submissionId/reject`

Lecturer mereject submission dengan memberikan feedback. Status berubah jadi `REJECTED`.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "feedback": "Please resubmit. The answer doesn't meet the requirements."
}
```

**Response (200):**

```json
{
  "id": "submission-uuid",
  "assignmentId": "assignment-uuid",
  "studentId": 1,
  "content": "Link Google Drive",
  "status": "REJECTED",
  "grade": null,
  "feedback": "Please resubmit. The answer doesn't meet the requirements.",
  "submittedAt": "2026-01-17T04:10:36.000Z",
  "gradedAt": "2026-01-17T05:20:00.000Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignment": {
    "id": "assignment-uuid",
    "title": "Assignment 1"
  }
}
```

---

## Status Submission

| Status      | Deskripsi                                       |
| ----------- | ----------------------------------------------- |
| `SUBMITTED` | Default status ketika student submit assignment |
| `GRADED`    | Status setelah lecturer memberi nilai (grade)   |
| `REJECTED`  | Status ketika lecturer mereject submission      |

---

## Flow Penggunaan

### Flow Student:

1. Student lihat assignment yang belum disubmit → `GET /assignments/my-assignments/course/:courseId`
2. Student submit assignment → `POST /assignments/:id/submit`
3. Student cek status submission → `GET /assignments/submission/:submissionId`
4. Student lihat nilai dan feedback (jika sudah dinilai) → status akan `GRADED` dengan field `grade` dan `feedback` terisi

### Flow Lecturer:

1. Lecturer lihat semua submission untuk assignment → `GET /assignments/:id/submissions`
2. Lecturer lihat detail submission tertentu → `GET /assignments/submission/:submissionId`
3. Lecturer pilih salah satu:
   - Beri nilai → `PATCH /assignments/submission/:submissionId/grade`
   - Reject → `PATCH /assignments/submission/:submissionId/reject`

---

## Error Responses

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Submission not found",
  "error": "Not Found"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Not your submission",
  "error": "Forbidden"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "grade must not be less than 0",
    "grade must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

---

## Constraints & Rules

1. **Unique Submission**: Satu student hanya bisa submit 1x per assignment (enforced by `@@unique([assignmentId, studentId])`)
2. **Permission**:
   - Student hanya bisa submit & lihat submission mereka sendiri
   - Lecturer hanya bisa lihat & grade submission dari assignment di course mereka sendiri
3. **Grade Range**: Nilai harus antara 0-100
4. **Auto Status**:
   - Submit → Status otomatis `SUBMITTED`
   - Grade → Status otomatis `GRADED`
   - Reject → Status otomatis `REJECTED`

---

## Testing Guide

### 1. Test Student Submit

```bash
# Login sebagai student
POST /auth/login
{
  "email": "student@example.com",
  "password": "password"
}

# Submit assignment
POST /assignments/{assignmentId}/submit
Authorization: Bearer {student_token}
{
  "content": "https://drive.google.com/file/..."
}
```

### 2. Test Lecturer Grade

```bash
# Login sebagai lecturer
POST /auth/login
{
  "email": "lecturer@example.com",
  "password": "password"
}

# Lihat submissions
GET /assignments/{assignmentId}/submissions
Authorization: Bearer {lecturer_token}

# Grade submission
PATCH /assignments/submission/{submissionId}/grade
Authorization: Bearer {lecturer_token}
{
  "grade": 85,
  "feedback": "Good work!"
}
```
