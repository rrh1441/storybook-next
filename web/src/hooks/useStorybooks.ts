import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  createStorybook, 
  getStorybooksByUser, 
  getStorybookById, 
  updateStorybook,
  createStorybookPages,
  getStorybookPages,
  updateStorybookPage
} from '@/lib/database'
import { Storybook, StorybookPage, StorybookCreationParams } from '@/types'

// Storybook queries
export function useStorybooks() {
  return useQuery({
    queryKey: ['storybooks'],
    queryFn: async () => {
      const { data, error } = await getStorybooksByUser()
      if (error) throw error
      return data || []
    },
  })
}

export function useStorybook(id: string) {
  return useQuery({
    queryKey: ['storybook', id],
    queryFn: async () => {
      const { data, error } = await getStorybookById(id)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useStorybookPages(storybookId: string) {
  return useQuery({
    queryKey: ['storybook-pages', storybookId],
    queryFn: async () => {
      const { data, error } = await getStorybookPages(storybookId)
      if (error) throw error
      return data || []
    },
    enabled: !!storybookId,
  })
}

// Storybook mutations
export function useCreateStorybook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: StorybookCreationParams) => {
      const { data, error } = await createStorybook(params)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storybooks'] })
    },
  })
}

export function useUpdateStorybook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Storybook> }) => {
      const { data, error } = await updateStorybook(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['storybooks'] })
        queryClient.invalidateQueries({ queryKey: ['storybook', data.id] })
      }
    },
  })
}

export function useCreateStorybookPages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ storybookId, pages }: { 
      storybookId: string
      pages: { page_number: number; text: string }[]
    }) => {
      const { data, error } = await createStorybookPages(storybookId, pages)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storybook-pages', variables.storybookId] })
    },
  })
}

export function useUpdateStorybookPage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StorybookPage> }) => {
      const { data, error } = await updateStorybookPage(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['storybook-pages', data.storybook_id] })
      }
    },
  })
}

// AI Generation mutations
export function useGenerateStoryText() {
  return useMutation({
    mutationFn: async (params: {
      theme: string
      mainCharacter?: string
      educationalFocus?: string
      additionalInstructions?: string
    }) => {
      const response = await fetch('/api/generate-story-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate story text')
      }
      
      const data = await response.json()
      return data as { pageTexts: string[]; title: string }
    },
  })
}

export function useGenerateHeroImage() {
  return useMutation({
    mutationFn: async (characterDescription: string) => {
      const response = await fetch('/api/generate-hero-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterDescription }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate hero image')
      }
      
      const data = await response.json()
      return data.imageUrl as string
    },
  })
}

export function useGeneratePageImages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ storybookId, referenceImageUrl }: {
      storybookId: string
      referenceImageUrl: string
    }) => {
      const response = await fetch('/api/generate-page-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storybookId, referenceImageUrl }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate page images')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storybook-pages', variables.storybookId] })
      queryClient.invalidateQueries({ queryKey: ['storybook', variables.storybookId] })
    },
  })
}