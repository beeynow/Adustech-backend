# PostgreSQL Migration Guide

## ✅ Migration Status

Your backend has been migrated from MongoDB to PostgreSQL!

### What Changed:

1. **Database**: MongoDB → PostgreSQL
2. **ORM**: Mongoose → Prisma
3. **Session Store**: connect-mongo → connect-pg-simple
4. **Schema**: All models converted to Prisma schema

---

## 🚀 Getting Started

### 1. Get a Free PostgreSQL Database

Choose one of these providers (all have free tiers):

#### **Option A: Supabase (Recommended)**
1. Go to https://supabase.com
2. Create account and new project
3. Go to Settings → Database
4. Copy "Connection String" (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual password

#### **Option B: Vercel Postgres**
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the DATABASE_URL from environment variables

#### **Option C: Neon**
1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string

#### **Option D: Railway**
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string from variables

---

### 2. Configure Database URL

Update your `.env` file:

```bash
# Replace with your actual PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
```

---

### 3. Run Database Migrations

```bash
cd backend

# Generate Prisma Client (already done)
npx prisma generate

# Push schema to database (create tables)
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

## 📊 Database Schema

All your models have been converted:

- ✅ User (with authentication, profile, roles)
- ✅ Post (with likes, reposts, comments)
- ✅ Comment (with likes)
- ✅ Channel (with members)
- ✅ Event (with TTL-like expiration)
- ✅ Timetable (with TTL-like expiration)
- ✅ Session (for express-session)

---

## 🔧 Prisma Commands

```bash
# View database in browser
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Pull existing database schema
npx prisma db pull

# Push schema without migrations
npx prisma db push
```

---

## 🎯 Next Steps

1. Set up your PostgreSQL database (Supabase, Vercel, etc.)
2. Update `DATABASE_URL` in `.env`
3. Run `npx prisma db push` to create tables
4. Start the server with `npm run dev`
5. Test endpoints to verify everything works

---

## 📝 Notes

- **No IP Whitelisting**: Unlike MongoDB Atlas, most PostgreSQL providers don't require IP whitelisting
- **Connection Pooling**: Automatic with Prisma
- **Session Store**: Now uses PostgreSQL for session persistence
- **TTL Expiration**: Events and Timetables now use application-level expiration checks

---

## 🐛 Troubleshooting

### Connection Error
- Verify DATABASE_URL is correct
- Check database is accessible
- Ensure database exists

### Migration Error
- Run `npx prisma migrate reset` to start fresh
- Check Prisma schema syntax
- Verify DATABASE_URL format

### Prisma Client Error
- Run `npx prisma generate` again
- Restart your server
- Delete node_modules/.prisma and regenerate

---

**Ready to deploy? All PostgreSQL providers work seamlessly with Vercel!**
