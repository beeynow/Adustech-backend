# Models

This application now uses **Prisma ORM** with **PostgreSQL**.

All models are defined in `prisma/schema.prisma`.

## Prisma Models

- **User** - Authentication, profiles, roles
- **Post** - Social posts
- **Comment** - Post comments
- **PostLike** - Post likes (many-to-many)
- **PostRepost** - Post reposts (many-to-many)
- **CommentLike** - Comment likes (many-to-many)
- **Channel** - Communication channels
- **ChannelMember** - Channel membership (many-to-many)
- **Event** - Time-bound events with TTL
- **Timetable** - Schedules with TTL
- **Session** - Express session storage

## Usage

Import the Prisma client in your controllers:

```javascript
const { prisma } = require('../config/db');

// Example: Find user
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Example: Create post
const post = await prisma.post.create({
  data: {
    userId: user.id,
    userName: user.name,
    text: 'Hello World',
    category: 'All'
  }
});
```

## Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (dev)
npx prisma db push

# Create migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

See `prisma/schema.prisma` for the complete data model.
