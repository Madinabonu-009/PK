/**
 * Swagger API Documentation Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Play Kids API',
      version: '1.0.0',
      description: 'Kindergarten Management System API Documentation',
      contact: {
        name: 'Play Kids',
        email: 'boymurodovamadinabonuf9@gmail.com',
        url: 'https://playkids.uz'
      },
      license: {
        name: 'Private',
        url: 'https://playkids.uz/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.playkids.uz/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            name: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'teacher', 'parent']
            },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Child: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            age: { type: 'integer', minimum: 0, maximum: 10 },
            groupId: { type: 'string' },
            parentName: { type: 'string' },
            parentPhone: { type: 'string', pattern: '^\\+998[0-9]{9}$' },
            parentEmail: { type: 'string', format: 'email' },
            photo: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['name', 'age', 'groupId', 'parentName', 'parentPhone']
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            ageRange: { type: 'string' },
            capacity: { type: 'integer' },
            teacherId: { type: 'string' },
            schedule: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            childName: { type: 'string' },
            childAge: { type: 'integer' },
            parentName: { type: 'string' },
            parentPhone: { type: 'string' },
            parentEmail: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'waitlist']
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            childId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['present', 'absent', 'sick', 'vacation']
            },
            notes: { type: 'string' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            childId: { type: 'string' },
            amount: { type: 'number' },
            month: { type: 'string' },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'transfer']
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed']
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Children',
        description: 'Child management endpoints'
      },
      {
        name: 'Groups',
        description: 'Group management endpoints'
      },
      {
        name: 'Enrollments',
        description: 'Enrollment management endpoints'
      },
      {
        name: 'Attendance',
        description: 'Attendance tracking endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment management endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/index.js']
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
