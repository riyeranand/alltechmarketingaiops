'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function WhisperTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select an audio file first')
      return
    }

    setLoading(true)
    setError('')
    setTranscription('')

    try {
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      setTranscription(data.transcription)
      console.log('Transcription result:', data)

    } catch (err: unknown) {
      console.error('Transcription error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Azure Whisper Test</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Audio Transcription Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Audio File
              </label>
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.webm"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button 
              onClick={handleTranscribe}
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? 'Transcribing...' : 'Transcribe Audio'}
            </Button>
          </CardContent>
        </Card>

        {transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription Result</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={transcription}
                readOnly
                className="min-h-[200px] bg-gray-50"
                placeholder="Transcription will appear here..."
              />
              <div className="mt-2 text-sm text-gray-600">
                Characters: {transcription.length}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
