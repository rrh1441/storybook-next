'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStorybook, useStorybookPages } from '@/hooks/useStorybooks'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'

export default function StorybookPreviewPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const storybookId = params.id as string
  
  const { data: storybook, isLoading: storybookLoading, error: storybookError } = useStorybook(storybookId)
  const { data: pages, isLoading: pagesLoading, error: pagesError } = useStorybookPages(storybookId)
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Completed' }
      case 'generating':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Generating' }
      case 'failed':
        return { color: 'text-red-600', bg: 'bg-red-100', text: 'Failed' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Draft' }
    }
  }

  const downloadPDF = async () => {
    if (!storybook || !pages || pages.length === 0) return
    
    setIsGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (2 * margin)
      
      // Title page
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      const title = storybook.title || 'My Storybook'
      const titleLines = pdf.splitTextToSize(title, contentWidth)
      const titleY = pageHeight / 3
      pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' })
      
      if (storybook.main_character) {
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Starring: ${storybook.main_character}`, pageWidth / 2, titleY + 20, { align: 'center' })
      }
      
      pdf.setFontSize(12)
      pdf.text(`Created on ${formatDate(storybook.created_at)}`, pageWidth / 2, titleY + 40, { align: 'center' })
      
      // Add hero image if available
      if (storybook.hero_image_url) {
        try {
          const response = await fetch(storybook.hero_image_url)
          const blob = await response.blob()
          const reader = new FileReader()
          reader.onload = function() {
            const imageData = reader.result as string
            const imgWidth = 80
            const imgHeight = 80
            const imgX = (pageWidth - imgWidth) / 2
            const imgY = titleY + 60
            pdf.addImage(imageData, 'PNG', imgX, imgY, imgWidth, imgHeight)
          }
          reader.readAsDataURL(blob)
        } catch (error) {
          console.warn('Could not load hero image for PDF:', error)
        }
      }
      
      // Story pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        pdf.addPage()
        
        // Page number
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Page ${page.page_number}`, pageWidth - margin, margin, { align: 'right' })
        
        // Add page image if available
        let imageHeight = 0
        if (page.image_url && page.image_status === 'completed') {
          try {
            const response = await fetch(page.image_url)
            const blob = await response.blob()
            const reader = new FileReader()
            reader.onload = function() {
              const imageData = reader.result as string
              const maxImgWidth = contentWidth
              const maxImgHeight = 100
              imageHeight = maxImgHeight
              pdf.addImage(imageData, 'PNG', margin, margin + 15, maxImgWidth, maxImgHeight)
            }
            reader.readAsDataURL(blob)
            imageHeight = 100
          } catch (error) {
            console.warn(`Could not load image for page ${page.page_number}:`, error)
          }
        }
        
        // Add text
        if (page.text) {
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'normal')
          const textY = margin + 25 + imageHeight + 10
          const textLines = pdf.splitTextToSize(page.text, contentWidth)
          pdf.text(textLines, margin, textY)
        }
      }
      
      // Save the PDF
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_storybook.pdf`
      pdf.save(filename)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading || storybookLoading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading storybook...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (storybookError || pagesError || !storybook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Storybook Not Found</h1>
          <p className="text-gray-600 mb-4">This storybook doesn't exist or you don't have permission to view it.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(storybook.status)
  const sortedPages = pages?.sort((a, b) => a.page_number - b.page_number) || []
  const allImagesComplete = sortedPages.every(page => page.image_status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                ← Back to My Storybooks
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {storybook.title || 'Untitled Storybook'}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <span className="text-sm text-gray-500">
                  Created {formatDate(storybook.created_at)}
                </span>
              </div>
            </div>
            
            {/* Download PDF Button */}
            <Button
              onClick={downloadPDF}
              disabled={isGeneratingPDF || storybook.status !== 'completed' || !allImagesComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Storybook Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Image */}
            <div>
              {storybook.hero_image_url ? (
                <img 
                  src={storybook.hero_image_url} 
                  alt="Hero character"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Story Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Theme:</span> {storybook.theme}
                  </div>
                  {storybook.main_character && (
                    <div>
                      <span className="font-medium">Main Character:</span> {storybook.main_character}
                    </div>
                  )}
                  {storybook.educational_focus && (
                    <div>
                      <span className="font-medium">Educational Focus:</span> {storybook.educational_focus}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Pages:</span> {sortedPages.length}
                  </div>
                </div>
              </div>
              
              {storybook.status === 'generating' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Your storybook is still being generated. Images may appear as they complete.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Pages */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-gray-900">Story Pages</h2>
          
          {sortedPages.map((page, index) => (
            <div key={page.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-6">
                {/* Page Image */}
                <div className="w-48 h-48 flex-shrink-0">
                  {page.image_url && page.image_status === 'completed' ? (
                    <img 
                      src={page.image_url} 
                      alt={`Page ${page.page_number} illustration`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : page.image_status === 'generating' ? (
                    <div className="w-full h-full bg-yellow-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                        <span className="text-sm text-yellow-700">Generating...</span>
                      </div>
                    </div>
                  ) : page.image_status === 'failed' ? (
                    <div className="w-full h-full bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-red-700">Failed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Page Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Page {page.page_number}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {page.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}