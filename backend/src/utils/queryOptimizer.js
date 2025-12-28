/**
 * Query Optimizer Utilities
 * Issue #28: N+1 query prevention
 */

/**
 * Batch loader for preventing N+1 queries
 * Groups multiple individual queries into a single batch query
 */
export class BatchLoader {
  constructor(batchFn, options = {}) {
    this.batchFn = batchFn
    this.cache = new Map()
    this.batch = []
    this.batchPromise = null
    this.options = {
      maxBatchSize: options.maxBatchSize || 100,
      batchDelay: options.batchDelay || 10, // ms
      cacheEnabled: options.cacheEnabled !== false
    }
  }

  async load(key) {
    // Check cache first
    if (this.options.cacheEnabled && this.cache.has(key)) {
      return this.cache.get(key)
    }

    // Add to batch
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject })

      // Schedule batch execution
      if (!this.batchPromise) {
        this.batchPromise = new Promise((res) => {
          setTimeout(() => {
            this.executeBatch().then(res)
          }, this.options.batchDelay)
        })
      }
    })
  }

  async executeBatch() {
    const currentBatch = this.batch.splice(0, this.options.maxBatchSize)
    this.batchPromise = null

    if (currentBatch.length === 0) return

    try {
      const keys = currentBatch.map(item => item.key)
      const results = await this.batchFn(keys)

      // Map results back to requests
      currentBatch.forEach((item, index) => {
        const result = results[index]
        if (this.options.cacheEnabled) {
          this.cache.set(item.key, result)
        }
        item.resolve(result)
      })
    } catch (error) {
      currentBatch.forEach(item => item.reject(error))
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

/**
 * Populate helper - prevents N+1 by using MongoDB populate
 * @param {Query} query - Mongoose query
 * @param {Array} populateFields - Fields to populate
 */
export function optimizedPopulate(query, populateFields) {
  populateFields.forEach(field => {
    if (typeof field === 'string') {
      query.populate(field)
    } else {
      query.populate({
        path: field.path,
        select: field.select,
        match: field.match
      })
    }
  })
  return query
}

/**
 * Aggregation helper for complex queries
 * @param {Model} model - Mongoose model
 * @param {Object} options - Query options
 */
export async function optimizedAggregate(model, options) {
  const {
    match = {},
    lookup = [],
    project,
    sort,
    skip = 0,
    limit = 10
  } = options

  const pipeline = []

  // Match stage
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  // Lookup stages (joins)
  lookup.forEach(l => {
    pipeline.push({
      $lookup: {
        from: l.from,
        localField: l.localField,
        foreignField: l.foreignField || '_id',
        as: l.as
      }
    })
    
    // Unwind if single document expected
    if (l.unwind) {
      pipeline.push({
        $unwind: {
          path: `$${l.as}`,
          preserveNullAndEmptyArrays: l.preserveNull !== false
        }
      })
    }
  })

  // Project stage
  if (project) {
    pipeline.push({ $project: project })
  }

  // Sort stage
  if (sort) {
    pipeline.push({ $sort: sort })
  }

  // Pagination
  pipeline.push({ $skip: skip })
  pipeline.push({ $limit: limit })

  return model.aggregate(pipeline)
}

/**
 * Bulk operations helper
 * @param {Model} model - Mongoose model
 * @param {Array} operations - Array of operations
 */
export async function bulkWrite(model, operations) {
  if (operations.length === 0) return { ok: 1, nModified: 0 }
  
  return model.bulkWrite(operations, { ordered: false })
}

/**
 * Create batch update operations
 * @param {Array} items - Items to update
 * @param {Function} updateFn - Function that returns update object
 */
export function createBatchUpdates(items, updateFn) {
  return items.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: updateFn(item)
    }
  }))
}

export default {
  BatchLoader,
  optimizedPopulate,
  optimizedAggregate,
  bulkWrite,
  createBatchUpdates
}
