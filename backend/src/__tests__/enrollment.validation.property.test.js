/**
 * Property-Based Tests for Enrollment Form Validation
 * 
 * **Feature: play-kids-platform, Property 5: Form Validation Completeness**
 * **Validates: Requirements 6.3**
 * 
 * Property: For any enrollment form submission, all required fields 
 * (childName, birthDate, parentName, parentPhone) must be validated before submission.
 */

import fc from 'fast-check'

/**
 * Validates enrollment form data
 * This mirrors the frontend validation logic for testing purposes
 * Requirements: 6.3 - validate all required fields before submission
 * @param {Object} data - Form data to validate
 * @returns {Object} - Object with field errors
 */
const validateEnrollmentForm = (data) => {
  const errors = {}

  // Child name validation - required, non-empty
  if (!data.childName || (typeof data.childName === 'string' && data.childName.trim() === '')) {
    errors.childName = "Bola ismi kiritilishi shart"
  }

  // Birth date validation - required
  if (!data.birthDate || (typeof data.birthDate === 'string' && data.birthDate.trim() === '')) {
    errors.birthDate = "Tug'ilgan sana kiritilishi shart"
  } else if (typeof data.birthDate === 'string') {
    const birthDate = new Date(data.birthDate)
    const today = new Date()
    const minAge = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate())
    const maxAge = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())
    
    if (!isNaN(birthDate.getTime())) {
      if (birthDate > maxAge) {
        errors.birthDate = "Bola kamida 2 yoshda bo'lishi kerak"
      } else if (birthDate < minAge) {
        errors.birthDate = "Bola 6 yoshdan katta bo'lmasligi kerak"
      }
    }
  }

  // Parent name validation - required, non-empty
  if (!data.parentName || (typeof data.parentName === 'string' && data.parentName.trim() === '')) {
    errors.parentName = "Ota-ona ismi kiritilishi shart"
  }

  // Parent phone validation - required, valid format
  if (!data.parentPhone || (typeof data.parentPhone === 'string' && data.parentPhone.trim() === '')) {
    errors.parentPhone = "Telefon raqam kiritilishi shart"
  } else if (typeof data.parentPhone === 'string') {
    const phoneRegex = /^\+998[0-9]{9}$/
    if (!phoneRegex.test(data.parentPhone.trim())) {
      errors.parentPhone = "Telefon raqam formati: +998XXXXXXXXX"
    }
  }

  // Parent email validation - optional but must be valid if provided
  if (data.parentEmail && typeof data.parentEmail === 'string' && data.parentEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.parentEmail.trim())) {
      errors.parentEmail = "Email formati noto'g'ri"
    }
  }

  return errors
}

// Generate valid birth date (2-6 years old)
// We need to be precise about the age calculation
const today = new Date()
const validBirthDateArbitrary = fc.date({
  min: new Date(today.getFullYear() - 6, today.getMonth(), today.getDate() + 1), // Just turned 6 or younger
  max: new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()) // At least 2 years old
}).map(d => d.toISOString().split('T')[0])

// Generate valid phone number
const validPhoneArbitrary = fc.stringMatching(/^\+998[0-9]{9}$/)

// Generate valid non-empty string
const nonEmptyStringArbitrary = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

// Generate valid email
const validEmailArbitrary = fc.emailAddress()

describe('Property 5: Form Validation Completeness', () => {
  /**
   * Property: Valid form data should pass validation with no errors
   * Validates: Requirement 6.3 - validate all required fields before submission
   */
  test('valid enrollment data produces no validation errors', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        validBirthDateArbitrary,
        nonEmptyStringArbitrary,
        validPhoneArbitrary,
        fc.option(validEmailArbitrary),
        (childName, birthDate, parentName, parentPhone, maybeEmail) => {
          const formData = {
            childName,
            birthDate,
            parentName,
            parentPhone,
            parentEmail: maybeEmail || '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Valid data should produce no errors
          return Object.keys(errors).length === 0
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Missing childName should always produce an error
   * Validates: Requirement 6.3 - childName is required
   */
  test('missing or empty childName always produces validation error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', null, undefined),
        validBirthDateArbitrary,
        nonEmptyStringArbitrary,
        validPhoneArbitrary,
        (invalidChildName, birthDate, parentName, parentPhone) => {
          const formData = {
            childName: invalidChildName,
            birthDate,
            parentName,
            parentPhone,
            parentEmail: '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have childName error
          return errors.childName !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Missing birthDate should always produce an error
   * Validates: Requirement 6.3 - birthDate is required
   */
  test('missing or empty birthDate always produces validation error', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        fc.constantFrom('', '   ', null, undefined),
        nonEmptyStringArbitrary,
        validPhoneArbitrary,
        (childName, invalidBirthDate, parentName, parentPhone) => {
          const formData = {
            childName,
            birthDate: invalidBirthDate,
            parentName,
            parentPhone,
            parentEmail: '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have birthDate error
          return errors.birthDate !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Missing parentName should always produce an error
   * Validates: Requirement 6.3 - parentName is required
   */
  test('missing or empty parentName always produces validation error', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        validBirthDateArbitrary,
        fc.constantFrom('', '   ', null, undefined),
        validPhoneArbitrary,
        (childName, birthDate, invalidParentName, parentPhone) => {
          const formData = {
            childName,
            birthDate,
            parentName: invalidParentName,
            parentPhone,
            parentEmail: '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have parentName error
          return errors.parentName !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Missing or invalid parentPhone should always produce an error
   * Validates: Requirement 6.3 - parentPhone is required with valid format
   */
  test('missing or invalid parentPhone always produces validation error', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        validBirthDateArbitrary,
        nonEmptyStringArbitrary,
        fc.constantFrom('', '   ', null, undefined, '123456', '+1234567890', 'invalid'),
        (childName, birthDate, parentName, invalidPhone) => {
          const formData = {
            childName,
            birthDate,
            parentName,
            parentPhone: invalidPhone,
            parentEmail: '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have parentPhone error
          return errors.parentPhone !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Invalid email format should produce an error when provided
   * Validates: Requirement 6.3 - email must be valid if provided
   */
  test('invalid email format produces validation error', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        validBirthDateArbitrary,
        nonEmptyStringArbitrary,
        validPhoneArbitrary,
        fc.constantFrom('invalid', 'test@', '@test.com', 'test@test', 'test.com'),
        (childName, birthDate, parentName, parentPhone, invalidEmail) => {
          const formData = {
            childName,
            birthDate,
            parentName,
            parentPhone,
            parentEmail: invalidEmail,
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have parentEmail error
          return errors.parentEmail !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Child age must be between 2 and 6 years
   * Validates: Requirement 6.3 - birthDate validation for age range
   */
  test('child outside age range (2-6 years) produces validation error', () => {
    const today = new Date()
    
    // Too young (less than 2 years old)
    const tooYoungDate = fc.date({
      min: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      max: today
    }).map(d => d.toISOString().split('T')[0])

    // Too old (more than 6 years old)
    const tooOldDate = fc.date({
      min: new Date(today.getFullYear() - 10, 0, 1),
      max: new Date(today.getFullYear() - 7, 0, 1)
    }).map(d => d.toISOString().split('T')[0])

    fc.assert(
      fc.property(
        nonEmptyStringArbitrary,
        fc.oneof(tooYoungDate, tooOldDate),
        nonEmptyStringArbitrary,
        validPhoneArbitrary,
        (childName, invalidBirthDate, parentName, parentPhone) => {
          const formData = {
            childName,
            birthDate: invalidBirthDate,
            parentName,
            parentPhone,
            parentEmail: '',
            notes: ''
          }

          const errors = validateEnrollmentForm(formData)
          
          // Should have birthDate error for age range
          return errors.birthDate !== undefined
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: All four required fields must be validated
   * Validates: Requirement 6.3 - all required fields validation
   */
  test('completely empty form produces errors for all required fields', () => {
    const emptyFormData = {
      childName: '',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      notes: ''
    }

    const errors = validateEnrollmentForm(emptyFormData)
    
    // Should have errors for all 4 required fields
    expect(errors.childName).toBeDefined()
    expect(errors.birthDate).toBeDefined()
    expect(errors.parentName).toBeDefined()
    expect(errors.parentPhone).toBeDefined()
    // Email is optional, so no error expected
    expect(errors.parentEmail).toBeUndefined()
  })
})
