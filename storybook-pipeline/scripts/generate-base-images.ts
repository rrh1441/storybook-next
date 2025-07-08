import OpenAI from 'openai'
import fs from 'fs/promises'
import axios from 'axios'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface PromptsData {
  cover: string
  pages: string[]
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  })

  const writer = fs.createWriteStream(filepath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function generateImages(): Promise<void> {
  console.log('🎨 Starting image generation...')

  // Create output directories
  await fs.mkdir('build/images', { recursive: true })

  // Load prompts
  const promptsData: PromptsData = JSON.parse(
    await fs.readFile('pages/prompts.json', 'utf-8')
  )

  // Generate cover image
  console.log('📖 Generating cover image...')
  const coverResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: promptsData.cover,
    size: '1024x1024',
    quality: 'standard',
    n: 1,
  })

  await downloadImage(
    coverResponse.data[0].url!,
    'build/images/cover.png'
  )
  console.log('✅ Cover image generated')

  // Generate page images
  console.log('📄 Generating page images...')
  for (let i = 0; i < promptsData.pages.length; i++) {
    const pageNumber = i + 1
    console.log(`Generating page ${pageNumber}/24...`)

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: promptsData.pages[i],
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })

      await downloadImage(
        response.data[0].url!,
        `build/images/page-${pageNumber.toString().padStart(2, '0')}.png`
      )

      console.log(`✅ Page ${pageNumber} generated`)
    } catch (error) {
      console.error(`❌ Error generating page ${pageNumber}:`, error)
      throw error
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('🎉 All images generated successfully!')
}

if (require.main === module) {
  generateImages().catch(console.error)
}

export { generateImages } 