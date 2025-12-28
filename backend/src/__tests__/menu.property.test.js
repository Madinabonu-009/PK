/**
 * Property-Based Tests for Menu Data Completeness
 * 
 * **Feature: play-kids-platform, Property 2: Menu Data Completeness**
 * **Validates: Requirements 4.1, 4.2, 4.3**
 * 
 * Property: For any weekly menu data, all 7 days must have breakfast, 
 * lunch, and snack entries with allergy information.
 */

import fc from 'fast-check'
import { validateMenu } from '../routes/menu.js'

// Required days and meals as per design
const REQUIRED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const REQUIRED_MEALS = ['breakfast', 'lunch', 'snack']

// Arbitrary generators for menu data
const allergyArb = fc.array(
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 2, maxLength: 15 }),
  { minLength: 0, maxLength: 5 }
)

const mealArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  allergies: allergyArb
})

const dayMenuArb = fc.record({
  breakfast: mealArb,
  lunch: mealArb,
  snack: mealArb
})

const validWeeklyMenuArb = fc.record({
  monday: dayMenuArb,
  tuesday: dayMenuArb,
  wednesday: dayMenuArb,
  thursday: dayMenuArb,
  friday: dayMenuArb,
  saturday: dayMenuArb,
  sunday: dayMenuArb
})

describe('Property 2: Menu Data Completeness', () => {
  /**
   * Property: For any valid weekly menu, validation should pass
   * and all 7 days should have all 3 meals with allergy arrays.
   */
  test('valid menus with all days and meals pass validation', () => {
    fc.assert(
      fc.property(validWeeklyMenuArb, (menu) => {
        const result = validateMenu(menu)
        
        // Validation should pass
        if (!result.valid) return false
        if (result.errors.length > 0) return false
        
        // All 7 days should be present
        for (const day of REQUIRED_DAYS) {
          if (!menu[day]) return false
          
          // All 3 meals should be present for each day
          for (const meal of REQUIRED_MEALS) {
            if (!menu[day][meal]) return false
            if (typeof menu[day][meal].name !== 'string') return false
            if (!Array.isArray(menu[day][meal].allergies)) return false
          }
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any menu missing a day, validation should fail.
   */
  test('menus missing any day fail validation', () => {
    fc.assert(
      fc.property(
        validWeeklyMenuArb,
        fc.constantFrom(...REQUIRED_DAYS),
        (menu, dayToRemove) => {
          // Create a copy and remove one day
          const incompleteMenu = { ...menu }
          delete incompleteMenu[dayToRemove]
          
          const result = validateMenu(incompleteMenu)
          
          // Validation should fail
          return !result.valid && 
                 result.errors.some(e => e.toLowerCase().includes(dayToRemove))
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any menu missing a meal on any day, validation should fail.
   */
  test('menus missing any meal fail validation', () => {
    fc.assert(
      fc.property(
        validWeeklyMenuArb,
        fc.constantFrom(...REQUIRED_DAYS),
        fc.constantFrom(...REQUIRED_MEALS),
        (menu, day, mealToRemove) => {
          // Create a deep copy and remove one meal
          const incompleteMenu = JSON.parse(JSON.stringify(menu))
          delete incompleteMenu[day][mealToRemove]
          
          const result = validateMenu(incompleteMenu)
          
          // Validation should fail
          return !result.valid && 
                 result.errors.some(e => 
                   e.toLowerCase().includes(mealToRemove) && 
                   e.toLowerCase().includes(day)
                 )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any meal with invalid allergies (not an array), validation should fail.
   */
  test('meals with non-array allergies fail validation', () => {
    fc.assert(
      fc.property(
        validWeeklyMenuArb,
        fc.constantFrom(...REQUIRED_DAYS),
        fc.constantFrom(...REQUIRED_MEALS),
        fc.constantFrom(null, undefined, 'string', 123, {}),
        (menu, day, meal, invalidAllergies) => {
          // Create a deep copy and set invalid allergies
          const invalidMenu = JSON.parse(JSON.stringify(menu))
          invalidMenu[day][meal].allergies = invalidAllergies
          
          const result = validateMenu(invalidMenu)
          
          // Validation should fail
          return !result.valid
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any meal with empty or missing name, validation should fail.
   */
  test('meals with empty or missing name fail validation', () => {
    fc.assert(
      fc.property(
        validWeeklyMenuArb,
        fc.constantFrom(...REQUIRED_DAYS),
        fc.constantFrom(...REQUIRED_MEALS),
        fc.constantFrom('', '   ', null, undefined),
        (menu, day, meal, invalidName) => {
          // Create a deep copy and set invalid name
          const invalidMenu = JSON.parse(JSON.stringify(menu))
          invalidMenu[day][meal].name = invalidName
          
          const result = validateMenu(invalidMenu)
          
          // Validation should fail
          return !result.valid
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Null or non-object menus should fail validation.
   */
  test('null or non-object menus fail validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, '', 123, [], 'string'),
        (invalidMenu) => {
          const result = validateMenu(invalidMenu)
          return !result.valid && result.errors.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})
