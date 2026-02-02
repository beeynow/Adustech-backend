# Department System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Migration
```bash
cd backend
npx prisma migrate dev --name add_department_system
npx prisma generate
```

### Step 2: Restart Server
```bash
npm start
```

### Step 3: Create Departments (Power Admin)

**Create Computer Science Department:**
```bash
POST /api/departments
{
  "name": "Computer Science",
  "code": "CSC",
  "description": "Department of Computer Science",
  "faculty": "Faculty of Science",
  "levels": ["100", "200", "300", "400", "500"]
}
```

**Create Mathematics Department:**
```bash
POST /api/departments
{
  "name": "Mathematics",
  "code": "MTH",
  "description": "Department of Mathematics",
  "faculty": "Faculty of Science",
  "levels": ["100", "200", "300", "400", "500"]
}
```

---

## 📱 Mobile App Integration

### 1. Fetch Departments
```javascript
const response = await fetch('https://your-api.com/api/departments');
const { departments } = await response.json();
```

### 2. User Selects Department & Level
```javascript
await fetch('https://your-api.com/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    department: 'Computer Science',
    level: '200'
  })
});
```

### 3. Create Department Post
```javascript
// For specific level
await fetch('https://your-api.com/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Class update for CSC 201',
    departmentId: 'dept_abc123',
    level: '200'  // Only 200 level students see this
  })
});

// For all levels in department
await fetch('https://your-api.com/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Department-wide announcement',
    departmentId: 'dept_abc123'
    // No level = all students in department see this
  })
});
```

### 4. View Department Posts
```javascript
// Get posts for user's department
const response = await fetch(
  `https://your-api.com/api/posts?departmentId=${userDepartmentId}&page=1&limit=20`
);
const { posts } = await response.json();
// Backend automatically filters by user's level
```

---

## 🎯 Post Visibility Rules

| Post Configuration | Who Sees It |
|-------------------|-------------|
| No `departmentId`, No `level` | **Everyone** (public post) |
| `departmentId` set, No `level` | **All students in that department** |
| `departmentId` + `level` set | **Only students in that department AND level** |

---

## 🔑 API Endpoints Summary

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department (power admin)
- `PUT /api/departments/:id` - Update department (power admin)
- `DELETE /api/departments/:id` - Delete department (power admin)

### Posts with Filtering
- `POST /api/posts` - Body: `{ departmentId?, level? }`
- `GET /api/posts?departmentId=xxx&level=xxx` - Filter posts

### Profile
- `PUT /api/profile` - Body: `{ department, level }`

---

## ✅ Testing Checklist

- [ ] Run migration successfully
- [ ] Create at least 2 departments
- [ ] Set user department and level
- [ ] Create public post (visible to all)
- [ ] Create department post (visible to department)
- [ ] Create level-specific post (visible to specific level)
- [ ] Verify filtering works correctly

---

## 🎓 Common Examples

### Example 1: CSC 200 Level Class Update
```json
POST /api/posts
{
  "text": "CSC 201 class moved to Room 405",
  "category": "Academic",
  "departmentId": "csc_dept_id",
  "level": "200"
}
```
**Result:** Only Computer Science 200 level students see this

### Example 2: CSC Department Meeting
```json
POST /api/posts
{
  "text": "Department meeting this Friday at 10 AM",
  "category": "Academic",
  "departmentId": "csc_dept_id"
}
```
**Result:** All Computer Science students (all levels) see this

### Example 3: University Announcement
```json
POST /api/posts
{
  "text": "University closed for holiday",
  "category": "General"
}
```
**Result:** Everyone sees this (public post)

---

## 💡 Tips

1. **Always set user's department/level** after registration
2. **Use level tags** for class-specific updates
3. **No department = public** post visible to everyone
4. **Empty level = all levels** in the department
5. **Validate department exists** before posting

---

## 📞 Support

See full documentation: `DEPARTMENT_SYSTEM_GUIDE.md`

---

*Quick Start Guide v1.0*
