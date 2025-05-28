import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'
import { createHeroImagePrompt, createTeaserStoryPrompt } from '@/lib/prompts'
import { ChildDescriptor, StoryTheme, StoryPage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { childDescriptor, theme, storyIdea, email }: {
      childDescriptor: ChildDescriptor
      theme: StoryTheme
      storyIdea: string
      email: string
    } = await request.json()

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        email,
        child_descriptor: childDescriptor,
        theme,
        story_idea: storyIdea,
        status: 'generating_preview',
        progress: 0,
        preview_pages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Generate hero image and story in parallel
    const [heroImageResponse, storyResponse] = await Promise.all([
      openai.images.generate({
        model: 'dall-e-3',
        prompt: createHeroImagePrompt(childDescriptor, theme),
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a world-class children\'s book author. Write engaging, age-appropriate stories that make children the hero of their own adventure.',
          },
          {
            role: 'user',
            content: createTeaserStoryPrompt(childDescriptor, storyIdea),
          },
        ],
        temperature: 0.8,
      }),
    ])

    const heroImageUrl = heroImageResponse.data[0].url!
    const storyText = storyResponse.choices[0].message.content!

    // Parse story pages
    const pageMatches = storyText.match(/Page \d+: (.+?)(?=Page \d+:|$)/gs)
    const previewPages: StoryPage[] = pageMatches?.map((match, index) => {
      const text = match.replace(/Page \d+: /, '').trim()
      return {
        pageNumber: index + 1,
        text,
      }
    }) || []

    // Update order with results
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        hero_image_url: heroImageUrl,
        preview_pages: previewPages,
        status: 'preview_ready',
        progress: 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`)
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
} 