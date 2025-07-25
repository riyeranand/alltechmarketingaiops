'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [status, setStatus] = useState('Testing connection...')
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const supabase = createClient()
      
      // Test basic connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(`Connection error: ${error.message}`)
        setStatus('Connection failed')
      } else {
        setStatus('Connection successful!')
        console.log('Supabase connection test:', data)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Error: ${errorMessage}`)
      setStatus('Connection failed')
    }
  }

  const testSignUp = async () => {
    try {
      const supabase = createClient()
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'testpassword123'
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        setError(`Sign up test failed: ${error.message}`)
      } else {
        setStatus('Sign up test successful! Check console for details.')
        console.log('Sign up test result:', data)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Sign up error: ${errorMessage}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <strong>Status:</strong> {status}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Button onClick={testConnection} className="w-full">
              Test Connection
            </Button>
            <Button onClick={testSignUp} variant="outline" className="w-full">
              Test Sign Up
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            Check browser console for detailed logs
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
