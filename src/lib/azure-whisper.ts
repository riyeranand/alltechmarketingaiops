import { OpenAI } from 'openai';

interface WhisperSegment {
  start: number
  end: number
  text: string
}

interface WhisperResponse {
  text: string
  language?: string
  duration?: number
  segments?: WhisperSegment[]
}

interface ApiError {
  code?: string
  message?: string
  status?: number
}

// Lazy initialization of Azure Whisper client
let whisperClient: OpenAI | null = null;

function getWhisperClient(): OpenAI {
  if (!whisperClient) {
    // Validate required environment variables
    const apiKey = process.env.AZURE_WHISPER_API_KEY;
    const endpoint = process.env.AZURE_WHISPER_ENDPOINT;
    const deploymentName = process.env.AZURE_WHISPER_DEPLOYMENT_NAME;
    
    if (!apiKey) {
      throw new Error('AZURE_WHISPER_API_KEY environment variable is missing');
    }
    
    if (!endpoint) {
      throw new Error('AZURE_WHISPER_ENDPOINT environment variable is missing');
    }
    
    if (!deploymentName) {
      throw new Error('AZURE_WHISPER_DEPLOYMENT_NAME environment variable is missing');
    }

    whisperClient = new OpenAI({
      apiKey: apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: {
        'api-version': process.env.AZURE_WHISPER_API_VERSION || '2024-06-01'
      },
      defaultHeaders: {
        'api-key': apiKey,
      },
    });
  }
  
  return whisperClient;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export async function transcribeAudio(
  audioFile: File,
  options?: {
    language?: string;
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
    timestamp_granularities?: ('word' | 'segment')[];
  }
): Promise<TranscriptionResult> {
  try {
    console.log('Starting transcription for file:', audioFile.name, 'Size:', audioFile.size);

    // Validate file
    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    if (audioFile.size === 0) {
      throw new Error('Audio file is empty');
    }

    // Check file size (Azure Whisper has a 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      throw new Error(`File size (${(audioFile.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 25MB`);
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/aac', 'audio/ogg', 'audio/flac', 'audio/wma',
      'audio/webm', 'video/mp4', 'video/mov', 'video/avi',
      'video/mkv', 'video/webm', 'video/m4v', 'video/wmv', 'video/flv'
    ];

    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = [
      'mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'webm',
      'mp4', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv'
    ];

    if (!allowedTypes.includes(audioFile.type) && !allowedExtensions.includes(fileExtension || '')) {
      throw new Error(`Unsupported file type: ${audioFile.type || fileExtension}. Supported formats: mp3, wav, m4a, aac, ogg, flac, wma, webm, mp4, mov, avi, mkv, m4v, wmv, flv`);
    }

    console.log('Sending transcription request to Azure Whisper...');

    // Get the Azure Whisper client
    const client = getWhisperClient();

    // Make the API call using the OpenAI client
    const response = await client.audio.transcriptions.create({
      file: audioFile,
      model: process.env.AZURE_WHISPER_DEPLOYMENT_NAME || 'whisper',
      response_format: options?.response_format || 'verbose_json',
      language: options?.language,
      temperature: options?.temperature,
      timestamp_granularities: options?.timestamp_granularities as ('word' | 'segment')[],
    });

    console.log('Transcription completed successfully');

    // Handle different response formats
    if (typeof response === 'string') {
      return { text: response };
    }

    // For verbose_json format
    if (typeof response === 'object' && 'text' in response) {
      return {
        text: response.text,
        language: (response as WhisperResponse).language,
        duration: (response as WhisperResponse).duration,
        segments: (response as WhisperResponse).segments?.map((segment: WhisperSegment) => ({
          start: segment.start,
          end: segment.end,
          text: segment.text,
        })),
      };
    }

    // Fallback
    return { text: JSON.stringify(response) };

  } catch (error: unknown) {
    console.error('Azure Whisper transcription error:', error);

    const apiError = error as ApiError;

    // Handle specific Azure errors
    if (apiError.code === 'content_policy_violation') {
      throw new Error('Content policy violation: The audio content violates Azure OpenAI content policies');
    }

    if (apiError.code === 'invalid_request_error') {
      throw new Error(`Invalid request: ${apiError.message}`);
    }

    if (apiError.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again');
    }

    if (apiError.code === 'insufficient_quota') {
      throw new Error('Azure OpenAI quota exceeded. Please check your subscription');
    }

    if (apiError.status === 401) {
      throw new Error('Authentication failed: Invalid Azure OpenAI API key');
    }

    if (apiError.status === 404) {
      throw new Error('Azure Whisper deployment not found. Please check your deployment name');
    }

    if (apiError.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again');
    }

    if (apiError.status === 500) {
      throw new Error('Azure OpenAI service error. Please try again later');
    }

    // Network errors
    if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ENOTFOUND') {
      throw new Error('Network error: Unable to connect to Azure OpenAI service');
    }

    // Generic error
    throw new Error(`Transcription failed: ${apiError.message || 'Unknown error occurred'}`);
  }
}

export async function transcribeAudioBuffer(
  audioBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  options?: {
    language?: string;
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
  }
): Promise<TranscriptionResult> {
  // Convert ArrayBuffer to File
  const file = new File([audioBuffer], fileName, { type: mimeType });
  return transcribeAudio(file, options);
}

// Helper function to detect audio language
export async function detectAudioLanguage(audioFile: File): Promise<string> {
  try {
    const result = await transcribeAudio(audioFile, {
      response_format: 'verbose_json',
      temperature: 0,
    });
    return result.language || 'en';
  } catch (error) {
    console.warn('Language detection failed, defaulting to English:', error);
    return 'en';
  }
}

// Helper function to get supported languages
export function getSupportedLanguages(): { code: string; name: string }[] {
  return [
    { code: 'af', name: 'Afrikaans' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hy', name: 'Armenian' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Estonian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'gl', name: 'Galician' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'ko', name: 'Korean' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'ms', name: 'Malay' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mi', name: 'Maori' },
    { code: 'ne', name: 'Nepali' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'es', name: 'Spanish' },
    { code: 'sw', name: 'Swahili' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'ta', name: 'Tamil' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'cy', name: 'Welsh' },
  ];
}

// Validate audio file function
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  // Check file size (Azure Whisper has a 25MB limit)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 25MB` 
    };
  }

  // Validate file type
  const allowedTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
    'audio/aac', 'audio/ogg', 'audio/flac', 'audio/wma',
    'audio/webm', 'video/mp4', 'video/mov', 'video/avi',
    'video/mkv', 'video/webm', 'video/m4v', 'video/wmv', 'video/flv'
  ];

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = [
    'mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'webm',
    'mp4', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv'
  ];

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
    return { 
      isValid: false, 
      error: `Unsupported file type: ${file.type || fileExtension}. Supported formats: mp3, wav, m4a, aac, ogg, flac, wma, webm, mp4, mov, avi, mkv, m4v, wmv, flv` 
    };
  }

  return { isValid: true };
}