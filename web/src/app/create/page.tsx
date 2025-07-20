'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PhotoUpload from '@/components/PhotoUpload'
import ThemeSelector from '@/components/ThemeSelector'
import StoryIdeaInput from '@/components/StoryIdeaInput'
import { ChildDescriptor, StoryTheme } from '@/types'
import { showToast } from '@/components/ui/toast'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [childDescriptor, setChildDescriptor] = useState<ChildDescriptor | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | null>(null)
  const [email, setEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDescriptorGenerated = (descriptor: ChildDescriptor) => {
    setChildDescriptor(descriptor)
    setStep(2)
  }

  const handleThemeSelected = (theme: StoryTheme) => {
    setSelectedTheme(theme)
    setStep(3)
  }

  const handleStoryIdeaSubmitted = async (storyIdea: string) => {
    if (!childDescriptor || !selectedTheme || !email) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childDescriptor,
          theme: selectedTheme,
          storyIdea,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const { orderId } = await response.json()
      showToast('Preview generated successfully!', 'success')
      router.push(`/preview?order_id=${orderId}`)
    } catch (error) {
      console.error('Error generating preview:', error)
      showToast('Failed to generate preview. Please try again.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">Storybook</h1>
          <div className="text-sm text-gray-500">
            Step {step} of 4
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      stepNumber < step ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Photo</span>
            <span>Theme</span>
            <span>Story</span>
            <span>Preview</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <PhotoUpload onDescriptorGenerated={handleDescriptorGenerated} />
          )}

          {step === 2 && (
            <ThemeSelector onThemeSelected={handleThemeSelected} />
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We'll send your storybook preview and final PDF to this email.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                  required
                />
                <button
                  onClick={() => setStep(4)}
                  disabled={!email}
                  className="btn-primary w-full mt-4"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Review Your Choices</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Child:</span> {childDescriptor?.age}, {childDescriptor?.appearance}
                  </div>
                  <div>
                    <span className="font-medium">Art Style:</span> {selectedTheme?.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {email}
                  </div>
                </div>
              </div>

              <StoryIdeaInput onStoryIdeaSubmitted={handleStoryIdeaSubmitted} />

              {isGenerating && (
                <div className="card text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Creating Your Preview</h3>
                  <p className="text-gray-600">
                    We're generating your child's hero image and story preview. This takes about 60 seconds...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 