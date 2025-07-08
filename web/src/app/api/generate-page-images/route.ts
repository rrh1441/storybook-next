import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { storybookId, referenceImageUrl } = await request.json()

    if (!storybookId) {
      return NextResponse.json(
        { error: 'Storybook ID is required' },
        { status: 400 }
      )
    }

    // Get the storybook and its pages
    const { data: storybook, error: storybookError } = await supabaseAdmin
      .from('storybooks')
      .select('*')
      .eq('id', storybookId)
      .single()

    if (storybookError || !storybook) {
      return NextResponse.json(
        { error: 'Storybook not found' },
        { status: 404 }
      )
    }

    const { data: pages, error: pagesError } = await supabaseAdmin
      .from('storybook_pages')
      .select('*')
      .eq('storybook_id', storybookId)
      .order('page_number', { ascending: true })

    if (pagesError || !pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages found for this storybook' },
        { status: 404 }
      )
    }

    // Generate images for each page
    const results = []
    
    for (const page of pages) {
      try {
        // Update status to generating
        await supabaseAdmin
          .from('storybook_pages')
          .update({ 
            image_status: 'generating',
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id)

        // Create image prompt based on page text
        const imagePrompt = `Children's storybook illustration, whimsical and bright style. 
        
Scene: ${page.text}

Style: Colorful, engaging children's book illustration, similar to classic picture books. 
Bright colors, friendly characters, suitable for ages 4-8.
The main character should be consistent with the hero character from this storybook.
Background: Detailed but not overwhelming, supporting the story.
Mood: ${storybook.theme === 'adventure' ? 'Exciting and adventurous' : 'Warm and engaging'}.

High quality illustration that would work perfectly in a printed children's book.`

        // Generate image with OpenAI GPT-4o image model
        const imageResponse = await openai.images.generate({
          model: "gpt-image-1",
          prompt: imagePrompt,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
          n: 1,
        })

        const imageUrl = imageResponse.data[0]?.url

        if (imageUrl) {
          // Update the page with the generated image
          await supabaseAdmin
            .from('storybook_pages')
            .update({
              image_url: imageUrl,
              image_prompt: imagePrompt,
              image_status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', page.id)

          results.push({
            pageId: page.id,
            pageNumber: page.page_number,
            imageUrl,
            status: 'completed'
          })
        } else {
          throw new Error('No image URL returned from OpenAI')
        }

      } catch (pageError) {
        console.error(`Error generating image for page ${page.page_number}:`, pageError)
        
        // Update status to failed
        await supabaseAdmin
          .from('storybook_pages')
          .update({ 
            image_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id)

        results.push({
          pageId: page.id,
          pageNumber: page.page_number,
          status: 'failed',
          error: pageError instanceof Error ? pageError.message : 'Unknown error'
        })
      }
    }

    // Update storybook status
    const allCompleted = results.every(r => r.status === 'completed')
    const anyFailed = results.some(r => r.status === 'failed')
    
    const newStatus = allCompleted ? 'completed' : anyFailed ? 'failed' : 'generating'
    
    await supabaseAdmin
      .from('storybooks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', storybookId)

    return NextResponse.json({
      success: true,
      message: `Generated images for ${results.filter(r => r.status === 'completed').length} out of ${results.length} pages`,
      results,
      storybookStatus: newStatus
    })

  } catch (error) {
    console.error('Error generating page images:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate page images' },
      { status: 500 }
    )
  }
}