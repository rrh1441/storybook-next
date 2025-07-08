'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterCreationInput, ChildDescriptor } from '@/types'

interface CharacterCreatorProps {
  onCharacterCreated: (character: ChildDescriptor) => void
  isLoading?: boolean
}

export default function CharacterCreator({ onCharacterCreated, isLoading = false }: CharacterCreatorProps) {
  const [activeMethod, setActiveMethod] = useState<'photo' | 'description'>('photo')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [textDescription, setTextDescription] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle photo upload
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // Process photo using client-side AI (using @xenova/transformers)
  const processPhoto = async (file: File): Promise<ChildDescriptor> => {
    try {
      // Dynamic import to avoid SSR issues
      const { pipeline } = await import('@xenova/transformers')
      
      // Create image preview
      const url = URL.createObjectURL(file)

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

      // Clean up the object URL
      URL.revokeObjectURL(url)

      // Generate descriptor from analysis
      return {
        age: ageResult[0].label,
        gender: genderResult[0].label,
        appearance: `${appearanceResult[0].label}, ${appearanceResult[1].label}`,
        personality: personalityResult[0].label,
        interests: `${interestResult[0].label}, ${interestResult[1].label}`
      }
    } catch (error) {
      console.error('Error processing photo:', error)
      
      // Fallback to generic description
      return {
        age: '6-8 years old',
        gender: 'child',
        appearance: 'bright eyes, cheerful smile',
        personality: 'curious and adventurous',
        interests: 'loves stories and imagination'
      }
    }
  }

  // Process text description into structured format
  const processTextDescription = (description: string, name: string): ChildDescriptor => {
    // Simple processing - in reality, you might use AI to structure this better
    return {
      age: 'not specified',
      gender: 'child',
      appearance: description,
      personality: 'unique and special',
      interests: 'various adventures'
    }
  }

  // Handle character creation
  const handleCreateCharacter = async () => {
    setIsProcessing(true)
    
    try {
      let character: ChildDescriptor

      if (activeMethod === 'photo' && photoFile) {
        character = await processPhoto(photoFile)
      } else if (activeMethod === 'description' && textDescription.trim()) {
        character = processTextDescription(textDescription, characterName)
      } else {
        throw new Error('Please provide either a photo or description')
      }

      // Add character name if provided
      if (characterName.trim()) {
        character = {
          ...character,
          // We could add a name field to the ChildDescriptor type if needed
        }
      }

      onCharacterCreated(character)
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Failed to create character. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const canCreateCharacter = () => {
    if (activeMethod === 'photo') {
      return photoFile !== null
    } else {
      return textDescription.trim().length > 0
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Create Your Hero Character</h3>
        <p className="text-gray-600 text-sm">
          Choose how you'd like to create your child's character. We'll keep all photos private and only use them to generate character descriptions.
        </p>
      </div>

      <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as 'photo' | 'description')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo">Upload Photo</TabsTrigger>
          <TabsTrigger value="description">Text Description</TabsTrigger>
        </TabsList>

        <TabsContent value="photo" className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {photoPreview ? (
              <div className="space-y-4">
                <img 
                  src={photoPreview} 
                  alt="Child preview" 
                  className="max-w-48 max-h-48 mx-auto rounded-lg object-cover"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                >
                  Remove Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Click to upload a photo</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-4">
          <div>
            <Label htmlFor="text-description">Describe Your Child</Label>
            <Textarea
              id="text-description"
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Describe your child's appearance, personality, and interests. For example: 'A 7-year-old with curly brown hair, bright green eyes, and a love for dinosaurs and adventure books.'"
              rows={4}
              className="mt-2"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Character Name Input (common to both methods) */}
      <div>
        <Label htmlFor="character-name">Character Name (Optional)</Label>
        <Input
          id="character-name"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="Enter your child's name to personalize the story"
          className="mt-2"
        />
      </div>

      {/* Create Character Button */}
      <Button
        onClick={handleCreateCharacter}
        disabled={!canCreateCharacter() || isProcessing || isLoading}
        className="w-full"
      >
        {isProcessing 
          ? 'Creating Character...' 
          : isLoading 
          ? 'Please wait...'
          : 'Create Character & Continue'
        }
      </Button>

      {/* Privacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Privacy Protected</h4>
            <p className="text-sm text-blue-700 mt-1">
              Photos are processed locally in your browser and never sent to our servers. 
              Only the generated character description is used to create your storybook.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}