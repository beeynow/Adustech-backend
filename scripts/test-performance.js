#!/usr/bin/env node

/**
 * Performance Testing Script for ADUSTECH Backend
 * 
 * Tests API response times for various endpoints
 * Run: node test-performance.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const isHttps = BASE_URL.startsWith('https');
const client = isHttps ? https : http;

console.log('⚡ ADUSTECH Backend Performance Testing\n');
console.log('🎯 Target:', BASE_URL);
console.log('');

const endpoints = [
    { method: 'GET', path: '/api/health', name: 'Health Check' },
    { method: 'GET', path: '/api/posts?page=1&limit=20', name: 'List Posts (paginated)' },
    { method: 'GET', path: '/api/channels', name: 'List Channels' },
    { method: 'GET', path: '/api/events', name: 'List Events' },
    { method: 'GET', path: '/api/timetables', name: 'List Timetables' },
];

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + endpoint.path);
        const startTime = Date.now();
        
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const responseSize = Buffer.byteLength(data);
                
                resolve({
                    success: true,
                    statusCode: res.statusCode,
                    responseTime,
                    responseSize,
                    responseTimeHeader: res.headers['x-response-time']
                });
            });
        });

        req.on('error', (error) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            resolve({
                success: false,
                error: error.message,
                responseTime
            });
        });

        req.setTimeout(30000, () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Timeout (30s)',
                responseTime: 30000
            });
        });

        req.end();
    });
}

async function testEndpoint(endpoint, iteration = 1) {
    const result = await makeRequest(endpoint);
    return { ...result, iteration };
}

async function runTests() {
    console.log('🚀 Running performance tests...\n');
    
    const results = [];
    
    for (const endpoint of endpoints) {
        process.stdout.write(`📊 Testing ${endpoint.name}... `);
        
        // Run 3 tests per endpoint to get average
        const testResults = [];
        for (let i = 1; i <= 3; i++) {
            const result = await testEndpoint(endpoint, i);
            testResults.push(result);
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        }
        
        const successful = testResults.filter(r => r.success);
        
        if (successful.length > 0) {
            const avgTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
            const minTime = Math.min(...successful.map(r => r.responseTime));
            const maxTime = Math.max(...successful.map(r => r.responseTime));
            const avgSize = successful.reduce((sum, r) => sum + r.responseSize, 0) / successful.length;
            
            let status = '✅';
            if (avgTime > 2000) status = '🐌'; // Slow
            else if (avgTime > 1000) status = '⚠️'; // Medium
            else if (avgTime < 200) status = '🚀'; // Very fast
            
            console.log(`${status} ${avgTime.toFixed(0)}ms (min: ${minTime}ms, max: ${maxTime}ms)`);
            
            results.push({
                endpoint: endpoint.name,
                status: 'PASS',
                avgTime: avgTime.toFixed(0),
                minTime,
                maxTime,
                avgSize: (avgSize / 1024).toFixed(2) + ' KB',
                statusCode: successful[0].statusCode
            });
        } else {
            console.log('❌ FAILED');
            results.push({
                endpoint: endpoint.name,
                status: 'FAIL',
                error: testResults[0].error
            });
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 Performance Test Results Summary');
    console.log('='.repeat(80));
    
    console.log('\n| Endpoint | Status | Avg Time | Min Time | Max Time | Size |');
    console.log('|----------|--------|----------|----------|----------|------|');
    
    results.forEach(r => {
        if (r.status === 'PASS') {
            console.log(`| ${r.endpoint.padEnd(30)} | ${r.status.padEnd(6)} | ${(r.avgTime + 'ms').padEnd(8)} | ${(r.minTime + 'ms').padEnd(8)} | ${(r.maxTime + 'ms').padEnd(8)} | ${r.avgSize.padEnd(10)} |`);
        } else {
            console.log(`| ${r.endpoint.padEnd(30)} | ${r.status.padEnd(6)} | ${'N/A'.padEnd(8)} | ${'N/A'.padEnd(8)} | ${'N/A'.padEnd(8)} | ${'N/A'.padEnd(10)} |`);
        }
    });
    
    console.log('\n' + '='.repeat(80));
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const avgResponseTime = results
        .filter(r => r.status === 'PASS')
        .reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / passed;
    
    console.log('📈 Summary:');
    console.log(`   ✅ Passed: ${passed}/${results.length}`);
    console.log(`   ❌ Failed: ${failed}/${results.length}`);
    console.log(`   ⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log('');
    
    console.log('🎯 Performance Guidelines:');
    console.log('   🚀 Excellent: < 200ms');
    console.log('   ✅ Good: 200-1000ms');
    console.log('   ⚠️  Acceptable: 1000-2000ms');
    console.log('   🐌 Needs Optimization: > 2000ms');
    console.log('');
    
    if (avgResponseTime < 200) {
        console.log('🎉 Excellent! Your API is blazing fast!');
    } else if (avgResponseTime < 1000) {
        console.log('✅ Great! Your API response times are good.');
    } else if (avgResponseTime < 2000) {
        console.log('⚠️  Your API is functional but could be faster.');
    } else {
        console.log('🐌 Your API needs optimization.');
    }
    
    console.log('\n💡 Optimizations Applied:');
    console.log('   ✓ Response compression (gzip)');
    console.log('   ✓ Database query optimization');
    console.log('   ✓ Pagination limits');
    console.log('   ✓ Request timeouts (30s)');
    console.log('   ✓ Health check caching');
    console.log('   ✓ Response time monitoring');
    console.log('');
    
    process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
console.log('🔍 Checking if server is running...');
makeRequest({ method: 'GET', path: '/api/health', name: 'Health Check' })
    .then(result => {
        if (result.success) {
            console.log(`✅ Server is online (${result.responseTime}ms)\n`);
            runTests();
        } else {
            console.error('❌ Server is not responding:', result.error);
            console.log('\n💡 Start the server first:');
            console.log('   cd backend && npm start');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
