import Replicate from 'replicate'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// Print dimensions: 8.25" × 8.25" at 300 DPI = 2475 × 2475 pixels
const BLEED_SIZE = 2475 + (0.125 * 300 * 2) // Add 0.125" bleed on each side

async function upscaleImage(inputPath: string, outputPath: string): Promise<void> {
  console.log(`🔍 Upscaling ${path.basename(inputPath)}...`)

  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972f6f220a796ff00776739",
      {
        input: {
          image: await fs.readFile(inputPath),
          scale: 4,
          face_enhance: false,
        }
      }
    ) as string

    // Download the upscaled image
    const response = await fetch(output)
    const buffer = await response.arrayBuffer()
    
    // Process with Sharp to crop to exact dimensions
    await sharp(Buffer.from(buffer))
      .resize(BLEED_SIZE, BLEED_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(outputPath)

    console.log(`✅ ${path.basename(inputPath)} upscaled and cropped`)
  } catch (error) {
    console.error(`❌ Error upscaling ${path.basename(inputPath)}:`, error)
    
    // Fallback: use Sharp to resize without upscaling
    console.log(`📐 Using fallback resize for ${path.basename(inputPath)}...`)
    await sharp(inputPath)
      .resize(BLEED_SIZE, BLEED_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(outputPath)
    
    console.log(`✅ ${path.basename(inputPath)} resized (fallback)`)
  }
}

async function upscaleAndCrop(): Promise<void> {
  console.log('🚀 Starting upscaling and cropping...')

  // Create output directory
  await fs.mkdir('build/upscaled', { recursive: true })

  // Get list of images
  const imageFiles = await fs.readdir('build/images')
  const pngFiles = imageFiles.filter(file => file.endsWith('.png'))

  console.log(`Found ${pngFiles.length} images to process`)

  // Process each image
  for (const file of pngFiles) {
    const inputPath = path.join('build/images', file)
    const outputPath = path.join('build/upscaled', file)
    
    await upscaleImage(inputPath, outputPath)
    
    // Rate limiting - wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('🎉 All images upscaled and cropped successfully!')
}

if (require.main === module) {
  upscaleAndCrop().catch(console.error)
}

export { upscaleAndCrop } 