// Character and Story Types
export interface ChildDescriptor {
  age: string
  gender: string
  appearance: string
  personality: string
  interests: string
}

export interface StoryTheme {
  id: string
  name: string
  description: string
  style: string
}

// New Storybook Database Types
export interface Storybook {
  id: string
  user_id: string
  title: string | null
  theme: string
  main_character: string | null
  educational_focus: string | null
  reference_image_url: string | null
  hero_image_url: string | null
  hero_approved: boolean
  hero_generation_attempts: number
  story_approved: boolean
  status: 'draft' | 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface StorybookPage {
  id: string
  storybook_id: string
  page_number: number
  text: string | null
  image_prompt: string | null
  image_url: string | null
  image_status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

// Form Types
export interface StorybookCreationParams {
  theme: string
  mainCharacter?: string
  educationalFocus?: string
  additionalInstructions?: string
  referenceImageUrl: string
}

export interface CharacterCreationInput {
  photoFile?: File
  description?: string
  characterName?: string
}

// UI State Types
export interface HeroGenerationState {
  isGenerating: boolean
  attemptCount: number
  currentImage: string | null
  approved: boolean
}

export interface StoryGenerationState {
  isGenerating: boolean
  pages: string[]
  approved: boolean
  title: string | null
}

// Legacy Types (keeping for backward compatibility)
export interface StoryPage {
  pageNumber: number
  text: string
  imagePrompt?: string
  imageUrl?: string
}

export interface Order {
  id: string
  userId?: string
  email: string
  childDescriptor: ChildDescriptor
  theme: StoryTheme
  storyIdea: string
  heroImageUrl?: string
  previewPages: StoryPage[]
  fullStory?: StoryPage[]
  status: 'pending' | 'generating_preview' | 'preview_ready' | 'paid' | 'generating_full' | 'completed' | 'failed'
  progress: number
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
}

export interface GenerationProgress {
  orderId: string
  stage: string
  progress: number
  message: string
  error?: string
} 