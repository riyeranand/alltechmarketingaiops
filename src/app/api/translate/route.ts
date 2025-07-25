import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLanguage } = body

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid text content is required for translation' },
        { status: 400 }
      )
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      )
    }

    // Check text length (OpenAI has token limits)
    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Text is too long. Please limit to 50,000 characters.' },
        { status: 400 }
      )
    }

    console.log(`Translation request: ${text.substring(0, 100)}... -> ${targetLanguage}`)

    // Perform translation using O3 model
    const translation = await translateText(text, targetLanguage)

    // Log success for monitoring
    console.log(`Translation successful: ${translation.substring(0, 100)}...`)

    return NextResponse.json({ 
      translation,
      originalLength: text.length,
      translatedLength: translation.length,
      targetLanguage,
      model: 'o3'
    })

  } catch (error: any) {
    console.error('Translation API error:', error)
    
    // Return appropriate error response
    const errorMessage = error.message || 'Translation failed due to an unexpected error'
    const statusCode = error.code === 'insufficient_quota' ? 402 : 500

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || 'unknown_error',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
