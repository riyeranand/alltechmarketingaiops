// Enhanced file parser utility for handling documents, audio, and video files
import mammoth from 'mammoth'
import { analyzeVideoFile, extractVideoFrames, validateMediaFile } from './video-processor'

export interface ParseResult {
  text: string
  type: 'document' | 'audio' | 'video'
  metadata?: {
    duration?: number
    format?: string
    size?: number
    language?: string
    frameCount?: number
  }
}

export async function parseFile(file: File): Promise<ParseResult> {
  const validation = validateMediaFile(file)
  
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file')
  }
  
  try {
    switch (validation.type) {
      case 'document':
        return await parseDocumentFile(file)
      
      case 'audio':
        return await parseAudioFile(file)
      
      case 'video':
        return await parseVideoFile(file)
      
      default:
        throw new Error(`Unsupported file type: ${validation.type}`)
    }
  } catch (error) {
    console.error('File parsing error:', error)
    throw new Error(`Failed to parse ${validation.type} file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function parseDocumentFile(file: File): Promise<ParseResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  let text: string
  
  switch (fileExtension) {
    case 'txt':
      text = await parseTextFile(file)
      break
    
    case 'doc':
    case 'docx':
      text = await parseWordDocument(file)
      break
    
    default:
      text = await parseTextFile(file) // Fallback to text parsing
  }
  
  return {
    text,
    type: 'document',
    metadata: {
      format: fileExtension,
      size: file.size
    }
  }
}

async function parseAudioFile(file: File): Promise<ParseResult> {
  console.log(`Processing audio file: ${file.name}`)
  
  // Use the API endpoint instead of direct Azure Whisper calls
  const formData = new FormData()
  formData.append('audio', file)
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Audio transcription failed')
  }
  
  const result = await response.json()
  
  return {
    text: result.transcription,
    type: 'audio',
    metadata: {
      duration: result.duration,
      format: file.name.split('.').pop()?.toLowerCase(),
      size: file.size,
      language: result.language
    }
  }
}

async function parseVideoFile(file: File): Promise<ParseResult> {
  console.log(`Processing video file: ${file.name}`)
  
  // Analyze video metadata first
  const videoMetadata = await analyzeVideoFile(file)
  
  if (!videoMetadata.hasAudio) {
    throw new Error('Video file contains no audio to transcribe')
  }
  
  // For now, we'll extract audio using browser APIs and transcribe
  // In a production environment, you might want to use server-side processing
  const transcription = await transcribeVideoAudio(file)
  
  return {
    text: transcription,
    type: 'video',
    metadata: {
      duration: videoMetadata.duration,
      format: videoMetadata.format,
      size: file.size,
      frameCount: 10 // Default frame extraction count
    }
  }
}

async function transcribeVideoAudio(file: File): Promise<string> {
  // Use the API endpoint for video transcription as well
  const formData = new FormData()
  formData.append('audio', file) // Azure Whisper can handle video files directly
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Video transcription failed')
  }
  
  const result = await response.json()
  return result.transcription
}

async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text || text.trim().length === 0) {
        reject(new Error('The text file appears to be empty'))
        return
      }
      resolve(text)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read the text file'))
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}

async function parseWordDocument(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        
        if (!arrayBuffer) {
          reject(new Error('Failed to read the Word document'))
          return
        }
        
        const result = await mammoth.extractRawText({ arrayBuffer })
        
        if (!result.value || result.value.trim().length === 0) {
          reject(new Error('The Word document appears to be empty or contains no readable text'))
          return
        }
        
        if (result.messages && result.messages.length > 0) {
          console.warn('Word document parsing warnings:', result.messages)
        }
        
        resolve(result.value)
        
      } catch (error) {
        console.error('Word document parsing error:', error)
        reject(new Error('Failed to parse the Word document. The file may be corrupted or in an unsupported format.'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read the Word document file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

export function validateFileSize(file: File, maxSizeMB: number = 25): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export function validateFileType(file: File): boolean {
  const validation = validateMediaFile(file)
  return validation.valid
}

export function getFileTypeDescription(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const validation = validateMediaFile(file)
  
  switch (validation.type) {
    case 'document':
      switch (extension) {
        case 'txt': return 'Text file'
        case 'doc': return 'Microsoft Word document (legacy)'
        case 'docx': return 'Microsoft Word document'
        default: return 'Document file'
      }
    
    case 'audio':
      switch (extension) {
        case 'mp3': return 'MP3 audio file'
        case 'wav': return 'WAV audio file'
        case 'm4a': return 'M4A audio file'
        case 'aac': return 'AAC audio file'
        default: return 'Audio file'
      }
    
    case 'video':
      switch (extension) {
        case 'mp4': return 'MP4 video file'
        case 'mov': return 'QuickTime video file'
        case 'avi': return 'AVI video file'
        case 'mkv': return 'MKV video file'
        default: return 'Video file'
      }
    
    default:
      return 'Unknown file type'
  }
}
