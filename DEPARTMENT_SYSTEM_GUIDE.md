# ADUSTECH Department Channel System with Level-Based Access

## 🎯 Overview

The ADUSTECH backend now includes a comprehensive **Department Channel System** with **Level-Based Access Control**. This system allows:

1. **Power Admins** to create department channels (e.g., Computer Science, Mathematics)
2. **Each department** has levels: 100, 200, 300, 400, 500
3. **Posts** can be targeted to specific departments and levels
4. **Users** only see posts relevant to their department and level
5. **Privacy** - Department posts are only visible to students in that department

---

## 📚 Table of Contents

1. [Database Schema](#database-schema)
2. [Department Management](#department-management)
3. [Post Creation with Levels](#post-creation-with-levels)
4. [Post Filtering](#post-filtering)
5. [User Profile Updates](#user-profile-updates)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Use Cases](#use-cases)

---

## 🗄️ Database Schema

### Department Model

```prisma
model Department {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  name        String   @unique  // e.g., "Computer Science"
  code        String   @unique  // e.g., "CSC"
  description String   @default("")
  faculty     String   @default("")
  levels      String[] @default(["100", "200", "300", "400", "500"])
  isActive    Boolean  @default(true)
  
  createdById String
  createdBy   User     @relation("DepartmentCreator")
}
```

### User Model (Updated)

```prisma
model User {
  // ... other fields ...
  level        String @default("") // 100, 200, 300, 400, 500
  department   String @default("") // Department name
  
  @@index([department])
  @@index([level])
}
```

### Post Model (Updated)

```prisma
model Post {
  // ... other fields ...
  departmentId String @default("") // Department ID (empty = public)
  department   String @default("") // Department name
  level        String @default("") // Level: 100-500 (empty = all levels)
  
  @@index([departmentId])
  @@index([department])
  @@index([level])
}
```

---

## 🏢 Department Management

### Create Department (Power Admin Only)

**Endpoint:** `POST /api/departments`

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CSC",
  "description": "Department of Computer Science",
  "faculty": "Faculty of Science",
  "levels": ["100", "200", "300", "400", "500"]
}
```

**Response:**
```json
{
  "message": "Department channel created successfully",
  "department": {
    "id": "dept_123abc",
    "name": "Computer Science",
    "code": "CSC",
    "description": "Department of Computer Science",
    "faculty": "Faculty of Science",
    "levels": ["100", "200", "300", "400", "500"],
    "isActive": true,
    "createdAt": "2026-01-31T...",
    "createdBy": {
      "id": "user_xyz",
      "name": "Power Admin",
      "email": "admin@adustech.edu.ng"
    }
  }
}
```

### Get All Departments

**Endpoint:** `GET /api/departments`

**Query Parameters:**
- `isActive` (optional): `true` or `false`

**Response:**
```json
{
  "departments": [
    {
      "id": "dept_123abc",
      "name": "Computer Science",
      "code": "CSC",
      "levels": ["100", "200", "300", "400", "500"],
      "isActive": true
    },
    {
      "id": "dept_456def",
      "name": "Mathematics",
      "code": "MTH",
      "levels": ["100", "200", "300", "400", "500"],
      "isActive": true
    }
  ],
  "count": 2
}
```

### Update Department (Power Admin Only)

**Endpoint:** `PUT /api/departments/:id`

**Request Body:**
```json
{
  "name": "Computer Science & IT",
  "levels": ["100", "200", "300", "400", "500"],
  "isActive": true
}
```

### Delete Department (Power Admin Only)

**Endpoint:** `DELETE /api/departments/:id`

---

## 📝 Post Creation with Levels

### Create Public Post (No Department)

**Endpoint:** `POST /api/posts`

**Request Body:**
```json
{
  "text": "Welcome to ADUSTECH!",
  "category": "All"
}
```

This post is visible to **everyone**.

### Create Department-Specific Post (All Levels)

**Endpoint:** `POST /api/posts`

**Request Body:**
```json
{
  "text": "Important announcement for all Computer Science students!",
  "category": "Academic",
  "departmentId": "dept_123abc"
}
```

This post is visible to **all students in Computer Science** (all levels).

### Create Level-Specific Post

**Endpoint:** `POST /api/posts`

**Request Body:**
```json
{
  "text": "CSC 201 class has been rescheduled to 2 PM",
  "category": "Academic",
  "departmentId": "dept_123abc",
  "level": "200"
}
```

This post is visible **only to Computer Science students in level 200**.

---

## 🔍 Post Filtering

### Get Public Posts

**Endpoint:** `GET /api/posts?page=1&limit=20`

Returns only public posts (no department).

### Get Department Posts (All Levels)

**Endpoint:** `GET /api/posts?departmentId=dept_123abc&page=1&limit=20`

Returns all posts for the specified department.

### Get Level-Specific Posts

**Endpoint:** `GET /api/posts?departmentId=dept_123abc&level=200&page=1&limit=20`

Returns posts for the specified department and level.

### Automatic Filtering (User-Based)

When a user is authenticated, the system automatically filters posts based on their department and level:

```javascript
// User profile: { department: "Computer Science", level: "200" }
GET /api/posts?departmentId=dept_123abc

// Returns:
// - Posts with level = "200"
// - Posts with level = "" (all levels in department)
```

---

## 👤 User Profile Updates

### Set User's Department and Level

**Endpoint:** `PUT /api/profile`

**Request Body:**
```json
{
  "department": "Computer Science",
  "level": "200"
}
```

**Validation:**
- Level must be one of: `100`, `200`, `300`, `400`, `500`
- Department must be an existing active department

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_xyz",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Computer Science",
    "level": "200"
  }
}
```

---

## 🔌 API Endpoints

### Department Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **GET** | `/api/departments` | No | Any | Get all departments |
| **GET** | `/api/departments/:id` | No | Any | Get department by ID |
| **GET** | `/api/departments/:id/levels` | No | Any | Get department levels |
| **POST** | `/api/departments` | Yes | Power | Create department |
| **PUT** | `/api/departments/:id` | Yes | Power | Update department |
| **DELETE** | `/api/departments/:id` | Yes | Power | Delete department |
| **GET** | `/api/departments/:id/users` | Yes | Admin | Get users in department |

### Posts with Department/Level Filtering

| Method | Endpoint | Query Parameters | Description |
|--------|----------|------------------|-------------|
| **POST** | `/api/posts` | Body: `departmentId`, `level` | Create post |
| **GET** | `/api/posts` | `departmentId`, `level`, `page`, `limit` | List posts |

### Profile

| Method | Endpoint | Body Fields | Description |
|--------|----------|-------------|-------------|
| **PUT** | `/api/profile` | `department`, `level` | Update user department/level |

---

## 💻 Frontend Integration

### Step 1: Fetch Departments

```javascript
// Get all active departments
const response = await fetch('/api/departments?isActive=true');
const { departments } = await response.json();

// Display in dropdown
departments.forEach(dept => {
  console.log(`${dept.name} (${dept.code})`);
  console.log(`Levels: ${dept.levels.join(', ')}`);
});
```

### Step 2: User Sets Department and Level

```javascript
// Update user profile
await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    department: 'Computer Science',
    level: '200'
  })
});
```

### Step 3: Create Level-Specific Post

```javascript
// Post to Computer Science level 200
await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'CSC 201 class rescheduled',
    category: 'Academic',
    departmentId: 'dept_123abc',
    level: '200'
  })
});
```

### Step 4: View Department Posts

```javascript
// Get posts for user's department and level
const deptId = 'dept_123abc';
const response = await fetch(`/api/posts?departmentId=${deptId}&page=1&limit=20`);
const { posts } = await response.json();

// Filter by level on frontend (or let backend handle it)
const myLevelPosts = posts.filter(post => 
  post.level === userLevel || post.level === ''
);
```

---

## 🎬 Use Cases

### Use Case 1: Power Admin Creates Departments

1. Power admin logs in
2. Creates "Computer Science" department with levels 100-500
3. Creates "Mathematics" department with levels 100-500
4. All students can now see these departments

### Use Case 2: Student Sets Their Department

1. Student "John" logs in
2. Updates profile: `department = "Computer Science"`, `level = "200"`
3. John can now access CSC department channel

### Use Case 3: Department Admin Posts Class Update

1. Department admin for CSC logs in
2. Creates post with:
   - `departmentId`: Computer Science
   - `level`: "200"
   - `text`: "CSC 201 exam postponed to Friday"
3. Only CSC level 200 students see this post

### Use Case 4: University-Wide Announcement

1. Power admin creates post with:
   - No `departmentId` (public)
   - No `level`
   - `text`: "University closed for holiday"
2. All students see this post (public)

### Use Case 5: Department-Wide Announcement

1. Department admin creates post with:
   - `departmentId`: Computer Science
   - No `level` (empty = all levels)
   - `text`: "Department meeting on Monday"
2. All CSC students (all levels) see this post

---

## 📊 Post Visibility Matrix

| Post Type | Department | Level | Who Can See |
|-----------|------------|-------|-------------|
| **Public** | (none) | (none) | Everyone |
| **Department-Wide** | CSC | (none) | All CSC students |
| **Level-Specific** | CSC | 200 | Only CSC level 200 students |
| **Multi-Level** | CSC | 200, 300 | CSC level 200 & 300 students* |

*Note: Currently supports single level per post. Multi-level requires creating separate posts.

---

## 🔐 Permission Matrix

| Action | Power Admin | Admin | D-Admin | User |
|--------|------------|-------|---------|------|
| Create Department | ✅ | ❌ | ❌ | ❌ |
| Update Department | ✅ | ❌ | ❌ | ❌ |
| Delete Department | ✅ | ❌ | ❌ | ❌ |
| View Departments | ✅ | ✅ | ✅ | ✅ |
| Create Dept Post | ✅ | ✅ | ✅ | ❌ |
| View Dept Posts | ✅ | ✅ | ✅ | ✅ (if in dept) |
| Set Own Dept/Level | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Deployment Steps

### 1. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_department_system
```

Or for production:
```bash
npx prisma migrate deploy
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Restart Server

```bash
npm start
```

### 4. Create Initial Departments

Use the power admin account to create departments via API:

```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=..." \
  -d '{
    "name": "Computer Science",
    "code": "CSC",
    "description": "Department of Computer Science",
    "faculty": "Faculty of Science",
    "levels": ["100", "200", "300", "400", "500"]
  }'
```

---

## 🧪 Testing

### Test Department Creation

```bash
# Create department
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "code": "CSC",
    "levels": ["100", "200", "300", "400", "500"]
  }'
```

### Test Level-Specific Post

```bash
# Create post for CSC level 200
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "CSC 201 class update",
    "departmentId": "dept_123abc",
    "level": "200"
  }'
```

### Test Post Filtering

```bash
# Get posts for CSC level 200
curl "http://localhost:5000/api/posts?departmentId=dept_123abc&level=200"
```

---

## 📝 Frontend Mobile App Integration

### Example: Department Selection Screen

```javascript
// Fetch departments
const departments = await api.getDepartments();

// Show dropdown
<Picker selectedValue={userDept} onValueChange={setUserDept}>
  {departments.map(dept => (
    <Picker.Item label={dept.name} value={dept.name} key={dept.id} />
  ))}
</Picker>

// Show level dropdown
<Picker selectedValue={userLevel} onValueChange={setUserLevel}>
  <Picker.Item label="100 Level" value="100" />
  <Picker.Item label="200 Level" value="200" />
  <Picker.Item label="300 Level" value="300" />
  <Picker.Item label="400 Level" value="400" />
  <Picker.Item label="500 Level" value="500" />
</Picker>
```

### Example: Department Channel Feed

```javascript
// Get user's department posts
const { posts } = await api.getPosts({
  departmentId: user.departmentId,
  page: 1,
  limit: 20
});

// Display posts (automatically filtered by user's level)
posts.map(post => (
  <PostCard
    key={post.id}
    post={post}
    showLevelBadge={post.level !== ''}
  />
));
```

---

## ✅ Summary

The ADUSTECH Department Channel System provides:

✅ **Organized Communication** - Posts organized by department and level  
✅ **Privacy** - Level-specific posts only visible to intended students  
✅ **Flexibility** - Public, department-wide, or level-specific posts  
✅ **Easy Management** - Power admins control departments  
✅ **Scalability** - Supports unlimited departments and levels  
✅ **Production Ready** - Fully tested and documented  

**Status:** 🚀 Ready for Production Use

---

*Last Updated: 2026-01-31*  
*Version: 1.0.0*  
*ADUSTECH Backend Team*
