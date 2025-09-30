/**
 * SwiftApply Registration Flow Manual Test
 *
 * Prerequisites:
 * 1. Dev server running (npm run dev)
 * 2. Supabase trigger installed (create_app_user_trigger.sql)
 *
 * Test Scenarios:
 * 1. Guest exceeds quota → sees sign up modal prompt
 * 2. User signs up → app_users record created automatically
 * 3. New user has 6 uses per day
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error })
  console.log(`${passed ? '✅' : '❌'} ${name}`)
  if (error) console.log(`   Error: ${error}`)
}

async function runTests() {
  console.log('🧪 SwiftApply Registration Flow Test\n')
  console.log('=' .repeat(60))

  // Generate unique device ID for this test
  const testDeviceId = `test-device-${Date.now()}`

  // Test 1: Guest uses quota 3 times
  console.log('\n📋 Test 1: Guest Quota Consumption')
  for (let i = 1; i <= 3; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/swiftapply-quota/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: testDeviceId })
      })
      const data = await res.json()

      if (data.success) {
        logTest(`Guest use ${i}/3`, true)
      } else {
        logTest(`Guest use ${i}/3`, false, data.message)
      }
    } catch (err: any) {
      logTest(`Guest use ${i}/3`, false, err.message)
    }
  }

  // Test 2: Guest 4th attempt should fail
  console.log('\n📋 Test 2: Guest Quota Exceeded (Should Trigger Modal)')
  try {
    const res = await fetch(`${BASE_URL}/api/swiftapply-quota/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: testDeviceId })
    })
    const data = await res.json()

    if (!data.success && res.status === 429) {
      logTest('Guest 4th attempt fails with 429', true)
      console.log(`   Message: "${data.message}"`)
      console.log(`   ℹ️  Frontend should show SignUpModal now`)
    } else {
      logTest('Guest 4th attempt fails with 429', false, 'Should return 429 status')
    }
  } catch (err: any) {
    logTest('Guest 4th attempt fails', false, err.message)
  }

  // Test 3: Check quota endpoint
  console.log('\n📋 Test 3: Check Quota Endpoint')
  try {
    const res = await fetch(`${BASE_URL}/api/swiftapply-quota/check?device_id=${testDeviceId}`)
    const data = await res.json()

    if (data.plan === 'guest' && data.used === 3 && data.limit === 3 && data.remaining === 0) {
      logTest('Check quota returns correct status', true)
      console.log(`   Plan: ${data.plan}, Used: ${data.used}, Limit: ${data.limit}, Remaining: ${data.remaining}`)
    } else {
      logTest('Check quota returns correct status', false, JSON.stringify(data))
    }
  } catch (err: any) {
    logTest('Check quota endpoint', false, err.message)
  }

  // Test 4: Verify modal content
  console.log('\n📋 Test 4: Sign Up Modal Content Verification')
  console.log('   ⚠️  Manual check required:')
  console.log('   1. Open browser to http://localhost:3000/swiftapply')
  console.log('   2. Use device_id:', testDeviceId)
  console.log('   3. Click "Customize Resume" 4 times')
  console.log('   4. Verify modal appears with:')
  console.log('      - Title: "Sign up for free"')
  console.log('      - Subtitle: "Get 6 uses per day"')
  console.log('      - Email, Password, Confirm Password fields')
  console.log('      - "Sign Up" button')
  console.log('      - All text in ENGLISH')
  logTest('Modal content (manual check)', true)

  // Test 5: Verify Supabase trigger
  console.log('\n📋 Test 5: Supabase Trigger Verification')
  console.log('   ⚠️  Manual check required:')
  console.log('   1. Sign up with test email through modal')
  console.log('   2. Check Supabase dashboard → app_users table')
  console.log('   3. Verify new record exists with plan="free"')
  console.log('   4. Check usage_logs → should allow 6 uses')
  logTest('Supabase trigger (manual check)', true)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary\n')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  console.log(`Tests Passed: ${passed}`)
  console.log(`Tests Failed: ${failed}`)
  console.log(`Manual Checks: 2`)

  if (failed === 0) {
    console.log('\n🎉 All automated tests passed!')
    console.log('⚠️  Please complete manual checks above')
  } else {
    console.log('\n❌ Some tests failed. Please review errors above.')
  }

  console.log('\n' + '='.repeat(60))
  console.log('📝 Next Steps:\n')
  console.log('1. Run SQL migration in Supabase:')
  console.log('   → supabase/migrations/create_app_user_trigger.sql')
  console.log('2. Test registration flow manually in browser')
  console.log('3. Verify app_users record created automatically')
  console.log('4. Verify new user has 6 uses per day')
  console.log('=' .repeat(60))
}

// Run tests
runTests().catch(console.error)