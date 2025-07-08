import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { theme, mainCharacter, educationalFocus, additionalInstructions } = await request.json()

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      )
    }

    // Build the story generation prompt
    const characterDesc = mainCharacter ? ` The main character is named ${mainCharacter}.` : " The story features a child protagonist."
    const eduFocus = educationalFocus ? ` The story should subtly incorporate the theme of ${educationalFocus}.` : ""
    const addInstructions = additionalInstructions ? ` Additional user requests: ${additionalInstructions}` : ""

    const prompt = `Write a children's story suitable for young children aged 4-8. The story should have a theme of ${theme}.${characterDesc}${eduFocus}${addInstructions}

The story should be:
- Engaging and age-appropriate
- Positive and inspiring
- Perfect for a picture book format
- Divided into exactly 7 pages/paragraphs

Please provide:
1. A creative title for the story
2. The story divided into exactly 7 paragraphs (one per page)

Format your response as JSON with this structure:
{
  "title": "Story Title Here",
  "pages": [
    "First page text...",
    "Second page text...",
    "Third page text...",
    "Fourth page text...",
    "Fifth page text...",
    "Sixth page text...",
    "Seventh page text..."
  ]
}`

    // Generate story using OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a talented children's book author. You write engaging, age-appropriate stories for young children. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let storyData
    try {
      storyData = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', response)
      
      // Fallback: try to extract story content manually
      const fallbackTitle = `A ${theme} Adventure`
      const fallbackPages = response.split('\n\n').filter(p => p.trim().length > 0).slice(0, 7)
      
      if (fallbackPages.length < 7) {
        // Pad with additional content
        while (fallbackPages.length < 7) {
          fallbackPages.push(`And the adventure continues...`)
        }
      }
      
      storyData = {
        title: fallbackTitle,
        pages: fallbackPages
      }
    }

    // Validate the response structure
    if (!storyData.title || !Array.isArray(storyData.pages) || storyData.pages.length !== 7) {
      throw new Error('Invalid story format received from AI')
    }

    return NextResponse.json({
      title: storyData.title,
      pageTexts: storyData.pages,
      success: true
    })

  } catch (error) {
    console.error('Error generating story text:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate story text' },
      { status: 500 }
    )
  }
}