/**
 * Property-Based Tests for Menu Update Synchronization
 * 
 * **Feature: play-kids-platform, Property 3: Menu Update Synchronization**
 * **Validates: Requirements 4.4**
 * 
 * Property: For any menu update by admin, the public menu page should 
 * reflect the changes immediately after refresh.
 */

import fc from 'fast-check'
import { readData, writeData } from '../utils/db.js'
import { validateMenu } from '../routes/menu.js'

// Required days and meals as per design
const REQUIRED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

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

describe('Property 3: Menu Update Synchronization', () => {
  // Store original menu to restore after tests
  let originalMenu

  beforeAll(() => {
    originalMenu = readData('menu.json')
  })

  afterAll(() => {
    // Restore original menu after all tests
    if (originalMenu) {
      writeData('menu.json', originalMenu)
    }
  })

  /**
   * Property: For any valid menu update, reading the menu immediately after
   * should return the exact same data that was written.
   * 
   * This simulates the round-trip: admin updates menu -> public page reads menu
   */
  test('menu updates are immediately reflected when reading', () => {
    fc.assert(
      fc.property(validWeeklyMenuArb, (newMenu) => {
        // Validate the menu first (simulating backend validation)
        const validation = validateMenu(newMenu)
        if (!validation.valid) return true // Skip invalid menus
        
        // Write the new menu (simulating PUT /api/menu)
        const writeSuccess = writeData('menu.json', newMenu)
        if (!writeSuccess) return false
        
        // Read the menu back (simulating GET /api/menu)
        const readMenu = readData('menu.json')
        
        // The read menu should exactly match what was written
        // This validates Requirements 4.4: changes reflect immediately
        return JSON.stringify(readMenu) === JSON.stringify(newMenu)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any sequence of menu updates, the final read should
   * always return the last written menu.
   */
  test('sequential menu updates always reflect the latest version', () => {
    fc.assert(
      fc.property(
        fc.array(validWeeklyMenuArb, { minLength: 2, maxLength: 5 }),
        (menuUpdates) => {
          // Apply all menu updates in sequence
          for (const menu of menuUpdates) {
            const validation = validateMenu(menu)
            if (!validation.valid) continue
            writeData('menu.json', menu)
          }
          
          // Get the last valid menu
          const lastValidMenu = [...menuUpdates].reverse().find(m => validateMenu(m).valid)
          if (!lastValidMenu) return true // Skip if no valid menus
          
          // Read the current menu
          const currentMenu = readData('menu.json')
          
          // Should match the last written menu
          return JSON.stringify(currentMenu) === JSON.stringify(lastValidMenu)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: For any valid menu, all 7 days and all meals should be
   * preserved after write and read cycle.
   */
  test('all days and meals are preserved through write-read cycle', () => {
    fc.assert(
      fc.property(validWeeklyMenuArb, (newMenu) => {
        const validation = validateMenu(newMenu)
        if (!validation.valid) return true
        
        writeData('menu.json', newMenu)
        const readMenu = readData('menu.json')
        
        // Check all days are present
        for (const day of REQUIRED_DAYS) {
          if (!readMenu[day]) return false
          
          // Check all meals are present with correct data
          for (const meal of ['breakfast', 'lunch', 'snack']) {
            if (!readMenu[day][meal]) return false
            if (readMenu[day][meal].name !== newMenu[day][meal].name) return false
            if (JSON.stringify(readMenu[day][meal].allergies) !== 
                JSON.stringify(newMenu[day][meal].allergies)) return false
          }
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Allergy information is preserved exactly through the sync process.
   */
  test('allergy information is preserved exactly after sync', () => {
    fc.assert(
      fc.property(
        validWeeklyMenuArb,
        fc.constantFrom(...REQUIRED_DAYS),
        fc.constantFrom('breakfast', 'lunch', 'snack'),
        (menu, day, mealType) => {
          const validation = validateMenu(menu)
          if (!validation.valid) return true
          
          const originalAllergies = menu[day][mealType].allergies
          
          writeData('menu.json', menu)
          const readMenu = readData('menu.json')
          
          const readAllergies = readMenu[day][mealType].allergies
          
          // Allergies should be exactly preserved
          return JSON.stringify(originalAllergies) === JSON.stringify(readAllergies)
        }
      ),
      { numRuns: 100 }
    )
  })
})
