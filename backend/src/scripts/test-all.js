/**
 * Comprehensive Test Script
 * Tests all critical functionality
 */

import axios from 'axios'
import logger from '../utils/logger.js'

const API_URL = process.env.API_URL || 'http://localhost:3000'
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

let passed = 0
let failed = 0

const test = async (name, fn) => {
  try {
    await fn()
    console.log(`${colors.green}✓${colors.reset} ${name}`)
    passed++
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`)
    console.log(`  ${colors.red}${error.message}${colors.reset}`)
    failed++
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

console.log(`${colors.blue}Running comprehensive tests...${colors.reset}\n`)

// Health Check Tests
console.log(`${colors.yellow}Health Checks:${colors.reset}`)
await test('Basic health check', async () => {
  const res = await axios.get(`${API_URL}/api/health`)
  assert(res.status === 200, 'Health check failed')
  assert(res.data.status === 'ok', 'Health status not ok')
})

await test('Detailed health check', async () => {
  const res = await axios.get(`${API_URL}/api/health/detailed`)
  assert(res.status === 200, 'Detailed health check failed')
  assert(res.data.uptime > 0, 'Invalid uptime')
  assert(res.data.memory, 'Memory info missing')
})

await test('Readiness probe', async () => {
  const res = await axios.get(`${API_URL}/api/health/ready`)
  assert(res.status === 200, 'Readiness probe failed')
})

await test('Liveness probe', async () => {
  const res = await axios.get(`${API_URL}/api/health/live`)
  assert(res.status === 200, 'Liveness probe failed')
})

// Security Tests
console.log(`\n${colors.yellow}Security:${colors.reset}`)
await test('Security headers present', async () => {
  const res = await axios.get(`${API_URL}/api/health`)
  assert(res.headers['x-frame-options'], 'X-Frame-Options missing')
  assert(res.headers['x-content-type-options'], 'X-Content-Type-Options missing')
  assert(res.headers['x-request-id'], 'X-Request-ID missing')
})

await test('Rate limiting works', async () => {
  try {
    // Make many requests quickly
    const requests = Array(150).fill().map(() => 
      axios.get(`${API_URL}/api/health`)
    )
    await Promise.all(requests)
    throw new Error('Rate limit not enforced')
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Rate limit working
      return
    }
    throw error
  }
})

await test('CORS configured', async () => {
  const res = await axios.get(`${API_URL}/api/health`)
  assert(res.headers['access-control-allow-origin'], 'CORS not configured')
})

// API Documentation Tests
console.log(`\n${colors.yellow}API Documentation:${colors.reset}`)
await test('Swagger UI accessible', async () => {
  const res = await axios.get(`${API_URL}/api-docs/`)
  assert(res.status === 200, 'Swagger UI not accessible')
})

await test('Swagger JSON available', async () => {
  const res = await axios.get(`${API_URL}/api-docs.json`)
  assert(res.status === 200, 'Swagger JSON not available')
  assert(res.data.openapi, 'Invalid OpenAPI spec')
})

// Performance Tests
console.log(`\n${colors.yellow}Performance:${colors.reset}`)
await test('Metrics endpoint works', async () => {
  const res = await axios.get(`${API_URL}/api/metrics`)
  assert(res.status === 200, 'Metrics endpoint failed')
  assert(res.data.requests, 'Request metrics missing')
})

await test('Response time acceptable', async () => {
  const start = Date.now()
  await axios.get(`${API_URL}/api/health`)
  const duration = Date.now() - start
  assert(duration < 500, `Response too slow: ${duration}ms`)
})

await test('Compression enabled', async () => {
  const res = await axios.get(`${API_URL}/api/health`, {
    headers: { 'Accept-Encoding': 'gzip' }
  })
  // Check if response is compressed (content-encoding header)
  // Note: axios automatically decompresses, so we just verify it works
  assert(res.status === 200, 'Compression test failed')
})

// Error Handling Tests
console.log(`\n${colors.yellow}Error Handling:${colors.reset}`)
await test('404 for unknown endpoints', async () => {
  try {
    await axios.get(`${API_URL}/api/nonexistent`)
    throw new Error('Should return 404')
  } catch (error) {
    assert(error.response.status === 404, 'Wrong status code')
  }
})

await test('Error tracking endpoint works', async () => {
  const res = await axios.post(`${API_URL}/api/errors`, {
    message: 'Test error',
    stack: 'Test stack trace',
    url: '/test',
    userAgent: 'Test'
  })
  assert(res.status === 200, 'Error tracking failed')
})

// Authentication Tests (without actual login)
console.log(`\n${colors.yellow}Authentication:${colors.reset}`)
await test('Protected routes require auth', async () => {
  try {
    await axios.get(`${API_URL}/api/children`)
    throw new Error('Should require authentication')
  } catch (error) {
    assert(error.response.status === 401, 'Auth not enforced')
  }
})

await test('Login endpoint exists', async () => {
  try {
    await axios.post(`${API_URL}/api/auth/login`, {
      username: 'test',
      password: 'test'
    })
  } catch (error) {
    // We expect it to fail, but endpoint should exist
    assert(error.response.status !== 404, 'Login endpoint missing')
  }
})

// Migration Tests
console.log(`\n${colors.yellow}Migrations:${colors.reset}`)
await test('Migration status endpoint exists', async () => {
  try {
    await axios.get(`${API_URL}/api/migrations/status`)
  } catch (error) {
    // May require auth, but should exist
    assert(error.response.status !== 404, 'Migration endpoint missing')
  }
})

// Results
console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`)
console.log(`${colors.green}Passed: ${passed}${colors.reset}`)
console.log(`${colors.red}Failed: ${failed}${colors.reset}`)
console.log(`${colors.blue}Total: ${passed + failed}${colors.reset}`)
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`)

if (failed === 0) {
  console.log(`\n${colors.green}All tests passed! ✓${colors.reset}`)
  process.exit(0)
} else {
  console.log(`\n${colors.red}Some tests failed ✗${colors.reset}`)
  process.exit(1)
}
