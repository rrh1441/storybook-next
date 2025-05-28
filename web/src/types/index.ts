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