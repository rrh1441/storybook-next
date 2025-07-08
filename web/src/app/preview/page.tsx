'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Order } from '@/types'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [orderId, router])

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    fetchOrder()
  }, [orderId, router, fetchOrder])

  const handlePurchase = async () => {
    if (!orderId) return

    setPurchasing(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        const { sessionUrl } = await response.json()
        window.location.href = sessionUrl
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to create checkout session')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your preview...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">Storybook</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Story Preview is Ready! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Here&apos;s a sneak peek of your personalized storybook
            </p>
          </div>

          {/* Hero Image */}
          {order.heroImageUrl && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Meet Your Hero</h2>
              <div className="text-center">
                <Image
                  src={order.heroImageUrl}
                  alt="Your child as the story hero"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
            </div>
          )}

          {/* Preview Pages */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Story Preview</h2>
            <div className="space-y-6">
              {order.previewPages.map((page) => (
                <div key={page.pageNumber} className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Page {page.pageNumber}</h3>
                  <p className="text-gray-700 leading-relaxed">{page.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800 font-medium">
                🔒 This is just the beginning! The full story continues with 21 more exciting pages...
              </p>
            </div>
          </div>

          {/* Purchase CTA */}
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-4">Unlock the Full 24-Page Adventure</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>24 beautifully illustrated pages</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Print-ready PDF (8.25&quot; × 8.25&quot;)</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Delivered in under 1 hour</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-primary-600 mb-4">$29</div>
              
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="btn-primary text-xl px-12 py-4"
              >
                {purchasing ? 'Processing...' : 'Get Full Storybook'}
              </button>
              
              <p className="text-sm text-gray-500">
                Secure payment powered by Stripe • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 