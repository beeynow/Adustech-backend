# 🐘 PostgreSQL Setup Guide

Your backend has been migrated from MongoDB to PostgreSQL!

## 🚀 Quick Start

### 1. Get a Free PostgreSQL Database

Choose one of these providers:

#### ⭐ Supabase (Recommended)
```
1. Go to https://supabase.com
2. Sign up and create new project
3. Wait for database to provision (~2 minutes)
4. Go to Settings → Database
5. Copy "Connection String" (URI format)
6. Replace [YOUR-PASSWORD] with your actual password
```

Example connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### 🔵 Vercel Postgres
```
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy DATABASE_URL from environment variables
```

#### 🟢 Neon (Serverless Postgres)
```
1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string
```

#### 🟣 Railway
```
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy DATABASE_URL from variables
```

---

### 2. Configure Your Backend

Update `backend/.env`:

```bash
# Replace with your actual PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
```

---

### 3. Initialize Database

```bash
cd backend

# Generate Prisma Client (if not done)
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name init
```

---

### 4. Start the Server

```bash
npm run dev
```

You should see:
```
✅ PostgreSQL Connected successfully
🚀 Server running on port 5000
```

---

## 🎯 Test the Migration

```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔧 Prisma Commands

```bash
# View database in browser
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Push schema without migrations (dev only)
npx prisma db push

# Pull schema from existing database
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format
```

---

## 📊 Database Schema

All tables are automatically created from `prisma/schema.prisma`:

- ✅ **User** - Authentication, profiles, roles
- ✅ **Post** - Social posts with text, images
- ✅ **Comment** - Comments on posts
- ✅ **PostLike** - Post likes (many-to-many)
- ✅ **PostRepost** - Post reposts (many-to-many)
- ✅ **CommentLike** - Comment likes (many-to-many)
- ✅ **Channel** - Communication channels
- ✅ **ChannelMember** - Channel membership (many-to-many)
- ✅ **Event** - Time-bound events with TTL-like expiration
- ✅ **Timetable** - Schedules with TTL-like expiration
- ✅ **Session** - Express session storage (connect-pg-simple)

---

## ✨ Advantages of PostgreSQL

### vs MongoDB:

1. **No IP Whitelisting** - Works from anywhere
2. **ACID Transactions** - Data consistency guaranteed
3. **Better Querying** - Powerful SQL, joins, aggregations
4. **Free Tier** - Generous free tiers from all providers
5. **Vercel Integration** - Native support, no configuration
6. **Type Safety** - Prisma generates TypeScript types
7. **Migrations** - Built-in schema version control
8. **Relations** - Proper foreign keys and constraints
9. **Performance** - Indexing, query optimization
10. **Tooling** - Prisma Studio, great DX

---

## 🐛 Troubleshooting

### Connection Error

**Problem:** `Can't reach database server`

**Solutions:**
- Verify DATABASE_URL is correct
- Check database is running
- Ensure no firewall blocking connection
- For Supabase: Replace [YOUR-PASSWORD] with actual password

### Prisma Client Error

**Problem:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
npm run dev
```

### Migration Error

**Problem:** `P3009: migrate found failed migrations`

**Solution:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### SSL Error

**Problem:** `self signed certificate`

**Solution:** Add `?sslmode=require` to DATABASE_URL

---

## 🔄 Migration Comparison

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| Setup | IP whitelist required | No restrictions |
| ORM | Mongoose | Prisma |
| Schema | Flexible | Strict (better for production) |
| Queries | MongoDB syntax | SQL (more powerful) |
| Relations | Manual refs | Built-in foreign keys |
| Migrations | Manual | Automatic |
| Type Safety | Runtime | Compile-time |
| Free Tier | 512MB | 500MB-2GB |
| Vercel | Requires config | Native support |

---

## 📝 Code Changes Summary

### What Changed:

1. **Models** - `models/*.js` → `prisma/schema.prisma`
2. **ORM** - Mongoose → Prisma
3. **Queries** - MongoDB queries → Prisma Client
4. **Sessions** - connect-mongo → connect-pg-simple
5. **IDs** - ObjectId → CUID (more URL-safe)

### API Compatibility:

✅ All endpoints work the same  
✅ Request/response formats unchanged  
✅ Authentication still session-based  
✅ No frontend changes required

---

## 🚀 Deploy to Vercel

PostgreSQL works seamlessly with Vercel:

```bash
# Deploy with Vercel Postgres
vercel

# Or link existing database
vercel env add DATABASE_URL production
```

All PostgreSQL providers work great with Vercel serverless functions!

---

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Docs](https://neon.tech/docs/introduction)

---

**🎉 Congratulations! Your backend now uses PostgreSQL!**

No more IP whitelist hassles. Better performance. Production-ready.
