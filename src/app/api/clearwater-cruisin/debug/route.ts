import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test basic imports first
    console.log('[Debug] Testing basic imports...')
    
    const { getPayload } = await import('payload')
    const configPromise = await import('../../../../payload.config')
    
    console.log('[Debug] Imports successful, initializing payload...')
    
    // Test payload initialization
    const payload = await getPayload({ config: configPromise.default })
    
    console.log('[Debug] Payload initialized successfully')
    
    // Test database connection
    const result = await payload.find({
      collection: 'users',
      limit: 1
    })
    
    console.log('[Debug] Database connection successful')
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      tests: {
        imports: 'SUCCESS',
        payloadInit: 'SUCCESS',
        database: 'SUCCESS',
        userCount: result.totalDocs
      }
    })
    
  } catch (error) {
    console.error('[Debug] Error occurred:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 })
  }
} 