import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio, validateAudioFile } from '@/lib/azure-whisper'

interface ApiError {
  message?: string
  code?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate the audio file
    const validation = validateAudioFile(audioFile)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    console.log(`Transcribing audio file: ${audioFile.name} (${audioFile.size} bytes)`)

    // Transcribe the audio using Azure Whisper
    const result = await transcribeAudio(audioFile)

    console.log(`Transcription successful: ${result.text.length} characters`)

    return NextResponse.json({
      success: true,
      transcription: result.text,
      language: result.language,
      duration: result.duration,
      metadata: {
        filename: audioFile.name,
        size: audioFile.size,
        format: audioFile.name.split('.').pop()?.toLowerCase()
      }
    })

  } catch (error: unknown) {
    console.error('Audio transcription API error:', error)
    
    const apiError = error as ApiError
    const errorMessage = apiError?.message || 'Audio transcription failed'
    const statusCode = apiError?.code === 'invalid_api_key' ? 401 : 500

    return NextResponse.json(
      { 
        error: errorMessage,
        code: apiError?.code || 'transcription_error',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
