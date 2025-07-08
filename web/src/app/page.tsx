'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-orange-600">Storybook</h1>
            <span className="text-sm text-gray-500">Your Ideas, Their Adventures</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <Link href="/dashboard" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">
                My Dashboard
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Turn Your Child Into the{' '}
            <span className="text-orange-600">Hero</span> of Their Own{' '}
            <span className="text-blue-600">Adventure</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create magical, AI-generated personalized storybooks where your child becomes the
            main character in beautifully illustrated adventures.
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-2">Your Child as Hero</h3>
              <p className="text-gray-600">
                Upload a photo or description and we'll create a personalized character illustration
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Stories</h3>
              <p className="text-gray-600">
                Choose themes and let AI create unique, engaging stories with beautiful illustrations
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">Print-Ready PDF</h3>
              <p className="text-gray-600">
                Download high-quality PDFs perfect for printing and sharing with family
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600">1</span>
                </div>
                <h4 className="font-semibold mb-2">Create Character</h4>
                <p className="text-sm text-gray-600">Upload a photo or describe your child</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600">2</span>
                </div>
                <h4 className="font-semibold mb-2">Choose Theme</h4>
                <p className="text-sm text-gray-600">Select from adventure, friendship, magic, and more</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold mb-2">Review & Approve</h4>
                <p className="text-sm text-gray-600">Edit the story and approve your hero character</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold mb-2">Download PDF</h4>
                <p className="text-sm text-gray-600">Get your personalized storybook as a beautiful PDF</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            {user ? (
              <Link href="/dashboard" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-4 rounded-lg font-semibold inline-block">
                Go to My Storybooks
              </Link>
            ) : (
              <>
                <Link href="/signup" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-4 rounded-lg font-semibold inline-block">
                  Start Creating Stories
                </Link>
                <p className="text-gray-500">
                  Free to use • Create unlimited personalized storybooks
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>&copy; 2024 Storybook. Making magical memories, one story at a time.</p>
      </footer>
    </div>
  )
} 