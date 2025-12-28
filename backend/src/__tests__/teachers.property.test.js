/**
 * Property-Based Tests for Teacher Profile Completeness
 * 
 * **Feature: play-kids-platform, Property 4: Teacher Profile Completeness**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * Property: For any teacher in the database, the profile display must 
 * include name, role, experience, and photo.
 */

import fc from 'fast-check'
import { validateTeacherProfile, validateTeachers } from '../routes/teachers.js'

// Required fields per design document
const REQUIRED_FIELDS = ['name', 'role', 'experience', 'photo']

// Arbitrary generator for valid non-empty strings
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

// Arbitrary generator for valid teacher profile
const validTeacherArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: nonEmptyStringArb,
  role: nonEmptyStringArb,
  experience: nonEmptyStringArb,
  education: nonEmptyStringArb,
  photo: nonEmptyStringArb,
  bio: nonEmptyStringArb
})

// Arbitrary generator for array of valid teachers
const validTeachersArrayArb = fc.array(validTeacherArb, { minLength: 1, maxLength: 10 })

describe('Property 4: Teacher Profile Completeness', () => {
  /**
   * Property: For any valid teacher profile with all required fields,
   * validation should pass.
   */
  test('valid teacher profiles with all required fields pass validation', () => {
    fc.assert(
      fc.property(validTeacherArb, (teacher) => {
        const result = validateTeacherProfile(teacher)
        
        // Validation should pass
        if (!result.valid) return false
        if (result.errors.length > 0) return false
        
        // All required fields should be present and non-empty
        for (const field of REQUIRED_FIELDS) {
          if (!teacher[field]) return false
          if (typeof teacher[field] !== 'string') return false
          if (teacher[field].trim().length === 0) return false
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any teacher profile missing a required field,
   * validation should fail.
   */
  test('teacher profiles missing any required field fail validation', () => {
    fc.assert(
      fc.property(
        validTeacherArb,
        fc.constantFrom(...REQUIRED_FIELDS),
        (teacher, fieldToRemove) => {
          // Create a copy and remove one required field
          const incompleteTeacher = { ...teacher }
          delete incompleteTeacher[fieldToRemove]
          
          const result = validateTeacherProfile(incompleteTeacher)
          
          // Validation should fail
          return !result.valid && 
                 result.errors.some(e => e.toLowerCase().includes(fieldToRemove))
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any teacher profile with empty required field,
   * validation should fail.
   */
  test('teacher profiles with empty required fields fail validation', () => {
    fc.assert(
      fc.property(
        validTeacherArb,
        fc.constantFrom(...REQUIRED_FIELDS),
        fc.constantFrom('', '   ', '\t', '\n'),
        (teacher, field, emptyValue) => {
          // Create a copy and set empty value
          const invalidTeacher = { ...teacher }
          invalidTeacher[field] = emptyValue
          
          const result = validateTeacherProfile(invalidTeacher)
          
          // Validation should fail
          return !result.valid
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any teacher profile with non-string required field,
   * validation should fail.
   */
  test('teacher profiles with non-string required fields fail validation', () => {
    fc.assert(
      fc.property(
        validTeacherArb,
        fc.constantFrom(...REQUIRED_FIELDS),
        fc.constantFrom(null, undefined, 123, [], {}, true),
        (teacher, field, invalidValue) => {
          // Create a copy and set invalid value
          const invalidTeacher = { ...teacher }
          invalidTeacher[field] = invalidValue
          
          const result = validateTeacherProfile(invalidTeacher)
          
          // Validation should fail
          return !result.valid
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Null or non-object teachers should fail validation.
   */
  test('null or non-object teachers fail validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, '', 123, [], 'string'),
        (invalidTeacher) => {
          const result = validateTeacherProfile(invalidTeacher)
          return !result.valid && result.errors.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any array of valid teachers, validateTeachers should pass.
   */
  test('arrays of valid teachers pass validation', () => {
    fc.assert(
      fc.property(validTeachersArrayArb, (teachers) => {
        const result = validateTeachers(teachers)
        
        return result.valid && 
               result.errors.length === 0 && 
               result.invalidTeachers.length === 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any array with at least one invalid teacher,
   * validateTeachers should fail and identify the invalid teacher.
   */
  test('arrays with invalid teachers fail validation and identify them', () => {
    fc.assert(
      fc.property(
        validTeachersArrayArb,
        fc.integer({ min: 0, max: 9 }),
        fc.constantFrom(...REQUIRED_FIELDS),
        (teachers, indexToInvalidate, fieldToRemove) => {
          // Ensure index is within bounds
          const targetIndex = indexToInvalidate % teachers.length
          
          // Create a deep copy and invalidate one teacher
          const teachersCopy = JSON.parse(JSON.stringify(teachers))
          delete teachersCopy[targetIndex][fieldToRemove]
          
          const result = validateTeachers(teachersCopy)
          
          // Validation should fail and identify the invalid teacher
          return !result.valid && 
                 result.invalidTeachers.includes(targetIndex)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Non-array input to validateTeachers should fail.
   */
  test('non-array input to validateTeachers fails validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, '', 123, {}, 'string'),
        (invalidInput) => {
          const result = validateTeachers(invalidInput)
          return !result.valid && result.errors.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})
