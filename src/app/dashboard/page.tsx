'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { StepProgress, Step } from "@/components/ui/step-progress"
import { 
  Languages, Upload, FileText, Copy, Download, LogOut, User, AlertCircle, 
  Sparkles, Zap, Bot, FileAudio, FileVideo, Mic, Video, 
  CheckCircle2, Clock, ArrowRight 
} from "lucide-react"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { parseFile, validateFileSize, validateFileType, getFileTypeDescription, ParseResult } from '@/lib/file-parser'

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
]

interface User {
  id: string
  email?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileInfo, setFileInfo] = useState<{type: string, name: string} | null>(null)
  
  // Enhanced progress tracking
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [processingSteps, setProcessingSteps] = useState<Step[]>([])
  const [showProgress, setShowProgress] = useState(false)
  const [processingTime, setProcessingTime] = useState(0)
  
  const router = useRouter()

  // Progress tracking timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showProgress) {
      interval = setInterval(() => {
        setProcessingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showProgress])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const initializeProgress = (isFileUpload: boolean = false) => {
    setShowProgress(true)
    setProgress(0)
    setProcessingTime(0)
    
    const steps: Step[] = isFileUpload 
      ? [
          { id: 'upload', title: 'File Processing', description: 'Analyzing and extracting content', status: 'active' },
          { id: 'transcribe', title: 'Audio Transcription', description: 'Converting speech to text with Azure Whisper', status: 'pending' },
          { id: 'translate', title: 'AI Translation', description: 'Translating with Azure OpenAI O3', status: 'pending' },
          { id: 'complete', title: 'Complete', description: 'Ready for download', status: 'pending' }
        ]
      : [
          { id: 'analyze', title: 'Text Analysis', description: 'Preparing content for translation', status: 'active' },
          { id: 'translate', title: 'AI Translation', description: 'Translating with Azure OpenAI O3', status: 'pending' },
          { id: 'complete', title: 'Complete', description: 'Translation ready', status: 'pending' }
        ]
    
    setProcessingSteps(steps)
    setCurrentStep(steps[0].id)
  }

  const updateProgress = (stepId: string, status: 'active' | 'completed' | 'error') => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
    
    if (status === 'completed') {
      const currentIndex = processingSteps.findIndex(step => step.id === stepId)
      if (currentIndex < processingSteps.length - 1) {
        const nextStep = processingSteps[currentIndex + 1]
        setCurrentStep(nextStep.id)
        setProcessingSteps(prev => prev.map(step => 
          step.id === nextStep.id ? { ...step, status: 'active' } : step
        ))
      }
    }
    
    setCurrentStep(stepId)
    
    // Update progress bar
    const completedSteps = processingSteps.filter(step => step.status === 'completed').length
    setProgress((completedSteps / processingSteps.length) * 100)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    
    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleTranslate = async () => {
    if (!inputText.trim() || !targetLanguage) {
      setError('Please enter text and select a target language')
      return
    }

    // Check text length
    if (inputText.length > 50000) {
      setError('Text is too long. Please limit to 50,000 characters.')
      return
    }

    setLoading(true)
    setError('')
    setTranslatedText('') // Clear previous translation
    
    // Initialize progress for text translation
    initializeProgress(false)

    try {
      // Step 1: Text analysis
      updateProgress('analyze', 'active')
      await new Promise(resolve => setTimeout(resolve, 800))
      updateProgress('analyze', 'completed')
      
      // Step 2: Translation
      updateProgress('translate', 'active')
      
      console.log('Starting translation with O3 model...')
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim(),
          targetLanguage: LANGUAGES.find(lang => lang.code === targetLanguage)?.name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        updateProgress('translate', 'error')
        // Handle specific error cases
        if (response.status === 402) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.')
        }
        throw new Error(data.error || 'Translation failed')
      }

      updateProgress('translate', 'completed')
      updateProgress('complete', 'completed')
      setProgress(100)

      console.log('Translation successful:', {
        originalLength: data.originalLength,
        translatedLength: data.translatedLength,
        model: data.model
      })

      setTranslatedText(data.translation)
      
      // Show success message briefly
      setError(`✅ Translation completed successfully! Model: ${data.model}`)
      
      // Hide progress after 2 seconds
      setTimeout(() => {
        setShowProgress(false)
        setError('')
      }, 2000)

    } catch (err: unknown) {
      console.error('Translation error:', err)
      updateProgress(currentStep, 'error')
      const errorMessage = err instanceof Error ? err.message : 'Translation failed. Please try again.'
      setError(errorMessage)
      
      // Hide progress on error after 2 seconds
      setTimeout(() => {
        setShowProgress(false)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setLoading(true)
    
    // Initialize progress tracking for file uploads
    initializeProgress(true)

    try {
      // Step 1: File validation and processing
      updateProgress('upload', 'active')
      
      // Validate file type - now supports audio and video
      if (!validateFileType(file)) {
        throw new Error('Unsupported file type. Please upload documents, audio, or video files.')
      }

      // Validate file size (25MB max for multimedia)
      if (!validateFileSize(file, 25)) {
        throw new Error('File is too large. Please upload files smaller than 25MB.')
      }

      console.log(`Processing ${getFileTypeDescription(file)}: ${file.name}`)

      // Simulate progress for file analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateProgress('upload', 'completed')

      // Step 2: Content extraction/transcription
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        updateProgress('transcribe', 'active')
      }

      // Parse the file content - now returns ParseResult with metadata
      const result: ParseResult = await parseFile(file)
      
      if (result.text.length > 50000) {
        updateProgress('transcribe', 'error')
        throw new Error('Extracted text is too long. Please use a shorter document/recording (max 50,000 characters).')
      }

      // Complete transcription step for audio/video
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        updateProgress('transcribe', 'completed')
      }

      setInputText(result.text)
      setFileInfo({ type: result.type, name: file.name })
      
      // Complete processing
      updateProgress('complete', 'completed')
      setProgress(100)
      
      // Show processing info based on file type
      if (result.type === 'audio') {
        console.log(`Successfully transcribed ${result.metadata?.duration}s audio: ${result.text.length} characters`)
        setError('') // Clear any errors
        // Show success message for audio
        setTimeout(() => {
          setError(`✅ Audio transcribed successfully! Duration: ${result.metadata?.duration?.toFixed(1)}s, Language: ${result.metadata?.language || 'Auto-detected'}`)
        }, 100)
      } else if (result.type === 'video') {
        console.log(`Successfully processed video: ${result.text.length} characters`)
        setError('') 
        setTimeout(() => {
          setError(`✅ Video processed successfully! Duration: ${result.metadata?.duration?.toFixed(1)}s`)
        }, 100)
      } else {
        console.log(`Successfully extracted ${result.text.length} characters from ${file.name}`)
        setError(`✅ Document processed successfully! ${result.text.length} characters extracted`)
      }

      // Hide progress after 3 seconds
      setTimeout(() => {
        setShowProgress(false)
      }, 3000)

    } catch (error: unknown) {
      console.error('File upload error:', error)
      updateProgress(currentStep, 'error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to process the uploaded file.'
      setError(errorMessage)
      
      // Hide progress on error after 2 seconds
      setTimeout(() => {
        setShowProgress(false)
      }, 2000)
    } finally {
      setLoading(false)
      // Clear the input so the same file can be uploaded again if needed
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glassmorphism */}
      <header className="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Languages className="h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartTranslate
                </span>
                <div className="text-xs text-gray-500 font-medium">AI-Powered Multimedia Translation</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 rounded-full backdrop-blur-sm">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Multimedia Translation Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload documents, audio, or video files for instant AI-powered translation. 
            <span className="text-blue-600 font-semibold"> Powered by Azure OpenAI O3 & Whisper</span>
          </p>
          <div className="flex justify-center items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">50+ Languages</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-medium">Azure O3 AI</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Real-time Processing</span>
            </div>
          </div>
        </div>

        {/* Progress Section - Only show when processing */}
        {showProgress && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="h-6 w-6 text-blue-400 opacity-75" />
                  </div>
                </div>
                <span className="text-xl">AI Processing in Progress</span>
                <div className="ml-auto flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(processingTime)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress 
                value={progress} 
                color="blue" 
                animated={progress < 100}
                className="h-4"
              />
              <StepProgress 
                steps={processingSteps} 
                className="max-w-2xl mx-auto"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Input Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xl">Source Content</span>
                  <div className="text-blue-100 text-sm font-normal">
                    Upload files or enter text directly
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Enhanced File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📁 Upload File (Optional)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".txt,.doc,.docx,.mp3,.wav,.m4a,.aac,.ogg,.flac,.wma,.webm,.mp4,.mov,.avi,.mkv,.m4v,.wmv,.flv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                  />
                  <div className="border-2 border-dashed border-gray-300 group-hover:border-blue-400 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-center space-x-3">
                        <Upload className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                        <FileAudio className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
                        <FileVideo className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-lg font-medium text-gray-700">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        📄 Documents: .txt, .doc, .docx
                        <br />
                        🎵 Audio: .mp3, .wav, .m4a, .aac, .ogg, .flac
                        <br />
                        🎬 Video: .mp4, .mov, .avi, .mkv, .webm
                      </p>
                      <p className="text-xs text-blue-600 font-medium">Max 25MB</p>
                    </div>
                  </div>
                </div>
                {fileInfo && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700">
                      {fileInfo.type === 'audio' && <Mic className="h-4 w-4" />}
                      {fileInfo.type === 'video' && <Video className="h-4 w-4" />}
                      {fileInfo.type === 'document' && <FileText className="h-4 w-4" />}
                      <span className="text-sm font-medium">
                        {fileInfo.type.charAt(0).toUpperCase() + fileInfo.type.slice(1)} processed: {fileInfo.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Text Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ✏️ Source Text
                </label>
                <Textarea
                  placeholder="Enter your text here, or upload a file above to extract content automatically..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-base"
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {inputText.length.toLocaleString()} characters
                  </div>
                  {inputText.length > 45000 && (
                    <div className="text-xs text-amber-600 font-medium">
                      ⚠️ Approaching 50K character limit
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🌍 Target Language
                </label>
                <div className="relative z-20">
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 hover:border-blue-400 focus:border-blue-400 transition-colors">
                      <SelectValue placeholder="🔍 Choose your target language..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 z-50 bg-white border border-gray-200 shadow-xl">
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Popular Languages
                        </div>
                      </div>
                      {LANGUAGES.slice(0, 8).map((lang) => (
                        <SelectItem 
                          key={lang.code} 
                          value={lang.code}
                          className="flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer"
                        >
                          <span className="text-lg mr-2">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </SelectItem>
                      ))}
                      <div className="p-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          All Languages
                        </div>
                      </div>
                      {LANGUAGES.slice(8).map((lang) => (
                        <SelectItem 
                          key={lang.code} 
                          value={lang.code}
                          className="flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer"
                        >
                          <span className="text-lg mr-2">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-blue-600 flex items-center space-x-1">
                    <Bot className="h-3 w-3" />
                    <span>Powered by Azure OpenAI O3 model</span>
                  </p>
                  {targetLanguage && (
                    <div className="text-xs text-green-600 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Ready to translate</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className={`p-4 rounded-lg border ${
                  error.startsWith('✅') 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-start space-x-3">
                    {error.startsWith('✅') ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
                    )}
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              )}

              {/* Enhanced Translate Button */}
              <Button 
                onClick={handleTranslate} 
                disabled={loading || !inputText.trim() || !targetLanguage}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>AI Translation in Progress...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5" />
                    <span>Translate with Azure O3</span>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced Output Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Languages className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xl">AI Translation</span>
                  <div className="text-green-100 text-sm font-normal">
                    Your translated content appears here
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🎯 Translated Text
                </label>
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder={
                    loading 
                      ? "AI translation in progress... Please wait while Azure O3 processes your content."
                      : "Your AI-powered translation will appear here once processing is complete..."
                  }
                  className="min-h-[300px] bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 text-base"
                />
                {translatedText && (
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      {translatedText.length.toLocaleString()} characters translated
                    </div>
                    <div className="text-xs text-green-600 font-medium flex items-center space-x-1">
                      <Bot className="h-3 w-3" />
                      <span>Azure O3 Translation</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              {translatedText && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      copyToClipboard(translatedText)
                      setError('✅ Translation copied to clipboard!')
                      setTimeout(() => setError(''), 2000)
                    }}
                    className="h-12 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 font-medium transition-all duration-300"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Translation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const selectedLang = LANGUAGES.find(lang => lang.code === targetLanguage)
                      const blob = new Blob([translatedText], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `translation-${selectedLang?.name.toLowerCase().replace(' ', '-')}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="h-12 bg-white hover:bg-green-50 border-green-200 hover:border-green-300 text-green-700 font-medium transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">32+</div>
              <div className="text-blue-100 font-medium">Supported Languages</div>
              <div className="text-xs text-blue-200 mt-1">Global Communication</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">Azure O3</div>
              <div className="text-green-100 font-medium">AI Model</div>
              <div className="text-xs text-green-200 mt-1">Latest OpenAI Technology</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">Multi</div>
              <div className="text-purple-100 font-medium">Media Support</div>
              <div className="text-xs text-purple-200 mt-1">Text, Audio & Video</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">Real-time</div>
              <div className="text-orange-100 font-medium">Processing</div>
              <div className="text-xs text-orange-200 mt-1">Instant Results</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
