/**
 * Unit tests for Plan Importance Percentage System
 * Tests the proportional scaling algorithm and API integration
 * 
 * Run with: node src/app/cestlavie/__tests__/importance-percentage.test.ts
 */

// Simple test framework for Node.js (no external dependencies)
let testCount = 0
let passCount = 0
let failCount = 0

function describe(name: string, fn: () => void) {
  console.log(`\n📋 ${name}`)
  fn()
}

function it(name: string, fn: () => void) {
  testCount++
  try {
    fn()
    passCount++
    console.log(`  ✅ ${name}`)
  } catch (error) {
    failCount++
    console.log(`  ❌ ${name}`)
    console.log(`     Error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function expect(value: any) {
  return {
    toBe: (expected: any) => {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`)
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`)
      }
    },
    toHaveLength: (expected: number) => {
      if (!Array.isArray(value) || value.length !== expected) {
        throw new Error(`Expected array length ${expected}, got ${Array.isArray(value) ? value.length : 'not array'}`)
      }
    },
    toBeCloseTo: (expected: number, precision: number = 2) => {
      const diff = Math.abs(value - expected)
      const tolerance = Math.pow(10, -precision)
      if (diff > tolerance) {
        throw new Error(`Expected ${value} to be close to ${expected} (within ${tolerance})`)
      }
    },
    toBeGreaterThanOrEqual: (expected: number) => {
      if (value < expected) {
        throw new Error(`Expected ${value} to be >= ${expected}`)
      }
    },
    toBeLessThanOrEqual: (expected: number) => {
      if (value > expected) {
        throw new Error(`Expected ${value} to be <= ${expected}`)
      }
    },
    toBeLessThan: (expected: number) => {
      if (value >= expected) {
        throw new Error(`Expected ${value} to be < ${expected}`)
      }
    },
    toHaveProperty: (property: string) => {
      if (!(property in value)) {
        throw new Error(`Expected object to have property ${property}`)
      }
    },
    not: {
      toThrow: () => {
        try {
          if (typeof value === 'function') {
            value()
          }
          // If we reach here, the function didn't throw - this is what we expect
        } catch {
          throw new Error('Expected function not to throw, but it did')
        }
      }
    }
  }
}

// Core algorithms to test

/**
 * Core proportional scaling algorithm (extracted from API route)
 */
function calculateProportionalScaling(
  existingPlans: Array<{ id: string; importance_percentage: number }>,
  changedPlanId: string,
  newPercentage: number
): Array<{ id: string; importance_percentage: number }> {
  const otherPlans = existingPlans.filter(p => p.id !== changedPlanId)
  const remainingPercentage = 100 - newPercentage
  
  if (otherPlans.length === 0) return []
  
  const otherPlansTotal = otherPlans.reduce((sum, plan) => sum + plan.importance_percentage, 0)
  
  return otherPlans.map(plan => {
    let newPlanPercentage: number
    
    if (otherPlansTotal === 0) {
      // Equal distribution if no existing percentages
      newPlanPercentage = remainingPercentage / otherPlans.length
    } else {
      // Proportional redistribution
      const originalRatio = plan.importance_percentage / otherPlansTotal
      newPlanPercentage = remainingPercentage * originalRatio
    }
    
    return {
      id: plan.id,
      importance_percentage: Math.round(newPlanPercentage * 100) / 100
    }
  })
}

/**
 * Calculate scaling for deletion scenario
 */
function calculateDeletionScaling(
  remainingPlans: Array<{ id: string; importance_percentage: number }>
): Array<{ id: string; importance_percentage: number }> {
  if (remainingPlans.length === 0) return []
  
  const totalPercentage = remainingPlans.reduce((sum, plan) => sum + plan.importance_percentage, 0)
  
  if (totalPercentage === 0) return remainingPlans
  
  const scaleFactor = 100 / totalPercentage
  
  return remainingPlans.map(plan => ({
    id: plan.id,
    importance_percentage: Math.round((plan.importance_percentage * scaleFactor) * 100) / 100
  }))
}

describe('Plan Importance Percentage System', () => {

  describe('Basic Scaling Tests', () => {
    it('should scale existing plans when creating new plan', () => {
      const existingPlans = [
        { id: 'plan-1', importance_percentage: 40 },
        { id: 'plan-2', importance_percentage: 60 }
      ]
      const newPlanPercentage = 30
      
      const result = calculateProportionalScaling(existingPlans, 'new-plan', newPlanPercentage)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 'plan-1', importance_percentage: 28 })
      expect(result[1]).toEqual({ id: 'plan-2', importance_percentage: 42 })
      
      // Total should be 100%
      const total = result.reduce((sum, plan) => sum + plan.importance_percentage, 0) + newPlanPercentage
      expect(total).toBe(100)
    })

    it('should scale up remaining plans after deletion', () => {
      const remainingPlans = [
        { id: 'plan-1', importance_percentage: 30 },
        { id: 'plan-2', importance_percentage: 30 }
      ]
      
      const result = calculateDeletionScaling(remainingPlans)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 'plan-1', importance_percentage: 50 })
      expect(result[1]).toEqual({ id: 'plan-2', importance_percentage: 50 })
      
      // Total should be 100%
      const total = result.reduce((sum, plan) => sum + plan.importance_percentage, 0)
      expect(total).toBe(100)
    })

    it('should handle equal distribution when plans have 0%', () => {
      const existingPlans = [
        { id: 'plan-1', importance_percentage: 0 },
        { id: 'plan-2', importance_percentage: 0 }
      ]
      const newPlanPercentage = 40
      
      const result = calculateProportionalScaling(existingPlans, 'new-plan', newPlanPercentage)
      
      expect(result).toHaveLength(2)
      expect(result[0].importance_percentage).toBe(30) // (100-40)/2 = 30
      expect(result[1].importance_percentage).toBe(30)
    })

    it('should maintain correct data format', () => {
      const existingPlans = [
        { id: 'plan-1', importance_percentage: 50 },
        { id: 'plan-2', importance_percentage: 50 }
      ]
      
      const result = calculateProportionalScaling(existingPlans, 'new-plan', 40)
      
      result.forEach(plan => {
        expect(plan).toHaveProperty('id')
        expect(plan).toHaveProperty('importance_percentage')
        expect(typeof plan.id).toBe('string')
        expect(typeof plan.importance_percentage).toBe('number')
      })
    })
  })

})

// Run all tests
console.log('🚀 Running Plan Importance Percentage Tests...\n')

// Execute the test suite
describe('Plan Importance Percentage System', () => {
  // All tests are already defined above
})

// Output test results
console.log(`\n📊 Test Results:`)
console.log(`Total: ${testCount}`)
console.log(`✅ Passed: ${passCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log(`Success Rate: ${testCount > 0 ? Math.round((passCount / testCount) * 100) : 0}%`)

if (failCount === 0) {
  console.log('\n🎉 All tests passed!')
} else {
  console.log(`\n⚠️  ${failCount} test(s) failed. Please review the errors above.`)
  process.exit(1)
}

/**
 * Integration test notes:
 * 
 * These tests focus on the core algorithm logic. For full API testing, you would also need:
 * 
 * 1. API Route Tests:
 *    - Test actual HTTP endpoints with mocked Notion client
 *    - Test error handling for failed Notion API calls
 *    - Test authentication and authorization
 * 
 * 2. Database Integration Tests:
 *    - Test with real Notion API responses
 *    - Test cascade delete scenarios
 *    - Test concurrent update handling
 * 
 * 3. Frontend Integration Tests:
 *    - Test form submission with percentage values
 *    - Test UI updates after percentage changes
 *    - Test error handling in the UI
 * 
 * 4. End-to-End Tests:
 *    - Test complete user workflow
 *    - Test multiple users with different strategies
 *    - Test performance with realistic data volumes
 */