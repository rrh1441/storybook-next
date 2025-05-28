import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

interface TextData {
  title: string
  pages: string[]
}

// Print dimensions with bleed
const BLEED_SIZE = 2475 + (0.125 * 300 * 2)
const SAFE_MARGIN = 0.125 * 300 // 0.125" margin from bleed edge
const TEXT_AREA_WIDTH = BLEED_SIZE - (SAFE_MARGIN * 2)
const TEXT_AREA_HEIGHT = 200 // Height for text area at bottom

function createTextSVG(text: string, width: number, height: number): string {
  // Clean the text - remove "Page X:" prefix if present
  const cleanText = text.replace(/^Page \d+:\s*/, '').trim()
  
  // Calculate font size based on text length
  const baseFontSize = 48
  const fontSize = Math.max(24, Math.min(baseFontSize, (width * 0.8) / (cleanText.length * 0.6)))
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="rgba(255,255,255,0.9)" rx="10"/>
      <foreignObject x="20" y="20" width="${width - 40}" height="${height - 40}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          font-family: 'Georgia', serif;
          font-size: ${fontSize}px;
          line-height: 1.4;
          color: #2d3748;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 10px;
          box-sizing: border-box;
          filter: url(#shadow);
        ">
          ${cleanText}
        </div>
      </foreignObject>
    </svg>
  `
}

async function overlayTextOnImage(
  imagePath: string,
  text: string,
  outputPath: string
): Promise<void> {
  console.log(`📝 Adding text to ${path.basename(imagePath)}...`)

  try {
    // Create text SVG
    const textSVG = createTextSVG(text, TEXT_AREA_WIDTH, TEXT_AREA_HEIGHT)
    const textBuffer = Buffer.from(textSVG)

    // Overlay text on image
    await sharp(imagePath)
      .composite([
        {
          input: textBuffer,
          top: BLEED_SIZE - TEXT_AREA_HEIGHT - SAFE_MARGIN,
          left: SAFE_MARGIN,
        }
      ])
      .png({ quality: 100 })
      .toFile(outputPath)

    console.log(`✅ Text added to ${path.basename(imagePath)}`)
  } catch (error) {
    console.error(`❌ Error adding text to ${path.basename(imagePath)}:`, error)
    throw error
  }
}

async function overlayText(): Promise<void> {
  console.log('📖 Starting text overlay...')

  // Create output directory
  await fs.mkdir('build/final', { recursive: true })

  // Load text content
  const textData: TextData = JSON.parse(
    await fs.readFile('pages/text.json', 'utf-8')
  )

  // Process cover (no text overlay needed)
  console.log('📖 Processing cover...')
  await sharp('build/upscaled/cover.png')
    .png({ quality: 100 })
    .toFile('build/final/cover.png')
  console.log('✅ Cover processed')

  // Process pages with text overlay
  console.log('📄 Processing pages with text...')
  for (let i = 0; i < textData.pages.length; i++) {
    const pageNumber = i + 1
    const inputPath = `build/upscaled/page-${pageNumber.toString().padStart(2, '0')}.png`
    const outputPath = `build/final/page-${pageNumber.toString().padStart(2, '0')}.png`
    
    await overlayTextOnImage(inputPath, textData.pages[i], outputPath)
  }

  console.log('🎉 All text overlays completed successfully!')
}

if (require.main === module) {
  overlayText().catch(console.error)
}

export { overlayText } 