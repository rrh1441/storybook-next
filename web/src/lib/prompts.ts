import { ChildDescriptor, StoryTheme } from '@/types'

export function createHeroImagePrompt(
  descriptor: ChildDescriptor,
  theme: StoryTheme
): string {
  return `Create a 1024×1024 illustration in ${theme.style}.

Child descriptor: ${JSON.stringify(descriptor)}

The illustration should be a portrait-style image showing the child as the main character. The child should be depicted as confident, adventurous, and ready for an exciting story. The background should hint at magical adventures to come.

Return only the image.`
}

export function createTeaserStoryPrompt(
  descriptor: ChildDescriptor,
  storyIdea: string
): string {
  return `Write exactly 3 numbered pages for a children's storybook. Each page should be approximately 40 words. This is a teaser that ends on a cliffhanger to entice parents to purchase the full story.

Child: ${JSON.stringify(descriptor)}
Story idea: ${storyIdea}

The story should:
- Feature the child as the main character and hero
- Be age-appropriate and engaging
- End on an exciting cliffhanger that makes readers want more
- Use simple, beautiful language suitable for children

Format as:
Page 1: [text]
Page 2: [text]  
Page 3: [text]`
}

export function createFullStoryPrompt(
  descriptor: ChildDescriptor,
  storyIdea: string
): string {
  return `Write exactly 24 numbered pages for a children's storybook. Each page should be approximately 40 words. This is the complete story with a satisfying happy ending.

Child: ${JSON.stringify(descriptor)}
Story idea: ${storyIdea}

The story should:
- Feature the child as the main character and hero
- Be age-appropriate and engaging
- Have a clear beginning, middle, and end
- Include challenges the child overcomes
- End with a happy, satisfying conclusion
- Use simple, beautiful language suitable for children
- Be inspiring and empowering

Format as:
Page 1: [text]
Page 2: [text]
...
Page 24: [text]`
}

export function createPageImagePrompt(
  pageNumber: number,
  pageText: string,
  theme: StoryTheme,
  heroImageId?: string
): string {
  return `Create an illustration for page ${pageNumber} in ${theme.style}.

${heroImageId ? `Reference image id: ${heroImageId}` : ''}

Page text: "${pageText}"

The illustration should:
- Maintain visual continuity with the hero character
- Capture the essence of this specific page
- Be engaging and magical for children
- Show the scene described in the text

Return only the image.`
} 