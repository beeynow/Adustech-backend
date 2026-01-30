# ADUSTECH Backend API

Production-ready Express.js backend API for ADUSTECH platform, optimized for Vercel serverless deployment.

## 🚀 Features

- **Authentication System**: Email verification with OTP, password reset, session management
- **Role-Based Access Control**: Power admin, admin, d-admin, and user roles
- **Content Management**: Posts, comments, likes, reposts with Cloudinary media storage
- **Channel System**: Auto-join department channels, public/private visibility
- **Events & Timetables**: Time-based content with TTL expiration
- **Security**: Rate limiting, helmet, CORS, NoSQL injection prevention, input validation
- **Session Management**: MongoDB session store for persistence across serverless functions
- **Production-Ready**: Proper error handling, logging, environment configuration

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB Atlas account (or MongoDB instance)
- Cloudinary account (for image/file uploads)
- Gmail account with App Password (for email notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update with your credentials:
   ```bash
   cp .env.example .env
   ```

   **Required Environment Variables:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `POWER_ADMIN_EMAIL`: Email address for power admin account
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `EMAIL_USER`: Gmail address for sending emails
   - `EMAIL_PASSWORD`: Gmail app password
   - `SESSION_SECRET`: Random 32+ character secret for sessions
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs
   - `FRONTEND_URL`: Your frontend application URL

## 🏃 Running Locally

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## 🌐 Deploying to Vercel

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Configure Environment Variables

In your Vercel dashboard or via CLI, add all environment variables from `.env`:

```bash
vercel env add MONGODB_URI
vercel env add POWER_ADMIN_EMAIL
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add SESSION_SECRET
vercel env add ALLOWED_ORIGINS
vercel env add FRONTEND_URL
```

**Important:** Make sure to set `NODE_ENV=production` in Vercel environment variables.

### Step 4: Deploy

```bash
vercel --prod
```

Or simply push to your connected Git repository (GitHub, GitLab, Bitbucket).

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /verify-otp` - Verify email OTP
- `POST /resend-otp` - Resend OTP
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /change-password` - Change password (authenticated)
- `POST /create-admin` - Create admin (power admin only)
- `GET /admins` - List all admins (power admin only)
- `POST /demote-admin` - Demote admin to user (power admin only)
- `GET /dashboard` - Dashboard data (authenticated)
- `GET /me` - Get current user

### Profile (`/api`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /profile/image` - Upload profile image

### Posts (`/api`)
- `GET /posts` - List posts (with pagination, search, category filter)
- `POST /posts` - Create post
- `GET /posts/:id` - Get single post
- `POST /posts/:id/like` - Toggle like
- `POST /posts/:id/repost` - Toggle repost
- `GET /posts/:id/comments` - List comments
- `POST /posts/:id/comments` - Add comment
- `POST /posts/:id/comments/:commentId/like` - Toggle comment like

### Channels (`/api`)
- `GET /channels` - List user's channels
- `POST /channels` - Create channel
- `GET /channels/:id` - Get channel details

### Events (`/api`)
- `GET /events` - List active events
- `POST /events` - Create event (admin only)
- `GET /events/:id` - Get event details

### Timetables (`/api`)
- `GET /timetables` - List active timetables
- `POST /timetables` - Create timetable (admin only)
- `GET /timetables/:id` - Get timetable details

### Health Check
- `GET /api/health` - API health status

## 🔒 Security Features

1. **Helmet**: Security headers
2. **Rate Limiting**: Prevents abuse (100 req/15min general, 10 req/15min for auth)
3. **CORS**: Configured allowed origins
4. **NoSQL Injection Prevention**: Input sanitization
5. **Input Validation**: express-validator on all routes
6. **Session Security**: Secure cookies, MongoDB session store
7. **Environment Variables**: No hardcoded credentials

## 🗃️ Database Models

- **User**: Authentication, profiles, roles
- **Post**: Social posts with comments, likes, reposts
- **Channel**: Communication channels with members
- **Event**: Time-bound events with TTL
- **Timetable**: Schedules with TTL expiration

## 📝 Environment Configuration

### Development
- `NODE_ENV=development`
- CORS allows all origins
- Detailed error messages
- Session cookies work over HTTP

### Production (Vercel)
- `NODE_ENV=production`
- CORS restricted to `ALLOWED_ORIGINS`
- Generic error messages
- Secure HTTPS-only cookies
- SameSite=none for cross-origin

## 🚨 Important Notes

1. **MongoDB Connection**: Use MongoDB Atlas or ensure your MongoDB instance is accessible from Vercel's infrastructure
2. **Session Store**: MongoDB sessions ensure persistence across serverless function invocations
3. **Cloudinary**: Required for image/PDF uploads (posts, events, timetables)
4. **Gmail App Password**: Regular Gmail password won't work - generate an app password
5. **CORS Origins**: Update `ALLOWED_ORIGINS` with your production frontend URL
6. **Session Secret**: Generate a strong random secret for production

## 🧪 Testing the API

Use tools like Postman, Insomnia, or curl:

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Register user
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 📊 Monitoring

Monitor your Vercel deployment:
- Function logs: Vercel Dashboard > Logs
- Analytics: Vercel Dashboard > Analytics
- MongoDB: MongoDB Atlas > Metrics

## 🐛 Troubleshooting

### Session not persisting
- Verify `MONGODB_URI` is set correctly
- Check `SESSION_SECRET` is configured
- Ensure cookies are allowed in frontend

### CORS errors
- Add frontend URL to `ALLOWED_ORIGINS`
- Verify `credentials: true` in frontend fetch/axios

### Email not sending
- Verify Gmail app password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Enable "Less secure app access" or use app password

### MongoDB connection timeout
- Whitelist Vercel IP ranges in MongoDB Atlas
- Or set to allow all IPs (0.0.0.0/0) for testing

## 📄 License

ISC

## 👥 Support

For issues and questions, contact the development team.
# Adustech-backend
