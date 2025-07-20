import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('Row level security')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    if (error.message.includes('JWT')) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Default error response
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}