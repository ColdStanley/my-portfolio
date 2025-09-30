/**
 * Manual Test Script for Quota System
 *
 * Run this script to test quota functionality
 * Usage: npx ts-node tests/quota.manual.test.ts
 */

const BASE_URL = 'http://localhost:3002'

// Generate random device ID for testing
const GUEST_DEVICE_ID = `test-device-${Date.now()}`

interface QuotaCheckResponse {
  plan: string
  used: number
  limit: number | null
  remaining: number | null
}

interface QuotaUseResponse {
  success: boolean
  message?: string
  remaining?: number | null
}

async function checkQuota(deviceId: string): Promise<QuotaCheckResponse> {
  const response = await fetch(`${BASE_URL}/api/swiftapply-quota/check?device_id=${deviceId}`)
  return await response.json()
}

async function useQuota(deviceId: string): Promise<QuotaUseResponse> {
  const response = await fetch(`${BASE_URL}/api/swiftapply-quota/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId })
  })
  return await response.json()
}

async function runTests() {
  console.log('🧪 Starting Quota System Tests...\n')

  let testsPassed = 0
  let testsFailed = 0

  // Test 1: Guest first call should succeed
  console.log('Test 1: Guest first call')
  try {
    const result = await useQuota(GUEST_DEVICE_ID)
    if (result.success && result.remaining === 2) {
      console.log('✅ PASS: First call succeeded, remaining: 2\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected success with remaining=2, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 2: Guest second call should succeed
  console.log('Test 2: Guest second call')
  try {
    const result = await useQuota(GUEST_DEVICE_ID)
    if (result.success && result.remaining === 1) {
      console.log('✅ PASS: Second call succeeded, remaining: 1\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected success with remaining=1, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 3: Guest third call should succeed
  console.log('Test 3: Guest third call')
  try {
    const result = await useQuota(GUEST_DEVICE_ID)
    if (result.success && result.remaining === 0) {
      console.log('✅ PASS: Third call succeeded, remaining: 0\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected success with remaining=0, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 4: Guest fourth call should fail
  console.log('Test 4: Guest fourth call (should fail)')
  try {
    const result = await useQuota(GUEST_DEVICE_ID)
    if (!result.success && result.message) {
      console.log('✅ PASS: Fourth call rejected with message:', result.message, '\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected failure, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 5: Check quota endpoint
  console.log('Test 5: Check quota endpoint')
  try {
    const result = await checkQuota(GUEST_DEVICE_ID)
    if (result.plan === 'guest' && result.used === 3 && result.limit === 3 && result.remaining === 0) {
      console.log('✅ PASS: Quota check shows correct state:', result, '\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected guest/3/3/0, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 6: New guest should have fresh quota
  console.log('Test 6: New guest device')
  const newDeviceId = `test-device-${Date.now()}`
  try {
    const result = await checkQuota(newDeviceId)
    if (result.plan === 'guest' && result.used === 0 && result.remaining === 3) {
      console.log('✅ PASS: New device has fresh quota:', result, '\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected guest/0/3/3, got:', result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Test 7: Payment endpoint returns 501
  console.log('Test 7: Payment endpoint (placeholder)')
  try {
    const response = await fetch(`${BASE_URL}/api/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const result = await response.json()
    if (!result.success && result.message === 'Payment not implemented' && response.status === 501) {
      console.log('✅ PASS: Payment endpoint returns correct placeholder\n')
      testsPassed++
    } else {
      console.log('❌ FAIL: Expected 501 with placeholder message, got:', response.status, result, '\n')
      testsFailed++
    }
  } catch (error) {
    console.log('❌ FAIL: Error:', error, '\n')
    testsFailed++
  }

  // Summary
  console.log('=' .repeat(50))
  console.log(`Tests Passed: ${testsPassed}`)
  console.log(`Tests Failed: ${testsFailed}`)
  console.log('=' .repeat(50))

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.')
  }
}

// Run tests
runTests().catch(console.error)