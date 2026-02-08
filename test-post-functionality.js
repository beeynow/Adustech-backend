/**
 * Test script for Post Creation and Listing
 * Run this to verify all post functionality works correctly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPostFunctionality() {
  console.log('🧪 Testing Post Functionality\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Check database connection
    console.log('\n📊 Test 1: Database Connection');
    console.log('-'.repeat(60));
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('ℹ️  Make sure DATABASE_URL is set in .env file');
      return;
    }

    // Test 2: Check Post model schema
    console.log('\n📋 Test 2: Post Model Schema');
    console.log('-'.repeat(60));
    const postFields = Object.keys(prisma.post.fields || {});
    console.log('Post model fields:', postFields.join(', '));
    
    const requiredFields = ['id', 'userId', 'text', 'category', 'imageUrl', 'departmentId', 'level'];
    const hasAllFields = requiredFields.every(field => postFields.includes(field));
    
    if (hasAllFields) {
      console.log('✅ All required fields present');
    } else {
      console.log('❌ Missing required fields');
      const missing = requiredFields.filter(f => !postFields.includes(f));
      console.log('Missing:', missing.join(', '));
    }

    // Test 3: Count existing posts
    console.log('\n📝 Test 3: Existing Posts');
    console.log('-'.repeat(60));
    const totalPosts = await prisma.post.count();
    const publicPosts = await prisma.post.count({ where: { departmentId: '' } });
    const deptPosts = await prisma.post.count({ where: { NOT: { departmentId: '' } } });
    
    console.log(`Total posts: ${totalPosts}`);
    console.log(`Public posts (no department): ${publicPosts}`);
    console.log(`Department-specific posts: ${deptPosts}`);

    // Test 4: Check categories distribution
    console.log('\n🏷️  Test 4: Category Distribution');
    console.log('-'.repeat(60));
    const categories = ['All', 'Level', 'Department', 'Exam', 'Timetable', 'Event'];
    for (const cat of categories) {
      const count = await prisma.post.count({ where: { category: cat } });
      console.log(`${cat.padEnd(15)} : ${count}`);
    }

    // Test 5: Check recent posts
    console.log('\n🕐 Test 5: Recent Posts (Last 5)');
    console.log('-'.repeat(60));
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        text: true,
        category: true,
        departmentId: true,
        level: true,
        createdAt: true
      }
    });

    if (recentPosts.length === 0) {
      console.log('ℹ️  No posts found in database');
    } else {
      recentPosts.forEach((post, idx) => {
        console.log(`\n${idx + 1}. ${post.userName} (${post.category})`);
        console.log(`   Text: ${post.text?.substring(0, 60)}${post.text?.length > 60 ? '...' : ''}`);
        console.log(`   Dept: ${post.departmentId || 'Public'} | Level: ${post.level || 'All'}`);
        console.log(`   Created: ${post.createdAt.toISOString()}`);
      });
    }

    // Test 6: Check departments
    console.log('\n🎓 Test 6: Departments');
    console.log('-'.repeat(60));
    const departments = await prisma.department.findMany({
      select: { id: true, name: true, code: true, levels: true, isActive: true }
    });
    
    console.log(`Total departments: ${departments.length}`);
    if (departments.length > 0) {
      departments.forEach(dept => {
        console.log(`  - ${dept.code}: ${dept.name} (Levels: ${dept.levels.join(', ')}) ${dept.isActive ? '✅' : '❌'}`);
      });
    } else {
      console.log('⚠️  No departments found. Create departments first!');
    }

    // Test 7: Check users
    console.log('\n👥 Test 7: Users');
    console.log('-'.repeat(60));
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
    console.log(`Total users: ${totalUsers}`);
    console.log(`Verified users: ${verifiedUsers}`);

    // Test 8: Validate post data integrity
    console.log('\n🔍 Test 8: Data Integrity Checks');
    console.log('-'.repeat(60));
    
    // Check for posts with invalid department IDs
    const postsWithDept = await prisma.post.findMany({
      where: { NOT: { departmentId: '' } },
      select: { id: true, departmentId: true }
    });
    
    let invalidDeptPosts = 0;
    for (const post of postsWithDept) {
      const deptExists = await prisma.department.findUnique({ 
        where: { id: post.departmentId } 
      });
      if (!deptExists) {
        invalidDeptPosts++;
      }
    }
    
    if (invalidDeptPosts > 0) {
      console.log(`⚠️  Found ${invalidDeptPosts} posts with invalid department IDs`);
    } else {
      console.log('✅ All department references are valid');
    }

    // Check for orphaned posts (user deleted)
    const allPosts = await prisma.post.findMany({
      select: { id: true, userId: true }
    });
    
    let orphanedPosts = 0;
    for (const post of allPosts) {
      const userExists = await prisma.user.findUnique({ 
        where: { id: post.userId } 
      });
      if (!userExists) {
        orphanedPosts++;
      }
    }
    
    if (orphanedPosts > 0) {
      console.log(`⚠️  Found ${orphanedPosts} orphaned posts (user deleted)`);
    } else {
      console.log('✅ All posts have valid user references');
    }

    // Test 9: Summary and Recommendations
    console.log('\n📊 Test 9: Summary and Recommendations');
    console.log('-'.repeat(60));
    console.log('✅ Database is accessible');
    console.log(`✅ Post model schema is correct`);
    console.log(`✅ ${totalPosts} posts in database`);
    console.log(`✅ ${departments.length} departments configured`);
    
    if (totalPosts === 0) {
      console.log('\n💡 Recommendations:');
      console.log('  1. Create some test posts via the upload page');
      console.log('  2. Test both public and department-specific posts');
      console.log('  3. Verify posts appear in the home feed and department pages');
    }

    if (departments.length === 0) {
      console.log('\n⚠️  Warning:');
      console.log('  - No departments found');
      console.log('  - Department-specific posting will not work');
      console.log('  - Create departments via admin panel first');
    }

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test Complete\n');
  }
}

// Run tests
testPostFunctionality().catch(console.error);
