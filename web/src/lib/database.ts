import { supabase, supabaseAdmin } from './supabase'
import { Storybook, StorybookPage, StorybookCreationParams } from '@/types'

// Storybook CRUD operations
export async function createStorybook(params: StorybookCreationParams): Promise<{ data: Storybook | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data, error } = await supabase
      .from('storybooks')
      .insert({
        user_id: user.id,
        theme: params.theme,
        main_character: params.mainCharacter,
        educational_focus: params.educationalFocus,
        reference_image_url: params.referenceImageUrl,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getStorybooksByUser(): Promise<{ data: Storybook[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data, error } = await supabase
      .from('storybooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getStorybookById(id: string): Promise<{ data: Storybook | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('storybooks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function updateStorybook(id: string, updates: Partial<Storybook>): Promise<{ data: Storybook | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('storybooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Storybook Pages CRUD operations
export async function createStorybookPages(storybookId: string, pages: { page_number: number; text: string }[]): Promise<{ data: StorybookPage[] | null; error: Error | null }> {
  try {
    const pagesToInsert = pages.map(page => ({
      storybook_id: storybookId,
      page_number: page.page_number,
      text: page.text,
      image_status: 'pending' as const
    }))

    const { data, error } = await supabase
      .from('storybook_pages')
      .insert(pagesToInsert)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getStorybookPages(storybookId: string): Promise<{ data: StorybookPage[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('storybook_pages')
      .select('*')
      .eq('storybook_id', storybookId)
      .order('page_number', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function updateStorybookPage(id: string, updates: Partial<StorybookPage>): Promise<{ data: StorybookPage | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('storybook_pages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Story generation functions (for API routes)
export async function generateStoryText(params: {
  theme: string
  mainCharacter?: string
  educationalFocus?: string
  additionalInstructions?: string
}): Promise<{ pageTexts: string[]; title: string }> {
  // This will be used in API routes to call external AI services
  // Implementation will depend on the AI service you choose
  throw new Error('generateStoryText not implemented yet')
}

export async function generateHeroImage(characterDescription: string): Promise<string> {
  // This will be used in API routes to call GPT-4o image model
  // Implementation will depend on the AI service configuration
  throw new Error('generateHeroImage not implemented yet')
}

export async function generatePageImages(storybookId: string, referenceImageUrl: string): Promise<void> {
  // This will be used in API routes to generate images for all pages
  // Implementation will depend on the AI service configuration
  throw new Error('generatePageImages not implemented yet')
}