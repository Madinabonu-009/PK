/**
 * API Versioning Middleware
 * Supports version in URL path or header
 */

const CURRENT_VERSION = 'v1'
const SUPPORTED_VERSIONS = ['v1']
const DEPRECATED_VERSIONS = []

/**
 * Extract API version from request
 */
export const extractVersion = (req) => {
  // Check URL path: /api/v1/users
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//)
  if (pathMatch) {
    return pathMatch[1]
  }

  // Check header: API-Version: v1
  const headerVersion = req.get('API-Version')
  if (headerVersion) {
    return headerVersion
  }

  // Check Accept header: application/vnd.playkids.v1+json
  const accept = req.get('Accept')
  if (accept) {
    const acceptMatch = accept.match(/vnd\.playkids\.(v\d+)/)
    if (acceptMatch) {
      return acceptMatch[1]
    }
  }

  // Default to current version
  return CURRENT_VERSION
}

/**
 * API versioning middleware
 */
export const apiVersion = (req, res, next) => {
  const version = extractVersion(req)

  // Check if version is supported
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return res.status(400).json({
      error: 'Unsupported API version',
      code: 'UNSUPPORTED_VERSION',
      requestedVersion: version,
      supportedVersions: SUPPORTED_VERSIONS,
      currentVersion: CURRENT_VERSION
    })
  }

  // Warn about deprecated versions
  if (DEPRECATED_VERSIONS.includes(version)) {
    res.setHeader('Warning', `299 - "API version ${version} is deprecated. Please upgrade to ${CURRENT_VERSION}"`)
    res.setHeader('Sunset', getSunsetDate(version))
  }

  // Set version headers
  res.setHeader('API-Version', version)
  res.setHeader('API-Current-Version', CURRENT_VERSION)

  // Attach version to request
  req.apiVersion = version

  next()
}

/**
 * Version-specific route handler
 */
export const versionedRoute = (handlers) => {
  return (req, res, next) => {
    const version = req.apiVersion || CURRENT_VERSION
    const handler = handlers[version] || handlers.default

    if (!handler) {
      return res.status(501).json({
        error: 'Not implemented for this API version',
        version
      })
    }

    handler(req, res, next)
  }
}

/**
 * Get sunset date for deprecated version
 */
const getSunsetDate = (version) => {
  // Return date 6 months from now
  const date = new Date()
  date.setMonth(date.getMonth() + 6)
  return date.toUTCString()
}

/**
 * Version info endpoint
 */
export const versionInfo = (req, res) => {
  res.json({
    currentVersion: CURRENT_VERSION,
    supportedVersions: SUPPORTED_VERSIONS,
    deprecatedVersions: DEPRECATED_VERSIONS,
    changelog: {
      v1: {
        releaseDate: '2024-12-19',
        changes: [
          'Initial API release',
          'Authentication endpoints',
          'CRUD operations for all resources',
          'Real-time notifications'
        ]
      }
    }
  })
}

export default {
  apiVersion,
  versionedRoute,
  extractVersion,
  versionInfo
}
