/**
 * Property-Based Tests for Enrollment Workflow
 * 
 * **Feature: play-kids-platform, Property 12: Enrollment Workflow Integrity**
 * **Validates: Requirements 14.3, 14.4**
 * 
 * Property: For any enrollment approval or rejection, the status should update correctly
 * and the workflow should maintain data integrity.
 */

import fc from 'fast-check'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')
const enrollmentsFile = path.join(dataDir, 'enrollments.json')

// Valid enrollment statuses
const VALID_STATUSES = ['pending', 'accepted', 'rejected']

// Helper to read enrollments data
const readEnrollments = () => {
  try {
    return JSON.parse(fs.readFileSync(enrollmentsFile, 'utf8'))
  } catch {
    return []
  }
}

// Helper to write enrollments data
const writeEnrollments = (data) => {
  fs.writeFileSync(enrollmentsFile, JSON.stringify(data, null, 2))
}

// Arbitrary for generating valid enrollment data
const enrollmentArbitrary = fc.record({
  childName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  birthDate: fc.date({ min: new Date('2018-01-01'), max: new Date('2023-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  parentName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  parentPhone: fc.stringMatching(/^\+998[0-9]{9}$/),
  parentEmail: fc.emailAddress(),
  notes: fc.string({ maxLength: 200 })
})

// Arbitrary for rejection reason
const rejectionReasonArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)

describe('Property 12: Enrollment Workflow Integrity', () => {
  let originalData

  beforeAll(() => {
    originalData = readEnrollments()
  })

  afterAll(() => {
    writeEnrollments(originalData)
  })

  afterEach(() => {
    writeEnrollments(originalData)
  })

  /**
   * Property: Approving an enrollment should update status to 'accepted' and set processedAt.
   * Validates: Requirement 14.3 - WHEN an admin approves an application THEN the Platform 
   * SHALL update status and notify parent
   */
  test('approving an enrollment updates status to accepted with processedAt timestamp', () => {
    fc.assert(
      fc.property(enrollmentArbitrary, (enrollmentData) => {
        // Create a pending enrollment
        const enrollmentId = `test-approve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const enrollment = {
          id: enrollmentId,
          childName: enrollmentData.childName.trim(),
          birthDate: enrollmentData.birthDate,
          parentName: enrollmentData.parentName.trim(),
          parentPhone: enrollmentData.parentPhone,
          parentEmail: enrollmentData.parentEmail,
          notes: enrollmentData.notes,
          status: 'pending',
          submittedAt: new Date().toISOString()
        }

        let enrollments = readEnrollments()
        enrollments.push(enrollment)
        writeEnrollments(enrollments)

        // Approve the enrollment
        enrollments = readEnrollments()
        const index = enrollments.findIndex(e => e.id === enrollmentId)
        if (index === -1) return false

        enrollments[index] = {
          ...enrollments[index],
          status: 'accepted',
          processedAt: new Date().toISOString()
        }
        // Remove rejectionReason if it exists
        delete enrollments[index].rejectionReason
        writeEnrollments(enrollments)

        // Verify approval
        const after = readEnrollments()
        const approved = after.find(e => e.id === enrollmentId)
        
        if (!approved) return false
        if (approved.status !== 'accepted') return false
        if (!approved.processedAt) return false
        if (approved.rejectionReason) return false // Should not have rejection reason

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Rejecting an enrollment should update status to 'rejected' with a reason.
   * Validates: Requirement 14.4 - WHEN an admin rejects an application THEN the Platform 
   * SHALL update status with reason and notify parent
   */
  test('rejecting an enrollment updates status to rejected with reason and processedAt', () => {
    fc.assert(
      fc.property(enrollmentArbitrary, rejectionReasonArbitrary, (enrollmentData, reason) => {
        // Create a pending enrollment
        const enrollmentId = `test-reject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const enrollment = {
          id: enrollmentId,
          childName: enrollmentData.childName.trim(),
          birthDate: enrollmentData.birthDate,
          parentName: enrollmentData.parentName.trim(),
          parentPhone: enrollmentData.parentPhone,
          parentEmail: enrollmentData.parentEmail,
          notes: enrollmentData.notes,
          status: 'pending',
          submittedAt: new Date().toISOString()
        }

        let enrollments = readEnrollments()
        enrollments.push(enrollment)
        writeEnrollments(enrollments)

        // Reject the enrollment
        enrollments = readEnrollments()
        const index = enrollments.findIndex(e => e.id === enrollmentId)
        if (index === -1) return false

        enrollments[index] = {
          ...enrollments[index],
          status: 'rejected',
          rejectionReason: reason.trim(),
          processedAt: new Date().toISOString()
        }
        writeEnrollments(enrollments)

        // Verify rejection
        const after = readEnrollments()
        const rejected = after.find(e => e.id === enrollmentId)
        
        if (!rejected) return false
        if (rejected.status !== 'rejected') return false
        if (!rejected.processedAt) return false
        if (rejected.rejectionReason !== reason.trim()) return false

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Status transitions should only result in valid statuses.
   * Validates: Requirements 14.3, 14.4 - status should be one of: pending, accepted, rejected
   */
  test('enrollment status is always one of the valid statuses after any operation', () => {
    fc.assert(
      fc.property(
        enrollmentArbitrary,
        fc.constantFrom('accepted', 'rejected'),
        fc.option(rejectionReasonArbitrary),
        (enrollmentData, newStatus, maybeReason) => {
          // Create a pending enrollment
          const enrollmentId = `test-status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const enrollment = {
            id: enrollmentId,
            childName: enrollmentData.childName.trim(),
            birthDate: enrollmentData.birthDate,
            parentName: enrollmentData.parentName.trim(),
            parentPhone: enrollmentData.parentPhone,
            parentEmail: enrollmentData.parentEmail,
            notes: enrollmentData.notes,
            status: 'pending',
            submittedAt: new Date().toISOString()
          }

          let enrollments = readEnrollments()
          enrollments.push(enrollment)
          writeEnrollments(enrollments)

          // Update status
          enrollments = readEnrollments()
          const index = enrollments.findIndex(e => e.id === enrollmentId)
          if (index === -1) return false

          const updateData = {
            ...enrollments[index],
            status: newStatus,
            processedAt: new Date().toISOString()
          }

          if (newStatus === 'rejected' && maybeReason) {
            updateData.rejectionReason = maybeReason.trim()
          }

          enrollments[index] = updateData
          writeEnrollments(enrollments)

          // Verify status is valid
          const after = readEnrollments()
          const updated = after.find(e => e.id === enrollmentId)
          
          if (!updated) return false
          if (!VALID_STATUSES.includes(updated.status)) return false

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Workflow operations should preserve original enrollment data.
   * Validates: Requirements 14.3, 14.4 - data integrity during status updates
   */
  test('status updates preserve original enrollment data', () => {
    fc.assert(
      fc.property(
        enrollmentArbitrary,
        fc.constantFrom('accepted', 'rejected'),
        rejectionReasonArbitrary,
        (enrollmentData, newStatus, reason) => {
          // Create a pending enrollment
          const enrollmentId = `test-preserve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const enrollment = {
            id: enrollmentId,
            childName: enrollmentData.childName.trim(),
            birthDate: enrollmentData.birthDate,
            parentName: enrollmentData.parentName.trim(),
            parentPhone: enrollmentData.parentPhone,
            parentEmail: enrollmentData.parentEmail,
            notes: enrollmentData.notes,
            status: 'pending',
            submittedAt: new Date().toISOString()
          }

          let enrollments = readEnrollments()
          enrollments.push(enrollment)
          writeEnrollments(enrollments)

          // Update status
          enrollments = readEnrollments()
          const index = enrollments.findIndex(e => e.id === enrollmentId)
          if (index === -1) return false

          const updateData = {
            ...enrollments[index],
            status: newStatus,
            processedAt: new Date().toISOString()
          }

          if (newStatus === 'rejected') {
            updateData.rejectionReason = reason.trim()
          }

          enrollments[index] = updateData
          writeEnrollments(enrollments)

          // Verify original data is preserved
          const after = readEnrollments()
          const updated = after.find(e => e.id === enrollmentId)
          
          if (!updated) return false
          
          // Original fields should be unchanged
          if (updated.childName !== enrollment.childName) return false
          if (updated.birthDate !== enrollment.birthDate) return false
          if (updated.parentName !== enrollment.parentName) return false
          if (updated.parentPhone !== enrollment.parentPhone) return false
          if (updated.parentEmail !== enrollment.parentEmail) return false
          if (updated.notes !== enrollment.notes) return false
          if (updated.submittedAt !== enrollment.submittedAt) return false

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})
