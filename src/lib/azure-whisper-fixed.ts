// Azure OpenAI Whisper integration for audio transcription
import { AzureOpenAI } from 'openai'

const whisperClient = new AzureOpenAI({
  apiKey: process.env.AZURE_WHISPER_API_KEY!,
  endpoint: process.env.AZURE_WHISPER_ENDPOINT!,
  apiVersion: process.env.AZURE_WHISPER_API_VERSION || '2024-06-01',
})

export interface AudioTranscriptionResult {
  text: string
  language?: string
  duration?: number
  confidence?: number
}

export async function transcribeAudio(audioFile: File): Promise<AudioTranscriptionResult> {
  try {
    console.log(`Starting audio transcription for: ${audioFile.name}`)
    
    // Validate file size (25MB limit for Whisper)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      throw new Error('Audio file is too large. Maximum size is 25MB.')
    }

    // Validate audio format
    const supportedFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported audio format. Supported formats: ${supportedFormats.join(', ')}`)
    }

    const transcription = await whisperClient.audio.transcriptions.create({
      file: audioFile,
      model: process.env.AZURE_WHISPER_DEPLOYMENT_NAME || 'whisper',
      language: undefined, // Auto-detect language
      response_format: 'verbose_json', // Get detailed response with timestamps
      temperature: 0.0, // More deterministic transcription
    })

    console.log('Audio transcription completed successfully')

    return {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
    }

  } catch (error: unknown) {
    console.error('Audio transcription error:', error)
    
    const apiError = error as { code?: string; message?: string; status?: number }
    if (apiError.code === 'file_too_large') {
      throw new Error('Audio file is too large. Please use a file smaller than 25MB.')
    }
    
    if (apiError.code === 'unsupported_file_type') {
      throw new Error('Unsupported audio format. Please use MP3, WAV, M4A, or other supported formats.')
    }
    
    if (apiError.code === 'invalid_api_key' || apiError.code === 'Unauthorized') {
      throw new Error('Invalid Azure OpenAI API key for Whisper service.')
    }

    if (apiError.status === 401) {
      throw new Error('Authentication failed. Check your Azure Whisper API key.')
    }

    if (apiError.status === 400) {
      throw new Error('Bad request. Check your audio file format and size.')
    }

    throw new Error(`Audio transcription failed: ${apiError.message || 'Unknown error'}`)
  }
}

export async function translateAudio(audioFile: File, targetLanguage: string): Promise<string> {
  try {
    console.log(`Starting audio translation for: ${audioFile.name} to ${targetLanguage}`)
    
    const translation = await whisperClient.audio.translations.create({
      file: audioFile,
      model: process.env.AZURE_WHISPER_DEPLOYMENT_NAME || 'whisper',
      response_format: 'text',
      temperature: 0.0,
    })

    console.log('Audio translation completed successfully')
    
    // Handle both string and object responses
    if (typeof translation === 'string') {
      return translation
    } else if (translation && typeof translation === 'object' && 'text' in translation) {
      return (translation as { text: string }).text
    } else {
      throw new Error('Unexpected response format from Whisper API')
    }

  } catch (error: unknown) {
    console.error('Audio translation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Audio translation failed: ${errorMessage}`)
  }
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const supportedFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
  const maxSize = 25 * 1024 * 1024 // 25MB
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (!fileExtension || !supportedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Unsupported audio format. Supported: ${supportedFormats.join(', ')}`
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Audio file too large (max 25MB)'
    }
  }
  
  return { valid: true }
}
