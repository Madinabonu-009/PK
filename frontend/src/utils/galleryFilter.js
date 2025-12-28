/**
 * Gallery Filter Utility
 * 
 * Provides filtering functionality for gallery photos by category.
 * Used by GalleryGrid component and tested via property-based tests.
 */

/**
 * Filters photos by category
 * @param {Array} photos - Array of photo objects with category property
 * @param {string} category - Category to filter by, or 'all' for no filtering
 * @returns {Array} Filtered array of photos
 */
export function filterPhotosByCategory(photos, category) {
  if (!Array.isArray(photos)) {
    return []
  }
  
  if (category === 'all' || !category) {
    return photos
  }
  
  return photos.filter(photo => photo && photo.category === category)
}

/**
 * Validates that all filtered photos match the specified category
 * @param {Array} filteredPhotos - Array of filtered photos
 * @param {string} category - Expected category
 * @returns {boolean} True if all photos match the category
 */
export function validateFilterResult(filteredPhotos, category) {
  if (!Array.isArray(filteredPhotos)) {
    return false
  }
  
  if (category === 'all' || !category) {
    return true
  }
  
  return filteredPhotos.every(photo => photo && photo.category === category)
}

/**
 * Gets unique categories from photos array
 * @param {Array} photos - Array of photo objects
 * @returns {Array} Array of unique category strings
 */
export function getUniqueCategories(photos) {
  if (!Array.isArray(photos)) {
    return []
  }
  
  const categories = new Set()
  photos.forEach(photo => {
    if (photo && photo.category) {
      categories.add(photo.category)
    }
  })
  
  return Array.from(categories)
}
