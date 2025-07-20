'use client'

import { useState, useRef } from 'react'
import { ChildDescriptor } from '@/types'

interface PhotoUploadProps {
  onDescriptorGenerated: (descriptor: ChildDescriptor) => void
}

export default function PhotoUpload({ onDescriptorGenerated }: PhotoUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [useManualInput, setUseManualInput] = useState(false)
  const [manualDescriptor, setManualDescriptor] = useState<ChildDescriptor>({
    age: '6-8 years old',
    gender: 'child',
    appearance: '',
    personality: 'curious and adventurous',
    interests: 'loves stories and imagination'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Create image preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Convert to base64 for server-side analysis
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      // Send to server for analysis
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const { descriptor } = await response.json()
      onDescriptorGenerated(descriptor)
    } catch (error) {
      console.error('Error analyzing image:', error)
      // Show manual input form on error
      setUseManualInput(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      analyzeImage(file)
    }
  }

  const handleManualSubmit = () => {
    if (manualDescriptor.appearance.trim()) {
      onDescriptorGenerated(manualDescriptor)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Create Your Child's Character</h2>
      <p className="text-gray-600 mb-6">
        Upload a photo or describe your child to create their personalized character.
      </p>

      {!useManualInput ? (
        <div className="space-y-4">
          {previewUrl && (
            <div className="text-center">
              <img 
                src={previewUrl} 
                alt="Child preview" 
                className="max-w-xs mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="text-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="btn-primary"
            >
              {isAnalyzing ? 'Analyzing Photo...' : 'Upload Photo'}
            </button>

            <div className="text-sm text-gray-500">or</div>

            <button
              onClick={() => setUseManualInput(true)}
              className="btn-secondary"
            >
              Describe Your Child Instead
            </button>
          </div>

          {isAnalyzing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">
                Analyzing your child's photo to create their character...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child's Appearance
            </label>
            <textarea
              value={manualDescriptor.appearance}
              onChange={(e) => setManualDescriptor({ ...manualDescriptor, appearance: e.target.value })}
              placeholder="e.g., Brown curly hair, blue eyes, freckles, cheerful smile..."
              className="input h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Range
            </label>
            <select
              value={manualDescriptor.age}
              onChange={(e) => setManualDescriptor({ ...manualDescriptor, age: e.target.value })}
              className="input"
            >
              <option value="2-3 years old">2-3 years old</option>
              <option value="4-5 years old">4-5 years old</option>
              <option value="6-8 years old">6-8 years old</option>
              <option value="9-12 years old">9-12 years old</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personality
            </label>
            <input
              type="text"
              value={manualDescriptor.personality}
              onChange={(e) => setManualDescriptor({ ...manualDescriptor, personality: e.target.value })}
              placeholder="e.g., curious and adventurous"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests
            </label>
            <input
              type="text"
              value={manualDescriptor.interests}
              onChange={(e) => setManualDescriptor({ ...manualDescriptor, interests: e.target.value })}
              placeholder="e.g., loves animals and nature"
              className="input"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleManualSubmit}
              disabled={!manualDescriptor.appearance.trim()}
              className="btn-primary flex-1"
            >
              Create Character
            </button>
            <button
              onClick={() => {
                setUseManualInput(false)
                setPreviewUrl(null)
              }}
              className="btn-secondary"
            >
              Back to Photo Upload
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 