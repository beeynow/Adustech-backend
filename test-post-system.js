/**
 * Comprehensive Post System Test Script
 * Tests all CRUD operations, likes, reposts, comments, and edge cases
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER = {
    email: 'test@example.com',
    password: 'Test1234',
    name: 'Test User'
};

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper to log test results
function logTest(name, passed, error = null) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (error) console.log(`   Error: ${error}`);
    
    results.tests.push({ name, passed, error });
    if (passed) results.passed++;
    else results.failed++;
}

// API client with cookie support
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

let sessionCookie = '';
let testPostId = '';
let testCommentId = '';

// Test functions
async function testHealthCheck() {
    try {
        const res = await api.get('/health');
        logTest('Health Check', res.data.status === 'ok');
    } catch (error) {
        logTest('Health Check', false, error.message);
    }
}

async function testListPostsWithoutAuth() {
    try {
        const res = await api.get('/posts');
        const isValid = res.data.success === true && Array.isArray(res.data.posts);
        logTest('List Posts (No Auth)', isValid);
    } catch (error) {
        logTest('List Posts (No Auth)', false, error.message);
    }
}

async function testCreatePostWithoutAuth() {
    try {
        await api.post('/posts', { text: 'Test post' });
        logTest('Create Post Without Auth (Should Fail)', false, 'Should have been unauthorized');
    } catch (error) {
        const isUnauthorized = error.response?.status === 401;
        logTest('Create Post Without Auth (Should Fail)', isUnauthorized);
    }
}

async function testLoginUser() {
    try {
        const res = await api.post('/auth/login', TEST_USER);
        const cookies = res.headers['set-cookie'];
        if (cookies) {
            sessionCookie = cookies[0].split(';')[0];
            api.defaults.headers.Cookie = sessionCookie;
        }
        logTest('User Login', res.data.message?.includes('success') || res.data.user);
    } catch (error) {
        logTest('User Login', false, error.message);
    }
}

async function testCreatePostTextOnly() {
    try {
        const res = await api.post('/posts', {
            text: 'This is a bulletproof test post! 🚀',
            category: 'All'
        });
        testPostId = res.data.post?.id;
        logTest('Create Post (Text Only)', !!testPostId);
    } catch (error) {
        logTest('Create Post (Text Only)', false, error.response?.data?.message || error.message);
    }
}

async function testCreatePostEmpty() {
    try {
        await api.post('/posts', {});
        logTest('Create Empty Post (Should Fail)', false, 'Should have been rejected');
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Create Empty Post (Should Fail)', isBadRequest);
    }
}

async function testCreatePostTooLong() {
    try {
        const longText = 'A'.repeat(501);
        await api.post('/posts', { text: longText });
        logTest('Create Post Too Long (Should Fail)', false, 'Should have been rejected');
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Create Post Too Long (Should Fail)', isBadRequest);
    }
}

async function testCreatePostInvalidCategory() {
    try {
        await api.post('/posts', { 
            text: 'Test',
            category: 'InvalidCategory'
        });
        logTest('Create Post Invalid Category (Should Fail)', false, 'Should have been rejected');
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Create Post Invalid Category (Should Fail)', isBadRequest);
    }
}

async function testGetPost() {
    try {
        const res = await api.get(`/posts/${testPostId}`);
        const isValid = res.data.success && res.data.post?.id === testPostId;
        logTest('Get Single Post', isValid);
    } catch (error) {
        logTest('Get Single Post', false, error.response?.data?.message || error.message);
    }
}

async function testGetNonExistentPost() {
    try {
        await api.get('/posts/clzzzzzzzzzzzzzzzzzzzzzz');
        logTest('Get Non-Existent Post (Should Fail)', false, 'Should return 404');
    } catch (error) {
        const isNotFound = error.response?.status === 404;
        logTest('Get Non-Existent Post (Should Fail)', isNotFound);
    }
}

async function testLikePost() {
    try {
        const res = await api.post(`/posts/${testPostId}/like`);
        const isLiked = res.data.liked === true;
        logTest('Like Post', isLiked);
    } catch (error) {
        logTest('Like Post', false, error.response?.data?.message || error.message);
    }
}

async function testUnlikePost() {
    try {
        const res = await api.post(`/posts/${testPostId}/like`);
        const isUnliked = res.data.liked === false;
        logTest('Unlike Post', isUnliked);
    } catch (error) {
        logTest('Unlike Post', false, error.response?.data?.message || error.message);
    }
}

async function testRepostPost() {
    try {
        const res = await api.post(`/posts/${testPostId}/repost`);
        // Should fail because it's our own post
        const shouldFail = error.response?.status === 400;
        logTest('Repost Own Post (Should Fail)', shouldFail);
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Repost Own Post (Should Fail)', isBadRequest);
    }
}

async function testAddComment() {
    try {
        const res = await api.post(`/posts/${testPostId}/comments`, {
            text: 'This is a test comment! 💬'
        });
        testCommentId = res.data.comment?.id;
        logTest('Add Comment', !!testCommentId);
    } catch (error) {
        logTest('Add Comment', false, error.response?.data?.message || error.message);
    }
}

async function testAddEmptyComment() {
    try {
        await api.post(`/posts/${testPostId}/comments`, { text: '' });
        logTest('Add Empty Comment (Should Fail)', false, 'Should have been rejected');
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Add Empty Comment (Should Fail)', isBadRequest);
    }
}

async function testAddCommentTooLong() {
    try {
        const longText = 'A'.repeat(501);
        await api.post(`/posts/${testPostId}/comments`, { text: longText });
        logTest('Add Comment Too Long (Should Fail)', false, 'Should have been rejected');
    } catch (error) {
        const isBadRequest = error.response?.status === 400;
        logTest('Add Comment Too Long (Should Fail)', isBadRequest);
    }
}

async function testAddReplyToComment() {
    try {
        const res = await api.post(`/posts/${testPostId}/comments`, {
            text: 'This is a reply to a comment! 💬',
            parentId: testCommentId
        });
        const isValid = !!res.data.comment?.id;
        logTest('Add Reply to Comment', isValid);
    } catch (error) {
        logTest('Add Reply to Comment', false, error.response?.data?.message || error.message);
    }
}

async function testLikeComment() {
    try {
        const res = await api.post(`/posts/${testPostId}/comments/${testCommentId}/like`);
        const isLiked = res.data.liked === true;
        logTest('Like Comment', isLiked);
    } catch (error) {
        logTest('Like Comment', false, error.response?.data?.message || error.message);
    }
}

async function testUnlikeComment() {
    try {
        const res = await api.post(`/posts/${testPostId}/comments/${testCommentId}/like`);
        const isUnliked = res.data.liked === false;
        logTest('Unlike Comment', isUnliked);
    } catch (error) {
        logTest('Unlike Comment', false, error.response?.data?.message || error.message);
    }
}

async function testListComments() {
    try {
        const res = await api.get(`/posts/${testPostId}/comments`);
        const isValid = res.data.success && Array.isArray(res.data.comments);
        logTest('List Comments', isValid);
    } catch (error) {
        logTest('List Comments', false, error.response?.data?.message || error.message);
    }
}

async function testListPostsWithPagination() {
    try {
        const res = await api.get('/posts?page=1&limit=5');
        const isValid = res.data.success && 
                       res.data.pagination?.page === 1 &&
                       res.data.pagination?.limit === 5;
        logTest('List Posts with Pagination', isValid);
    } catch (error) {
        logTest('List Posts with Pagination', false, error.message);
    }
}

async function testListPostsWithSearch() {
    try {
        const res = await api.get('/posts?search=bulletproof');
        const isValid = res.data.success && Array.isArray(res.data.posts);
        logTest('List Posts with Search', isValid);
    } catch (error) {
        logTest('List Posts with Search', false, error.message);
    }
}

async function testListPostsWithCategory() {
    try {
        const res = await api.get('/posts?category=All');
        const isValid = res.data.success && Array.isArray(res.data.posts);
        logTest('List Posts with Category Filter', isValid);
    } catch (error) {
        logTest('List Posts with Category Filter', false, error.message);
    }
}

// Main test runner
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 BULLETPROOF POST SYSTEM TEST SUITE');
    console.log('='.repeat(60) + '\n');

    console.log('📋 Running Basic Tests...\n');
    await testHealthCheck();
    await testListPostsWithoutAuth();
    await testCreatePostWithoutAuth();

    console.log('\n🔐 Running Authentication Tests...\n');
    await testLoginUser();

    console.log('\n📝 Running Post Creation Tests...\n');
    await testCreatePostTextOnly();
    await testCreatePostEmpty();
    await testCreatePostTooLong();
    await testCreatePostInvalidCategory();

    console.log('\n📖 Running Post Retrieval Tests...\n');
    await testGetPost();
    await testGetNonExistentPost();

    console.log('\n👍 Running Like/Repost Tests...\n');
    await testLikePost();
    await testUnlikePost();
    await testRepostPost();

    console.log('\n💬 Running Comment Tests...\n');
    await testAddComment();
    await testAddEmptyComment();
    await testAddCommentTooLong();
    await testAddReplyToComment();
    await testLikeComment();
    await testUnlikeComment();
    await testListComments();

    console.log('\n🔍 Running Advanced Query Tests...\n');
    await testListPostsWithPagination();
    await testListPostsWithSearch();
    await testListPostsWithCategory();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Total:  ${results.passed + results.failed}`);
    console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
    console.log('='.repeat(60) + '\n');

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test suite crashed:', error);
    process.exit(1);
});
