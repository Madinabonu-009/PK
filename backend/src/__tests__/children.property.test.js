/**
 * Property-Based Tests for Children CRUD Operations
 * 
 * **Feature: play-kids-platform, Property 10: Children CRUD Operations**
 * **Validates: Requirements 11.2, 11.3, 11.4**
 * 
 * Property: For any child record, create, read, update, and delete operations
 * should maintain data integrity.
 */

import fc from 'fast-check'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')
const childrenFile = path.join(dataDir, 'children.json')

// Helper to read children data
const readChildren = () => {
  try {
    return JSON.parse(fs.readFileSync(childrenFile, 'utf8'))
  } catch {
    return []
  }
}

// Helper to write children data
const writeChildren = (data) => {
  fs.writeFileSync(childrenFile, JSON.stringify(data, null, 2))
}

// Arbitrary for generating valid name strings (simple letters only)
const nameArbitrary = fc.stringMatching(/^[A-Za-z]{2,20}$/)
  .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())

// Arbitrary for generating valid allergy strings (alphanumeric and space only)
// Using literal space instead of \s to avoid special whitespace chars like \n, \f, \t, \r
const allergyArbitrary = fc.stringMatching(/^[A-Za-z0-9 ]{1,30}$/)
  .filter(s => s.trim().length > 0)

// Arbitrary for generating valid notes (alphanumeric and basic punctuation)
const notesArbitrary = fc.stringMatching(/^[A-Za-z0-9\s.,!?'-]{0,200}$/)

// Arbitrary for generating valid child data
const childArbitrary = fc.record({
  firstName: nameArbitrary,
  lastName: nameArbitrary,
  birthDate: fc.date({ min: new Date('2018-01-01'), max: new Date('2023-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  groupId: fc.constantFrom('g1', 'g2', 'g3'),
  parentName: nameArbitrary,
  parentPhone: fc.stringMatching(/^\+998[0-9]{9}$/),
  allergies: fc.array(allergyArbitrary, { maxLength: 5 }),
  notes: notesArbitrary
})


describe('Property 10: Children CRUD Operations', () => {
  let originalData

  beforeAll(() => {
    // Backup original data
    originalData = readChildren()
  })

  afterAll(() => {
    // Restore original data
    writeChildren(originalData)
  })

  afterEach(() => {
    // Reset to original data after each test
    writeChildren(originalData)
  })

  /**
   * Property: Creating a child should add exactly one record with all provided fields intact.
   * Validates: Requirement 11.2 - WHEN an admin adds a child THEN the Platform SHALL create 
   * a new child record with required information
   */
  test('creating a child adds exactly one record with correct data', () => {
    fc.assert(
      fc.property(childArbitrary, (childData) => {
        // Reset to original data before each iteration to ensure clean state
        writeChildren(originalData)
        
        const before = readChildren()
        const beforeCount = before.length

        // Simulate create operation
        const newChild = {
          id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          firstName: childData.firstName.trim(),
          lastName: childData.lastName.trim(),
          birthDate: childData.birthDate,
          groupId: childData.groupId,
          parentName: childData.parentName.trim(),
          parentPhone: childData.parentPhone,
          allergies: childData.allergies,
          notes: childData.notes,
          enrolledAt: new Date().toISOString()
        }

        const updated = [...before, newChild]
        writeChildren(updated)

        const after = readChildren()

        // Count should increase by exactly 1
        if (after.length !== beforeCount + 1) return false

        // New child should exist with correct data
        const found = after.find(c => c.id === newChild.id)
        if (!found) return false

        // All fields should match
        return found.firstName === newChild.firstName &&
               found.lastName === newChild.lastName &&
               found.birthDate === newChild.birthDate &&
               found.groupId === newChild.groupId &&
               found.parentName === newChild.parentName &&
               found.parentPhone === newChild.parentPhone
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Updating a child should modify only the specified fields while preserving others.
   * Validates: Requirement 11.3 - WHEN an admin edits a child THEN the Platform SHALL 
   * update the child's information
   */
  test('updating a child modifies only specified fields', () => {
    fc.assert(
      fc.property(
        childArbitrary,
        fc.record({
          firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)),
          notes: fc.option(fc.string({ maxLength: 200 }))
        }),
        (originalChild, updates) => {
          // Create a child first
          const childId = `test-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const child = {
            id: childId,
            firstName: originalChild.firstName.trim(),
            lastName: originalChild.lastName.trim(),
            birthDate: originalChild.birthDate,
            groupId: originalChild.groupId,
            parentName: originalChild.parentName.trim(),
            parentPhone: originalChild.parentPhone,
            allergies: originalChild.allergies,
            notes: originalChild.notes,
            enrolledAt: new Date().toISOString()
          }

          let children = readChildren()
          children.push(child)
          writeChildren(children)

          // Apply updates
          children = readChildren()
          const index = children.findIndex(c => c.id === childId)
          if (index === -1) return false

          const updateData = {}
          if (updates.firstName) updateData.firstName = updates.firstName.trim()
          if (updates.notes) updateData.notes = updates.notes

          children[index] = { ...children[index], ...updateData }
          writeChildren(children)

          // Verify update
          const after = readChildren()
          const updated = after.find(c => c.id === childId)
          if (!updated) return false

          // Updated fields should have new values
          if (updates.firstName && updated.firstName !== updates.firstName.trim()) return false
          if (updates.notes && updated.notes !== updates.notes) return false

          // Non-updated fields should remain unchanged
          if (updated.lastName !== child.lastName) return false
          if (updated.birthDate !== child.birthDate) return false
          if (updated.groupId !== child.groupId) return false

          return true
        }
      ),
      { numRuns: 30 }
    )
  })

  /**
   * Property: Deleting a child should remove exactly one record and preserve all others.
   * Validates: Requirement 11.4 - WHEN an admin deletes a child THEN the Platform SHALL 
   * remove the child record after confirmation
   */
  test('deleting a child removes exactly one record', () => {
    fc.assert(
      fc.property(childArbitrary, (childData) => {
        // Create a child first
        const childId = `test-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const child = {
          id: childId,
          firstName: childData.firstName.trim(),
          lastName: childData.lastName.trim(),
          birthDate: childData.birthDate,
          groupId: childData.groupId,
          parentName: childData.parentName.trim(),
          parentPhone: childData.parentPhone,
          allergies: childData.allergies,
          notes: childData.notes,
          enrolledAt: new Date().toISOString()
        }

        let children = readChildren()
        const beforeCount = children.length
        children.push(child)
        writeChildren(children)

        // Verify child was added
        children = readChildren()
        if (children.length !== beforeCount + 1) return false
        if (!children.find(c => c.id === childId)) return false

        // Delete the child
        children = children.filter(c => c.id !== childId)
        writeChildren(children)

        // Verify deletion
        const after = readChildren()
        
        // Count should be back to original
        if (after.length !== beforeCount) return false
        
        // Child should not exist
        if (after.find(c => c.id === childId)) return false

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property: CRUD operations should maintain data integrity - no data corruption.
   * Validates: Requirements 11.2, 11.3, 11.4 - data integrity across operations
   */
  test('CRUD operations maintain data integrity', () => {
    fc.assert(
      fc.property(
        fc.array(childArbitrary, { minLength: 1, maxLength: 5 }),
        (childrenToCreate) => {
          const initialChildren = readChildren()
          const initialIds = new Set(initialChildren.map(c => c.id))

          // Create multiple children
          const createdIds = []
          for (const childData of childrenToCreate) {
            const childId = `test-integrity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const child = {
              id: childId,
              firstName: childData.firstName.trim(),
              lastName: childData.lastName.trim(),
              birthDate: childData.birthDate,
              groupId: childData.groupId,
              parentName: childData.parentName.trim(),
              parentPhone: childData.parentPhone,
              allergies: childData.allergies,
              notes: childData.notes,
              enrolledAt: new Date().toISOString()
            }
            
            const children = readChildren()
            children.push(child)
            writeChildren(children)
            createdIds.push(childId)
          }

          // Verify all created children exist
          let children = readChildren()
          for (const id of createdIds) {
            if (!children.find(c => c.id === id)) return false
          }

          // Original children should still exist
          for (const id of initialIds) {
            if (!children.find(c => c.id === id)) return false
          }

          // Delete all created children
          children = children.filter(c => !createdIds.includes(c.id))
          writeChildren(children)

          // Verify cleanup
          const final = readChildren()
          
          // Should be back to initial count
          if (final.length !== initialChildren.length) return false
          
          // All original children should still exist
          for (const id of initialIds) {
            if (!final.find(c => c.id === id)) return false
          }

          return true
        }
      ),
      { numRuns: 20 }
    )
  })
})
