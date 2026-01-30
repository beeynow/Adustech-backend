const { PrismaClient } = require('@prisma/client');

// Create a singleton Prisma client instance
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Database connection function
const connectDB = async () => {
  try {
    // Test the connection with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        await prisma.$connect();
        console.log('✅ PostgreSQL Connected successfully');
        return;
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`⏳ Connection attempt ${attempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
    console.log('💡 The server will continue running. Database will connect on first request.');
    // Don't throw - allow server to start
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { connectDB, prisma };
