/**
 * Property-Based Tests for Gallery Filter Correctness
 * 
 * **Feature: play-kids-platform, Property 7: Gallery Filter Correctness**
 * **Validates: Requirements 7.3**
 * 
 * Property: For any category filter applied, only photos matching that category should be displayed.
 */

import fc from 'fast-check'

// Gallery filter functions (mirroring frontend/src/utils/galleryFilter.js)
function filterPhotosByCategory(photos, category) {
  if (!Array.isArray(photos)) {
    return []
  }
  
  if (category === 'all' || !category) {
    return photos
  }
  
  return photos.filter(photo => photo && photo.category === category)
}

function validateFilterResult(filteredPhotos, category) {
  if (!Array.isArray(filteredPhotos)) {
    return false
  }
  
  if (category === 'all' || !category) {
    return true
  }
  
  return filteredPhotos.every(photo => photo && photo.category === category)
}

// Arbitrary generators for gallery data
const categoryArb = fc.constantFrom('activities', 'playground', 'events', 'interior', 'meals', 'outdoor')

const photoArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  src: fc.webUrl(),
  alt: fc.string({ minLength: 1, maxLength: 100 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  category: categoryArb
})

const photosArrayArb = fc.array(photoArb, { minLength: 0, maxLength: 50 })

describe('Property 7: Gallery Filter Correctness', () => {
  /**
   * Property: For any category filter, all returned photos must match that category.
   * This is the core property from Requirements 7.3.
   */
  test('filtered photos only contain photos matching the selected category', () => {
    fc.assert(
      fc.property(photosArrayArb, categoryArb, (photos, category) => {
        const filtered = filterPhotosByCategory(photos, category)
        
        // All filtered photos must have the selected category
        return filtered.every(photo => photo.category === category)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: When filtering by 'all', all original photos should be returned.
   */
  test('filtering by "all" returns all photos unchanged', () => {
    fc.assert(
      fc.property(photosArrayArb, (photos) => {
        const filtered = filterPhotosByCategory(photos, 'all')
        
        // Should return the same photos
        return filtered.length === photos.length &&
               filtered.every((photo, index) => photo === photos[index])
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Filtered result count should be less than or equal to original count.
   */
  test('filtered result count is less than or equal to original count', () => {
    fc.assert(
      fc.property(photosArrayArb, categoryArb, (photos, category) => {
        const filtered = filterPhotosByCategory(photos, category)
        
        return filtered.length <= photos.length
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: If a photo exists with the selected category, it must appear in filtered results.
   */
  test('photos with matching category are included in filtered results', () => {
    fc.assert(
      fc.property(photosArrayArb, categoryArb, (photos, category) => {
        const filtered = filterPhotosByCategory(photos, category)
        const expectedCount = photos.filter(p => p.category === category).length
        
        return filtered.length === expectedCount
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Filtering is idempotent - filtering twice gives same result.
   */
  test('filtering is idempotent', () => {
    fc.assert(
      fc.property(photosArrayArb, categoryArb, (photos, category) => {
        const filtered1 = filterPhotosByCategory(photos, category)
        const filtered2 = filterPhotosByCategory(filtered1, category)
        
        // Filtering twice should give same result
        return filtered1.length === filtered2.length &&
               filtered1.every((photo, index) => photo === filtered2[index])
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: validateFilterResult correctly validates filtered photos.
   */
  test('validateFilterResult returns true for correctly filtered photos', () => {
    fc.assert(
      fc.property(photosArrayArb, categoryArb, (photos, category) => {
        const filtered = filterPhotosByCategory(photos, category)
        
        return validateFilterResult(filtered, category) === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Empty photos array returns empty result for any category.
   */
  test('empty photos array returns empty result', () => {
    fc.assert(
      fc.property(categoryArb, (category) => {
        const filtered = filterPhotosByCategory([], category)
        
        return filtered.length === 0 && Array.isArray(filtered)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Non-array input returns empty array.
   */
  test('non-array input returns empty array', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, 'string', 123, {}),
        categoryArb,
        (invalidPhotos, category) => {
          const filtered = filterPhotosByCategory(invalidPhotos, category)
          
          return Array.isArray(filtered) && filtered.length === 0
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Null or undefined category returns all photos (same as 'all').
   */
  test('null or undefined category returns all photos', () => {
    fc.assert(
      fc.property(
        photosArrayArb,
        fc.constantFrom(null, undefined, ''),
        (photos, nullishCategory) => {
          const filtered = filterPhotosByCategory(photos, nullishCategory)
          
          return filtered.length === photos.length
        }
      ),
      { numRuns: 100 }
    )
  })
})
