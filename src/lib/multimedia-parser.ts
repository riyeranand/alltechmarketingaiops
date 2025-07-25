// Enhanced multimedia file parser with audio/video support
import mammoth from 'mammoth'
import { AZURE_MULTIMEDIA_MODELS, getRecommendedApproach } from './model-capabilities'

export interface ParseResult {
  text: string
  type: 'text' | 'audio' | 'video' | 'document'
  originalFormat: string
  processingMethod: string
  notes?: string[]
}

export async function parseMultimediaFile(file: File): Promise<ParseResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const fileType = getFileType(fileExtension || '')
  
  try {
    switch (fileType) {
      case 'document':
        return await parseDocumentFile(file, fileExtension || '')
      
      case 'audio':
        return await parseAudioFile(file, fileExtension || '')
      
      case 'video':
        return await parseVideoFile(file, fileExtension || '')
      
      default:
        // Try to parse as text for unknown extensions
        return await parseTextFile(file, fileExtension || '')
    }
  } catch (error) {
    console.error('Multimedia parsing error:', error)
    throw new Error(`Failed to parse ${fileExtension?.toUpperCase()} file. ${error}`)
  }
}

function getFileType(extension: string): 'text' | 'document' | 'audio' | 'video' {
  const audioFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg', 'flac']
  const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v']
  const documentFormats = ['doc', 'docx', 'pdf']
  
  if (audioFormats.includes(extension)) return 'audio'
  if (videoFormats.includes(extension)) return 'video'
  if (documentFormats.includes(extension)) return 'document'
  return 'text'
}

async function parseDocumentFile(file: File, extension: string): Promise<ParseResult> {
  if (extension === 'txt') {
    const text = await parseTextContent(file)
    return {
      text,
      type: 'document',
      originalFormat: extension,
      processingMethod: 'Direct text extraction'
    }
  }
  
  if (['doc', 'docx'].includes(extension)) {
    const text = await parseWordDocument(file)
    return {
      text,
      type: 'document', 
      originalFormat: extension,
      processingMethod: 'Mammoth library extraction'
    }
  }
  
  throw new Error(`Document format ${extension} not yet supported`)
}

async function parseAudioFile(file: File, extension: string): Promise<ParseResult> {
  // Since O3 doesn't support audio directly, we need to use Whisper
  if (!AZURE_MULTIMEDIA_MODELS.whisper.supportedFormats.includes(extension)) {
    throw new Error(`Audio format ${extension} not supported. Supported: ${AZURE_MULTIMEDIA_MODELS.whisper.supportedFormats.join(', ')}`)
  }
  
  if (file.size > AZURE_MULTIMEDIA_MODELS.whisper.maxFileSizeMB * 1024 * 1024) {
    throw new Error(`Audio file too large. Maximum size: ${AZURE_MULTIMEDIA_MODELS.whisper.maxFileSizeMB}MB`)
  }
  
  // For now, return a placeholder - actual implementation would require Whisper API
  return {
    text: '[Audio transcription would be processed here using Azure OpenAI Whisper model]',
    type: 'audio',
    originalFormat: extension,
    processingMethod: 'Azure OpenAI Whisper (requires implementation)',
    notes: [
      'Audio files require Azure OpenAI Whisper for transcription',
      'After transcription, text can be translated with O3 model',
      'Implementation requires additional Whisper API integration'
    ]
  }
}

async function parseVideoFile(file: File, extension: string): Promise<ParseResult> {
  // Videos need audio extraction first, then Whisper transcription
  return {
    text: '[Video would be processed: Extract audio → Whisper transcription → O3 translation]',
    type: 'video',
    originalFormat: extension,
    processingMethod: 'FFmpeg audio extraction + Azure Whisper (requires implementation)',
    notes: [
      'Video files require audio track extraction using FFmpeg',
      'Extracted audio is then transcribed using Azure OpenAI Whisper',
      'Transcribed text can then be translated with O3 model',
      'Implementation requires FFmpeg and Whisper API integration'
    ]
  }
}

async function parseTextContent(file: File): Promise<string> {
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

async function parseTextFile(file: File, extension: string): Promise<ParseResult> {
  const text = await parseTextContent(file)
  return {
    text,
    type: 'text',
    originalFormat: extension,
    processingMethod: 'Direct text reading'
  }
}

export function validateMultimediaFile(file: File): { 
  valid: boolean
  error?: string
  supportedDirectly: boolean
  requiresPreprocessing: boolean
  recommendedWorkflow?: string
} {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const fileType = getFileType(extension)
  
  // Check file size (general limit)
  const maxSizeBytes = 50 * 1024 * 1024 // 50MB general limit
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'File too large. Maximum size: 50MB',
      supportedDirectly: false,
      requiresPreprocessing: false
    }
  }
  
  switch (fileType) {
    case 'text':
    case 'document':
      return {
        valid: true,
        supportedDirectly: true,
        requiresPreprocessing: false
      }
    
    case 'audio':
      return {
        valid: true,
        supportedDirectly: false,
        requiresPreprocessing: true,
        recommendedWorkflow: getRecommendedApproach().audioWorkflow
      }
    
    case 'video':
      return {
        valid: true,
        supportedDirectly: false,
        requiresPreprocessing: true,
        recommendedWorkflow: getRecommendedApproach().videoWorkflow
      }
    
    default:
      return {
        valid: false,
        error: `Unsupported file type: ${extension}`,
        supportedDirectly: false,
        requiresPreprocessing: false
      }
  }
}

export function getSupportedFormats(): {
  direct: string[]
  withPreprocessing: string[]
  notes: string[]
} {
  return {
    direct: ['txt', 'doc', 'docx'],
    withPreprocessing: [
      ...AZURE_MULTIMEDIA_MODELS.whisper.supportedFormats,
      'mp4', 'avi', 'mov', 'wmv', 'mkv' // video formats
    ],
    notes: [
      'Text and document files are processed directly with O3',
      'Audio/video files require transcription via Azure Whisper first',
      'All multimedia workflows preserve original content quality'
    ]
  }
}
