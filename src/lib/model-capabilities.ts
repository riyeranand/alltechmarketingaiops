// Azure OpenAI O3 Model Capabilities Research
// Based on official Azure OpenAI documentation as of July 2025

export interface ModelCapabilities {
  supportsText: boolean
  supportsImages: boolean
  supportsAudio: boolean
  supportsVideo: boolean
  supportedAudioFormats?: string[]
  supportedVideoFormats?: string[]
  maxFileSizeMB?: number
  notes: string[]
}

export const O3_MODEL_CAPABILITIES: ModelCapabilities = {
  supportsText: true,
  supportsImages: false, // O3 is text-only as of 2025
  supportsAudio: false,  // O3 does not support audio input
  supportsVideo: false,  // O3 does not support video input
  supportedAudioFormats: [],
  supportedVideoFormats: [],
  maxFileSizeMB: 0,
  notes: [
    "O3 is a text-only model optimized for reasoning and text generation",
    "For audio transcription, use Azure OpenAI Whisper model",
    "For video analysis, combine Whisper (audio) + Vision models",
    "O3 excels at text translation, reasoning, and complex language tasks"
  ]
}

// Alternative Azure OpenAI models for multimedia
export const AZURE_MULTIMEDIA_MODELS = {
  whisper: {
    purpose: "Speech-to-text transcription",
    supportsAudio: true,
    supportedFormats: ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"],
    maxFileSizeMB: 25,
    deployment: "whisper"
  },
  gpt4Vision: {
    purpose: "Image analysis and description", 
    supportsImages: true,
    supportedFormats: ["png", "jpeg", "jpg", "webp", "gif"],
    maxFileSizeMB: 20,
    deployment: "gpt-4-vision-preview"
  }
}

export function checkO3VideoSupport(): boolean {
  return O3_MODEL_CAPABILITIES.supportsVideo
}

export function getMultimediaWorkflow(): string {
  return `
For multimedia translation workflow:
1. Audio Files: Use Whisper for transcription → O3 for translation
2. Video Files: Use Whisper for audio track → O3 for translation
3. Images with Text: Use GPT-4 Vision for OCR → O3 for translation
4. Text Files: Use O3 directly for translation
  `
}

export function getRecommendedApproach(): {
  audioWorkflow: string
  videoWorkflow: string
  implementation: string
} {
  return {
    audioWorkflow: "Audio File → Whisper (transcription) → O3 (translation) → Result",
    videoWorkflow: "Video File → Extract Audio → Whisper (transcription) → O3 (translation) → Result", 
    implementation: `
1. Install ffmpeg for audio/video processing
2. Use Azure OpenAI Whisper for transcription  
3. Pass transcribed text to O3 for translation
4. Combine results for final output
    `
  }
}
