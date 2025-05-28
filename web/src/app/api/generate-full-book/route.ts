import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCompletionEmail } from '@/lib/resend'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    // Get order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update status to generating
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'generating_full',
        progress: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // Create temporary directory for this order
    const tempDir = path.join(process.cwd(), 'temp', orderId)
    await mkdir(tempDir, { recursive: true })

    // Generate full story content using the pipeline
    const pipelineDir = path.join(process.cwd(), '..', 'storybook-pipeline')
    const pagesDir = path.join(pipelineDir, 'pages')
    
    // Create prompts.json and text.json for the pipeline
    const prompts = {
      cover: `Create a book cover illustration in ${order.theme.style}. Child descriptor: ${JSON.stringify(order.child_descriptor)}. Story: ${order.story_idea}. Title: "The Adventures of [Child's Name]"`,
      pages: Array.from({ length: 24 }, (_, i) => 
        `Create an illustration for page ${i + 1} in ${order.theme.style}. This should show the scene for this part of the story about ${order.story_idea}.`
      )
    }

    const textContent = {
      title: `The Adventures of ${order.child_descriptor.age.includes('boy') ? 'Hero' : 'Hero'}`,
      pages: Array.from({ length: 24 }, (_, i) => 
        `Page ${i + 1}: [Generated story text for page ${i + 1} will be created by the pipeline]`
      )
    }

    await writeFile(path.join(pagesDir, 'prompts.json'), JSON.stringify(prompts, null, 2))
    await writeFile(path.join(pagesDir, 'text.json'), JSON.stringify(textContent, null, 2))

    // Run the pipeline
    const { stdout, stderr } = await execAsync('npm run all', {
      cwd: pipelineDir,
      env: {
        ...process.env,
        ORDER_ID: orderId,
      }
    })

    console.log('Pipeline output:', stdout)
    if (stderr) console.error('Pipeline errors:', stderr)

    // Upload the generated PDF to Supabase Storage
    const pdfPath = path.join(pipelineDir, 'build', 'book-interior.pdf')
    const pdfBuffer = await require('fs').promises.readFile(pdfPath)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('storybooks')
      .upload(`${orderId}/book.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
      })

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('storybooks')
      .getPublicUrl(`${orderId}/book.pdf`)

    const pdfUrl = urlData.publicUrl

    // Update order with completion
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        progress: 100,
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // Send completion email
    const childName = order.child_descriptor.age.includes('boy') ? 'Your Child' : 'Your Child'
    await sendCompletionEmail(
      order.email,
      childName,
      pdfUrl,
      order.hero_image_url
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating full book:', error)
    
    // Update order with error status
    const { orderId } = await request.json()
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json(
      { error: 'Failed to generate full book' },
      { status: 500 }
    )
  }
} 