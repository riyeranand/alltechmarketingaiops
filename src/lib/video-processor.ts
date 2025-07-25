// Video processing utilities for extracting audio and handling video files
// Note: This will work with Azure's GPT-4V (vision) model for video analysis

export interface VideoProcessingResult {
  transcription?: string
  description?: string
  extractedAudio?: Blob
  metadata?: VideoMetadata
}

export interface VideoMetadata {
  duration: number
  format: string
  size: number
  hasAudio: boolean
}

export async function analyzeVideoFile(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size,
        hasAudio: true, // Assume has audio, will be verified during processing
      }
      
      URL.revokeObjectURL(url)
      resolve(metadata)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to analyze video file'))
    }
    
    video.src = url
  })
}

export async function extractVideoFrames(file: File, frameCount: number = 10): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const url = URL.createObjectURL(file)
    const frames: string[] = []
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const duration = video.duration
      const interval = duration / frameCount
      let currentTime = 0
      
      const captureFrame = () => {
        video.currentTime = currentTime
      }
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frameData = canvas.toDataURL('image/jpeg', 0.8)
          frames.push(frameData)
        }
        
        currentTime += interval
        
        if (currentTime < duration && frames.length < frameCount) {
          captureFrame()
        } else {
          URL.revokeObjectURL(url)
          resolve(frames)
        }
      }
      
      captureFrame()
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to process video file'))
    }
    
    video.src = url
  })
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const supportedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']
  const maxSize = 100 * 1024 * 1024 // 100MB for video files
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (!fileExtension || !supportedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Unsupported video format. Supported: ${supportedFormats.join(', ')}`
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video file too large (max 100MB)'
    }
  }
  
  return { valid: true }
}

export function validateMediaFile(file: File): { 
  valid: boolean; 
  type: 'document' | 'audio' | 'video' | 'unknown';
  error?: string 
} {
  const fileName = file.name.toLowerCase()
  
  // Document formats
  const documentFormats = ['txt', 'doc', 'docx', 'pdf']
  // Audio formats
  const audioFormats = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'webm']
  // Video formats  
  const videoFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', 'flv']
  
  const extension = fileName.split('.').pop()
  
  if (!extension) {
    return { valid: false, type: 'unknown', error: 'File has no extension' }
  }
  
  if (documentFormats.includes(extension)) {
    return { valid: true, type: 'document' }
  }
  
  if (audioFormats.includes(extension)) {
    const audioValidation = validateAudioFile(file)
    return { 
      valid: audioValidation.valid, 
      type: 'audio', 
      error: audioValidation.error 
    }
  }
  
  if (videoFormats.includes(extension)) {
    const videoValidation = validateVideoFile(file)
    return { 
      valid: videoValidation.valid, 
      type: 'video', 
      error: videoValidation.error 
    }
  }
  
  return { 
    valid: false, 
    type: 'unknown', 
    error: `Unsupported file format: ${extension}` 
  }
}

function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024 // 25MB for audio
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file too large (max 25MB)' }
  }
  
  return { valid: true }
}
