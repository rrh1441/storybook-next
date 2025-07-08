'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGenerateHeroImage } from '@/hooks/useStorybooks'
import { ChildDescriptor, HeroGenerationState } from '@/types'

interface HeroGeneratorProps {
  character: ChildDescriptor
  onHeroApproved: (heroImageUrl: string) => void
  initialState?: HeroGenerationState
}

export default function HeroGenerator({ character, onHeroApproved, initialState }: HeroGeneratorProps) {
  const [heroState, setHeroState] = useState<HeroGenerationState>(
    initialState || {
      isGenerating: false,
      attemptCount: 0,
      currentImage: null,
      approved: false
    }
  )

  const generateHeroMutation = useGenerateHeroImage()

  // Create character description for AI
  const createCharacterPrompt = () => {
    return `A ${character.age} ${character.gender} with ${character.appearance}. 
    Personality: ${character.personality}. 
    Interests: ${character.interests}.`
  }

  const handleGenerateHero = async () => {
    if (heroState.attemptCount >= 2) {
      alert('You have reached the maximum number of generation attempts (2).')
      return
    }

    setHeroState(prev => ({ 
      ...prev, 
      isGenerating: true 
    }))

    try {
      const characterPrompt = createCharacterPrompt()
      const imageUrl = await generateHeroMutation.mutateAsync(characterPrompt)
      
      setHeroState(prev => ({
        ...prev,
        isGenerating: false,
        attemptCount: prev.attemptCount + 1,
        currentImage: imageUrl,
        approved: false
      }))
    } catch (error) {
      console.error('Failed to generate hero image:', error)
      setHeroState(prev => ({ 
        ...prev, 
        isGenerating: false 
      }))
      alert('Failed to generate hero image. Please try again.')
    }
  }

  const handleApproveHero = () => {
    if (!heroState.currentImage) return
    
    setHeroState(prev => ({ 
      ...prev, 
      approved: true 
    }))
    
    onHeroApproved(heroState.currentImage)
  }

  const handleRejectHero = () => {
    setHeroState(prev => ({ 
      ...prev, 
      currentImage: null,
      approved: false 
    }))
  }

  const canRegenerate = heroState.attemptCount < 2
  const attemptsRemaining = 2 - heroState.attemptCount

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Generate Your Hero Character</h3>
        <p className="text-gray-600 text-sm">
          We'll create an AI-generated illustration of your character based on their description.
        </p>
      </div>

      {/* Character Description Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Character Description:</h4>
        <p className="text-sm text-blue-800">{createCharacterPrompt()}</p>
      </div>

      {/* Hero Generation Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {heroState.currentImage ? (
          // Show generated hero image
          <div className="text-center space-y-4">
            <img 
              src={heroState.currentImage} 
              alt="Generated hero character" 
              className="max-w-sm mx-auto rounded-lg shadow-lg"
            />
            
            <div className="space-y-3">
              <h4 className="font-medium">Do you like this hero character?</h4>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleApproveHero}
                  disabled={heroState.approved}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {heroState.approved ? 'Approved!' : 'Yes, I love it!'}
                </Button>
                
                {!heroState.approved && (
                  <Button
                    variant="outline"
                    onClick={handleRejectHero}
                    disabled={!canRegenerate}
                  >
                    No, try again
                  </Button>
                )}
              </div>
              
              {!heroState.approved && (
                <p className="text-sm text-gray-500">
                  {canRegenerate 
                    ? `You have ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`
                    : 'No more attempts remaining'
                  }
                </p>
              )}
            </div>
          </div>
        ) : (
          // Show generation button or loading
          <div className="text-center space-y-4">
            {heroState.isGenerating ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
                <div>
                  <h4 className="font-medium">Creating your hero character...</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    This may take 30-60 seconds. Our AI is crafting the perfect illustration!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Ready to generate your hero!</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Click below to create an AI-generated illustration of your character.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateHero}
                  disabled={!canRegenerate || generateHeroMutation.isPending}
                  className="mt-4"
                >
                  {heroState.attemptCount === 0 
                    ? 'Generate Hero Character' 
                    : `Try Again (${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} left)`
                  }
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generation Progress Info */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>Attempt:</span>
          <div className="flex space-x-1">
            {[1, 2].map((attempt) => (
              <div
                key={attempt}
                className={`w-3 h-3 rounded-full ${
                  attempt <= heroState.attemptCount 
                    ? 'bg-orange-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span>({heroState.attemptCount}/2)</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900">Tips for best results</h4>
            <ul className="text-sm text-yellow-800 mt-1 list-disc list-inside space-y-1">
              <li>The AI will create a child-friendly, storybook-style illustration</li>
              <li>You have 2 attempts to get the perfect hero character</li>
              <li>Each generation is unique - no two images will be exactly the same</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}