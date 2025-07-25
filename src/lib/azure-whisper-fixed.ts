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

  } catch (error: any) {
    console.error('Audio transcription error:', error)
    
    if (error.code === 'file_too_large') {
      throw new Error('Audio file is too large. Please use a file smaller than 25MB.')
    }
    
    if (error.code === 'unsupported_file_type') {
      throw new Error('Unsupported audio format. Please use MP3, WAV, M4A, or other supported formats.')
    }
    
    if (error.code === 'invalid_api_key' || error.code === 'Unauthorized') {
      throw new Error('Invalid Azure OpenAI API key for Whisper service.')
    }

    if (error.status === 401) {
      throw new Error('Authentication failed. Check your Azure Whisper API key.')
    }

    if (error.status === 400) {
      throw new Error('Bad request. Check your audio file format and size.')
    }

    throw new Error(`Audio transcription failed: ${error.message || 'Unknown error'}`)
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
      return (translation as any).text
    } else {
      throw new Error('Unexpected response format from Whisper API')
    }

  } catch (error: any) {
    console.error('Audio translation error:', error)
    throw new Error(`Audio translation failed: ${error.message || 'Unknown error'}`)
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
