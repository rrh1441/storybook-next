import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs/promises'

// Print dimensions: 8.25" × 8.25" with 0.125" bleed = 8.5" × 8.5"
const PAGE_WIDTH = 8.5 * 72 // Convert inches to points
const PAGE_HEIGHT = 8.5 * 72

async function createPDF(): Promise<void> {
  console.log('📚 Creating PDF...')

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()

  // Load text data for title
  const textData = JSON.parse(
    await fs.readFile('pages/text.json', 'utf-8')
  )

  // Set document metadata
  pdfDoc.setTitle(textData.title)
  pdfDoc.setAuthor('Storybook')
  pdfDoc.setSubject('Personalized Children\'s Storybook')
  pdfDoc.setCreator('Storybook Pipeline')

  // Add cover page
  console.log('📖 Adding cover page...')
  const coverImageBytes = await fs.readFile('build/final/cover.png')
  const coverImage = await pdfDoc.embedPng(coverImageBytes)
  
  const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  
  coverPage.drawImage(coverImage, {
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  })

  // Add story pages
  console.log('📄 Adding story pages...')
  for (let i = 1; i <= 24; i++) {
    const pageNumber = i.toString().padStart(2, '0')
    const imagePath = `build/final/page-${pageNumber}.png`
    
    try {
      const imageBytes = await fs.readFile(imagePath)
      const image = await pdfDoc.embedPng(imageBytes)
      
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      })
      
      console.log(`✅ Added page ${i}`)
    } catch (error) {
      console.error(`❌ Error adding page ${i}:`, error)
      
      // Add a blank page with error message
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      page.drawText(`Page ${i} - Image not found`, {
        x: 50,
        y: PAGE_HEIGHT - 100,
        size: 24,
        color: rgb(1, 0, 0),
      })
    }
  }

  // Save the PDF
  console.log('💾 Saving PDF...')
  const pdfBytes = await pdfDoc.save()
  await fs.writeFile('build/book-interior.pdf', pdfBytes)

  // Calculate file size
  const stats = await fs.stat('build/book-interior.pdf')
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)

  console.log(`🎉 PDF created successfully!`)
  console.log(`📁 File: build/book-interior.pdf`)
  console.log(`📏 Size: ${fileSizeMB} MB`)
  console.log(`📖 Pages: ${pdfDoc.getPageCount()}`)
}

if (require.main === module) {
  createPDF().catch(console.error)
}

export { createPDF } 