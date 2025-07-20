import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ChildDescriptor } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Use OpenAI's GPT-4 Vision to analyze the image
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing children's photos to create character descriptions for storybooks. 
          Analyze the child in the photo and provide a detailed but child-appropriate description.
          Focus on physical appearance, estimated age range, and inferred personality traits.
          Be respectful and positive in your descriptions.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this photo of a child and provide a character description in JSON format with the following fields: age (e.g., "6-8 years old"), gender (use "child" if unclear), appearance (physical description), personality (inferred traits), and interests (suggested based on appearance/context).'
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let descriptor: ChildDescriptor
    try {
      descriptor = JSON.parse(content)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      descriptor = {
        age: '6-8 years old',
        gender: 'child',
        appearance: 'bright eyes and a cheerful smile',
        personality: 'curious and adventurous',
        interests: 'loves stories and imagination'
      }
    }

    // Validate and sanitize the descriptor
    descriptor = {
      age: descriptor.age || '6-8 years old',
      gender: descriptor.gender || 'child',
      appearance: descriptor.appearance || 'bright eyes and a cheerful smile',
      personality: descriptor.personality || 'curious and adventurous',
      interests: descriptor.interests || 'loves stories and imagination'
    }

    return NextResponse.json({ descriptor })
  } catch (error) {
    console.error('Error analyzing photo:', error)
    
    // Return a default descriptor on error
    const defaultDescriptor: ChildDescriptor = {
      age: '6-8 years old',
      gender: 'child',
      appearance: 'bright eyes and a cheerful smile',
      personality: 'curious and adventurous',
      interests: 'loves stories and imagination'
    }
    
    return NextResponse.json({ descriptor: defaultDescriptor })
  }
}