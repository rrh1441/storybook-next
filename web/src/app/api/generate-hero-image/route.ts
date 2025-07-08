import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { characterDescription, storybookId } = await request.json()

    if (!characterDescription) {
      return NextResponse.json(
        { error: 'Character description is required' },
        { status: 400 }
      )
    }

    // Create a detailed prompt for hero image generation
    const prompt = `Create a charming, child-friendly hero character illustration based on this description: ${characterDescription}. 
    
Style: Children's book illustration, bright and colorful, friendly and approachable, suitable for ages 4-10. 
The character should be the main hero of a storybook adventure.
The illustration should be high quality, engaging, and perfect for a children's book cover.
Background: Simple, clean background that doesn't distract from the character.
Mood: Happy, adventurous, inspiring.

Make this character look like they're ready for an amazing adventure!`

    // Generate image using OpenAI GPT-4o image model
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
      n: 1,
    })

    const imageUrl = imageResponse.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    // If storybookId is provided, update the storybook record
    if (storybookId) {
      const { error: updateError } = await supabaseAdmin
        .from('storybooks')
        .update({
          hero_image_url: imageUrl,
          hero_generation_attempts: 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', storybookId)

      if (updateError) {
        console.error('Failed to update storybook with hero image:', updateError)
        // Continue anyway, we still have the image
      }
    }

    return NextResponse.json({
      imageUrl,
      success: true
    })

  } catch (error) {
    console.error('Error generating hero image:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate hero image' },
      { status: 500 }
    )
  }
}