'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  useCreateStorybook, 
  useGenerateStoryText, 
  useUpdateStorybook,
  useCreateStorybookPages,
  useGeneratePageImages
} from '@/hooks/useStorybooks'
import { StorybookCreationParams, HeroGenerationState, StoryGenerationState, ChildDescriptor } from '@/types'
import CharacterCreator from './CharacterCreator'
import HeroGenerator from './HeroGenerator'
import ThemeSelector from './ThemeSelector'

// Zod schema for form validation
const storybookParamsSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
  mainCharacter: z.string().optional(),
  educationalFocus: z.string().optional(),
  additionalInstructions: z.string().max(500, 'Additional instructions must be 500 characters or less').optional(),
  referenceImageUrl: z.string().url('Please enter a valid URL')
})

type StorybookParams = z.infer<typeof storybookParamsSchema>

export default function StorybookCreator() {
  const [activeTab, setActiveTab] = useState('outline')
  const [storybookId, setStorybookId] = useState<string | null>(null)
  const [pageTexts, setPageTexts] = useState<string[]>([])
  const [storyTitle, setStoryTitle] = useState<string | null>(null)
  
  // Character creation state
  const [character, setCharacter] = useState<ChildDescriptor | null>(null)
  const [showCharacterCreator, setShowCharacterCreator] = useState(true)
  
  // Hero generation state
  const [heroState, setHeroState] = useState<HeroGenerationState>({
    isGenerating: false,
    attemptCount: 0,
    currentImage: null,
    approved: false
  })
  const [showHeroGenerator, setShowHeroGenerator] = useState(false)
  
  // Story generation state
  const [storyState, setStoryState] = useState<StoryGenerationState>({
    isGenerating: false,
    pages: [],
    approved: false,
    title: null
  })

  // Theme selection state
  const [customTheme, setCustomTheme] = useState('')

  // Form setup
  const form = useForm<StorybookParams>({
    resolver: zodResolver(storybookParamsSchema),
    defaultValues: {
      theme: '',
      mainCharacter: '',
      educationalFocus: '',
      additionalInstructions: '',
      referenceImageUrl: ''
    }
  })

  // Mutations
  const createStorybookMutation = useCreateStorybook()
  const updateStorybookMutation = useUpdateStorybook()
  const generateStoryTextMutation = useGenerateStoryText()
  const createPagesMutation = useCreateStorybookPages()
  const generateImagesMutation = useGeneratePageImages()

  // Handle character creation
  const handleCharacterCreated = (newCharacter: ChildDescriptor) => {
    setCharacter(newCharacter)
    setShowCharacterCreator(false)
    setShowHeroGenerator(true)
    
    // Auto-fill character name if provided
    if (newCharacter.appearance?.includes('name:')) {
      const nameMatch = newCharacter.appearance.match(/name:\s*([^,]+)/i)
      if (nameMatch) {
        form.setValue('mainCharacter', nameMatch[1].trim())
      }
    }
  }

  // Handle hero approval
  const handleHeroApproved = (heroImageUrl: string) => {
    setHeroState(prev => ({ 
      ...prev, 
      currentImage: heroImageUrl, 
      approved: true 
    }))
    setShowHeroGenerator(false)
    
    // Auto-fill reference image URL
    form.setValue('referenceImageUrl', heroImageUrl)
  }

  // Tab navigation helpers
  const isCharacterComplete = () => character !== null
  const isHeroComplete = () => heroState.approved && heroState.currentImage !== null
  const isOutlineTabComplete = () => pageTexts.length > 0
  const isEditTextTabComplete = () => storyState.approved
  const isImagesTabComplete = () => false // Will implement later

  // Handle story text generation
  const handleGenerateStoryText = async (data: StorybookParams) => {
    try {
      setStoryState(prev => ({ ...prev, isGenerating: true }))
      
      const result = await generateStoryTextMutation.mutateAsync({
        theme: data.theme,
        mainCharacter: data.mainCharacter,
        educationalFocus: data.educationalFocus,
        additionalInstructions: data.additionalInstructions
      })
      
      setPageTexts(result.pageTexts)
      setStoryTitle(result.title)
      setStoryState({
        isGenerating: false,
        pages: result.pageTexts,
        approved: false,
        title: result.title
      })
      
      // Switch to edit text tab
      setActiveTab('edit-text')
    } catch (error) {
      console.error('Failed to generate story text:', error)
      setStoryState(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // Handle save and generate images
  const handleSaveAndGenerateImages = async () => {
    const formData = form.getValues()
    
    try {
      // Create storybook record
      const storybook = await createStorybookMutation.mutateAsync({
        theme: formData.theme,
        mainCharacter: formData.mainCharacter,
        educationalFocus: formData.educationalFocus,
        additionalInstructions: formData.additionalInstructions,
        referenceImageUrl: formData.referenceImageUrl
      })
      
      if (!storybook) throw new Error('Failed to create storybook')
      
      setStorybookId(storybook.id)
      
      // Update with story title
      if (storyTitle) {
        await updateStorybookMutation.mutateAsync({
          id: storybook.id,
          updates: { title: storyTitle }
        })
      }
      
      // Create pages
      const pagesData = pageTexts.map((text, index) => ({
        page_number: index + 1,
        text
      }))
      
      await createPagesMutation.mutateAsync({
        storybookId: storybook.id,
        pages: pagesData
      })
      
      // Generate images
      await generateImagesMutation.mutateAsync({
        storybookId: storybook.id,
        referenceImageUrl: formData.referenceImageUrl
      })
      
      // Mark story as approved and switch to images tab
      setStoryState(prev => ({ ...prev, approved: true }))
      setActiveTab('images-pdf')
      
    } catch (error) {
      console.error('Failed to save and generate images:', error)
    }
  }

  // Handle page text updates
  const handlePageTextChange = (index: number, newText: string) => {
    const updatedPages = [...pageTexts]
    updatedPages[index] = newText
    setPageTexts(updatedPages)
    setStoryState(prev => ({ ...prev, pages: updatedPages }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Your Storybook</h1>
          <p className="text-gray-600 mt-1">Bring your child's adventure to life with AI-generated stories and illustrations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="edit-text" disabled={!isOutlineTabComplete()}>
              Edit Text
            </TabsTrigger>
            <TabsTrigger value="images-pdf" disabled={!isEditTextTabComplete()}>
              Images & PDF
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Outline */}
          <TabsContent value="outline" className="space-y-6">
            {/* Character Creation Step */}
            {showCharacterCreator && (
              <div className="bg-white rounded-lg shadow p-6">
                <CharacterCreator 
                  onCharacterCreated={handleCharacterCreated}
                  isLoading={storyState.isGenerating}
                />
              </div>
            )}

            {/* Character Summary (when character is created) */}
            {character && !showCharacterCreator && !showHeroGenerator && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900">Character Created!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      {character.appearance}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowCharacterCreator(true)
                      setShowHeroGenerator(false)
                    }}
                  >
                    Edit Character
                  </Button>
                </div>
              </div>
            )}

            {/* Hero Generation Step */}
            {character && showHeroGenerator && (
              <div className="bg-white rounded-lg shadow p-6">
                <HeroGenerator 
                  character={character}
                  onHeroApproved={handleHeroApproved}
                  initialState={heroState}
                />
              </div>
            )}

            {/* Hero Summary (when hero is approved) */}
            {isHeroComplete() && !showHeroGenerator && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={heroState.currentImage!} 
                      alt="Approved hero character" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-green-900">Hero Character Approved!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your personalized hero character is ready for the story.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHeroGenerator(true)}
                  >
                    Change Hero
                  </Button>
                </div>
              </div>
            )}

            {/* Story Theme Selection (shown when character and hero are complete) */}
            {isCharacterComplete() && isHeroComplete() && (
              <div className="bg-white rounded-lg shadow p-6">
                <ThemeSelector
                  selectedTheme={form.watch('theme')}
                  onThemeChange={(theme) => form.setValue('theme', theme)}
                  customTheme={customTheme}
                  onCustomThemeChange={setCustomTheme}
                  mainCharacter={form.watch('mainCharacter')}
                  onMainCharacterChange={(character) => form.setValue('mainCharacter', character)}
                  educationalFocus={form.watch('educationalFocus')}
                  onEducationalFocusChange={(focus) => form.setValue('educationalFocus', focus)}
                  additionalInstructions={form.watch('additionalInstructions')}
                  onAdditionalInstructionsChange={(instructions) => form.setValue('additionalInstructions', instructions)}
                />
                
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      const formData = form.getValues()
                      if (!formData.theme) {
                        alert('Please select a theme for your story')
                        return
                      }
                      handleGenerateStoryText(formData)
                    }}
                    disabled={storyState.isGenerating || !form.watch('theme')}
                    className="w-full"
                  >
                    {storyState.isGenerating ? 'Creating Your Story...' : 'Generate Personalized Story'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Edit Text */}
          <TabsContent value="edit-text" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {storyTitle ? `"${storyTitle}"` : 'Review Your Story'}
              </h2>
              
              {pageTexts.length > 0 ? (
                <div className="space-y-6">
                  {/* Story Review Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Story Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <strong>Title:</strong> {storyTitle}
                      </div>
                      <div>
                        <strong>Pages:</strong> {pageTexts.length}
                      </div>
                      <div>
                        <strong>Theme:</strong> {form.watch('theme')}
                      </div>
                      {form.watch('mainCharacter') && (
                        <div>
                          <strong>Main Character:</strong> {form.watch('mainCharacter')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editable Pages */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Edit Story Pages</h3>
                    <p className="text-sm text-gray-600">
                      Review and edit each page of your story. Make any changes you'd like before we create the illustrations.
                    </p>
                    
                    {pageTexts.map((text, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`page-${index}`} className="font-semibold">
                            Page {index + 1}
                          </Label>
                          <span className="text-xs text-gray-500">
                            {text.length} characters
                          </span>
                        </div>
                        <Textarea
                          id={`page-${index}`}
                          value={text}
                          onChange={(e) => handlePageTextChange(index, e.target.value)}
                          rows={4}
                          className="resize-none"
                          placeholder={`Write the content for page ${index + 1}...`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Story Approval Section */}
                  {!storyState.approved && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Ready to Create Your Storybook?</h3>
                      <p className="text-sm text-yellow-800 mb-4">
                        Once you approve this story, we'll create beautiful illustrations for each page. 
                        You can still make minor edits later, but major changes will require regenerating images.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleSaveAndGenerateImages}
                          disabled={createStorybookMutation.isPending || createPagesMutation.isPending || generateImagesMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {createStorybookMutation.isPending || createPagesMutation.isPending || generateImagesMutation.isPending
                            ? 'Creating Storybook...' 
                            : 'Approve Story & Generate Images'
                          }
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('outline')}
                          disabled={createStorybookMutation.isPending || createPagesMutation.isPending || generateImagesMutation.isPending}
                        >
                          Back to Edit Theme
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Story Approved Status */}
                  {storyState.approved && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-green-900">Story Approved!</h3>
                          <p className="text-sm text-green-800">
                            Your storybook is being created with beautiful illustrations. Check the Images & PDF tab to see progress.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Story Generated Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Complete the story outline in the previous tab to generate your personalized story.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('outline')}
                  >
                    Go to Story Outline
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Images & PDF */}
          <TabsContent value="images-pdf" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Completed Storybook</h2>
              
              {storybookId ? (
                <div className="space-y-6">
                  {/* Generation Progress */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Generation Progress</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">Story text created and saved</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">Hero character approved</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Generating page illustrations...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-500">PDF compilation (will start after images)</span>
                      </div>
                    </div>
                  </div>

                  {/* Story Overview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Storybook Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Title:</strong> {storyTitle}
                      </div>
                      <div>
                        <strong>Theme:</strong> {form.watch('theme')}
                      </div>
                      <div>
                        <strong>Pages:</strong> {pageTexts.length}
                      </div>
                      {form.watch('mainCharacter') && (
                        <div>
                          <strong>Main Character:</strong> {form.watch('mainCharacter')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page Preview */}
                  <div>
                    <h3 className="font-semibold mb-4">Story Pages</h3>
                    <div className="space-y-4">
                      {pageTexts.map((text, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            {/* Image placeholder/generated image */}
                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <div className="text-center">
                                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-gray-500">Generating...</span>
                              </div>
                            </div>
                            
                            {/* Page content */}
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">Page {index + 1}</h4>
                              <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Section */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Download Your Storybook</h3>
                    <p className="text-sm text-green-800 mb-4">
                      Once all illustrations are complete, you'll be able to download your personalized storybook as a high-quality PDF.
                    </p>
                    <Button 
                      disabled={true}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF (Generating...)
                    </Button>
                  </div>

                  {/* Estimated Time */}
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Estimated completion time: 3-5 minutes</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Storybook in Progress</h3>
                  <p className="text-gray-500 mb-4">
                    Complete the story creation and approval process to see your illustrated storybook here.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('outline')}
                  >
                    Start Creating Story
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}