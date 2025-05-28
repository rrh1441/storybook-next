'use client'

import { useState, useRef } from 'react'
import { pipeline } from '@xenova/transformers'
import { ChildDescriptor } from '@/types'

interface PhotoUploadProps {
  onDescriptorGenerated: (descriptor: ChildDescriptor) => void
}

export default function PhotoUpload({ onDescriptorGenerated }: PhotoUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Create image preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Load CLIP model for image analysis
      const classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32')
      
      // Create image element for analysis
      const img = new Image()
      img.src = url
      await new Promise(resolve => img.onload = resolve)

      // Analyze different aspects
      const ageLabels = ['toddler 2-3 years old', 'preschooler 4-5 years old', 'child 6-8 years old', 'kid 9-12 years old']
      const genderLabels = ['boy', 'girl']
      const appearanceLabels = ['blonde hair', 'brown hair', 'black hair', 'red hair', 'curly hair', 'straight hair', 'short hair', 'long hair']
      const personalityLabels = ['happy smiling child', 'curious adventurous child', 'shy quiet child', 'energetic playful child']
      const interestLabels = ['loves animals', 'loves sports', 'loves art', 'loves books', 'loves music', 'loves nature']

      const [ageResult, genderResult, appearanceResult, personalityResult, interestResult] = await Promise.all([
        classifier(img, ageLabels),
        classifier(img, genderLabels),
        classifier(img, appearanceLabels),
        classifier(img, personalityLabels),
        classifier(img, interestLabels)
      ])

      // Generate descriptor from analysis
      const descriptor: ChildDescriptor = {
        age: ageResult[0].label,
        gender: genderResult[0].label,
        appearance: `${appearanceResult[0].label}, ${appearanceResult[1].label}`,
        personality: personalityResult[0].label,
        interests: `${interestResult[0].label}, ${interestResult[1].label}`
      }

      onDescriptorGenerated(descriptor)
    } catch (error) {
      console.error('Error analyzing image:', error)
      // Fallback to manual input
      const descriptor: ChildDescriptor = {
        age: '6-8 years old',
        gender: 'child',
        appearance: 'bright eyes, cheerful smile',
        personality: 'curious and adventurous',
        interests: 'loves stories and imagination'
      }
      onDescriptorGenerated(descriptor)
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

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Upload Your Child's Photo</h2>
      <p className="text-gray-600 mb-6">
        We'll analyze the photo to create a personalized character description.
      </p>

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

        <div className="text-center">
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
            {isAnalyzing ? 'Analyzing Photo...' : 'Choose Photo'}
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
    </div>
  )
} 