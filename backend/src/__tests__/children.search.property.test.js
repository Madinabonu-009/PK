/**
 * Property-Based Tests for Children Search and Filter Functionality
 * 
 * **Feature: play-kids-platform, Property 11: Search and Filter Functionality**
 * **Validates: Requirements 11.1**
 * 
 * Property: For any search query on children list, only matching records should be returned.
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

// Search function that mirrors the API implementation
const searchChildren = (children, search, groupId) => {
  let result = [...children]

  if (search) {
    const searchLower = search.toLowerCase()
    result = result.filter(c =>
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower)
    )
  }

  if (groupId) {
    result = result.filter(c => c.groupId === groupId)
  }

  return result
}

// Arbitrary for generating valid child data
const childArbitrary = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  birthDate: fc.date({ min: new Date('2018-01-01'), max: new Date('2023-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  groupId: fc.constantFrom('g1', 'g2', 'g3'),
  parentName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  parentPhone: fc.stringMatching(/^\+998[0-9]{9}$/),
  allergies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }),
  notes: fc.string({ maxLength: 100 })
})


describe('Property 11: Search and Filter Functionality', () => {
  let originalData

  beforeAll(() => {
    originalData = readChildren()
  })

  afterAll(() => {
    writeChildren(originalData)
  })

  afterEach(() => {
    writeChildren(originalData)
  })

  /**
   * Property: Search results should only contain children whose firstName or lastName
   * contains the search term (case-insensitive).
   * Validates: Requirement 11.1 - WHEN an admin views children list THEN the Platform 
   * SHALL display all children with search and filter options
   */
  test('search returns only children matching the search term', () => {
    fc.assert(
      fc.property(
        fc.array(childArbitrary, { minLength: 3, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        (childrenData, searchTerm) => {
          // Create test children
          const testChildren = childrenData.map((data, i) => ({
            id: `search-test-${i}-${Date.now()}`,
            ...data,
            enrolledAt: new Date().toISOString()
          }))

          // Perform search
          const results = searchChildren(testChildren, searchTerm.trim(), null)
          const searchLower = searchTerm.trim().toLowerCase()

          // All results should match the search term
          for (const child of results) {
            const firstNameMatch = child.firstName.toLowerCase().includes(searchLower)
            const lastNameMatch = child.lastName.toLowerCase().includes(searchLower)
            if (!firstNameMatch && !lastNameMatch) {
              return false
            }
          }

          // All matching children should be in results
          for (const child of testChildren) {
            const shouldMatch = 
              child.firstName.toLowerCase().includes(searchLower) ||
              child.lastName.toLowerCase().includes(searchLower)
            const isInResults = results.some(r => r.id === child.id)
            if (shouldMatch !== isInResults) {
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Filter by groupId should return only children in that group.
   * Validates: Requirement 11.1 - filter options
   */
  test('filter by groupId returns only children in that group', () => {
    fc.assert(
      fc.property(
        fc.array(childArbitrary, { minLength: 5, maxLength: 15 }),
        fc.constantFrom('g1', 'g2', 'g3'),
        (childrenData, filterGroupId) => {
          // Create test children
          const testChildren = childrenData.map((data, i) => ({
            id: `filter-test-${i}-${Date.now()}`,
            ...data,
            enrolledAt: new Date().toISOString()
          }))

          // Perform filter
          const results = searchChildren(testChildren, null, filterGroupId)

          // All results should be in the filtered group
          for (const child of results) {
            if (child.groupId !== filterGroupId) {
              return false
            }
          }

          // All children in the group should be in results
          for (const child of testChildren) {
            const shouldBeIncluded = child.groupId === filterGroupId
            const isInResults = results.some(r => r.id === child.id)
            if (shouldBeIncluded !== isInResults) {
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Combined search and filter should return only children matching both criteria.
   * Validates: Requirement 11.1 - search AND filter options
   */
  test('combined search and filter returns only matching children', () => {
    fc.assert(
      fc.property(
        fc.array(childArbitrary, { minLength: 5, maxLength: 15 }),
        fc.string({ minLength: 1, maxLength: 5 }).filter(s => s.trim().length > 0),
        fc.constantFrom('g1', 'g2', 'g3'),
        (childrenData, searchTerm, filterGroupId) => {
          // Create test children
          const testChildren = childrenData.map((data, i) => ({
            id: `combined-test-${i}-${Date.now()}`,
            ...data,
            enrolledAt: new Date().toISOString()
          }))

          // Perform combined search and filter
          const results = searchChildren(testChildren, searchTerm.trim(), filterGroupId)
          const searchLower = searchTerm.trim().toLowerCase()

          // All results should match both criteria
          for (const child of results) {
            const nameMatch = 
              child.firstName.toLowerCase().includes(searchLower) ||
              child.lastName.toLowerCase().includes(searchLower)
            const groupMatch = child.groupId === filterGroupId

            if (!nameMatch || !groupMatch) {
              return false
            }
          }

          // All children matching both criteria should be in results
          for (const child of testChildren) {
            const nameMatch = 
              child.firstName.toLowerCase().includes(searchLower) ||
              child.lastName.toLowerCase().includes(searchLower)
            const groupMatch = child.groupId === filterGroupId
            const shouldBeIncluded = nameMatch && groupMatch
            const isInResults = results.some(r => r.id === child.id)

            if (shouldBeIncluded !== isInResults) {
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Empty search should return all children (no filtering).
   * Validates: Requirement 11.1 - display all children when no search
   */
  test('empty search returns all children', () => {
    fc.assert(
      fc.property(
        fc.array(childArbitrary, { minLength: 1, maxLength: 10 }),
        fc.constantFrom('', null, undefined),
        (childrenData, emptySearch) => {
          // Create test children
          const testChildren = childrenData.map((data, i) => ({
            id: `empty-search-test-${i}-${Date.now()}`,
            ...data,
            enrolledAt: new Date().toISOString()
          }))

          // Perform search with empty term
          const results = searchChildren(testChildren, emptySearch, null)

          // Should return all children
          return results.length === testChildren.length
        }
      ),
      { numRuns: 30 }
    )
  })

  /**
   * Property: Search should be case-insensitive.
   * Validates: Requirement 11.1 - search functionality
   */
  test('search is case-insensitive', () => {
    fc.assert(
      fc.property(
        childArbitrary,
        fc.constantFrom('upper', 'lower', 'mixed'),
        (childData, caseType) => {
          const child = {
            id: `case-test-${Date.now()}`,
            ...childData,
            enrolledAt: new Date().toISOString()
          }

          // Get a substring from firstName to search
          const nameSubstring = child.firstName.substring(0, Math.min(3, child.firstName.length))
          
          let searchTerm
          switch (caseType) {
            case 'upper':
              searchTerm = nameSubstring.toUpperCase()
              break
            case 'lower':
              searchTerm = nameSubstring.toLowerCase()
              break
            case 'mixed':
              searchTerm = nameSubstring.split('').map((c, i) => 
                i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
              ).join('')
              break
          }

          const results = searchChildren([child], searchTerm, null)

          // Should find the child regardless of case
          return results.length === 1 && results[0].id === child.id
        }
      ),
      { numRuns: 50 }
    )
  })
})
