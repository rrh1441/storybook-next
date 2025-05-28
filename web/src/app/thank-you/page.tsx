'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">Storybook</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Thank You for Your Order!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Your payment has been processed successfully. We're now creating your child's personalized storybook!
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-green-800 mb-4">What happens next?</h2>
              <div className="space-y-3 text-left text-green-700">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>We're generating 24 beautifully illustrated pages for your storybook</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Your print-ready PDF will be created with professional bleed margins</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>You'll receive an email with your download link within 1 hour</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>The email will include printing instructions for the best results</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-8">
              <p>Order ID: {sessionId}</p>
              <p>If you have any questions, please contact us at support@storybook.com</p>
            </div>

            <Link href="/" className="btn-primary">
              Create Another Storybook
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 