'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useStorybooks } from '@/hooks/useStorybooks'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { data: storybooks, isLoading: storybooksLoading, error } = useStorybooks()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
      case 'generating':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Generating</span>
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || storybooksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading your storybooks...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-orange-600">
                Storybook
              </Link>
              <span className="ml-2 text-sm text-gray-500">Your Ideas, Their Adventures</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Storybooks</h1>
          <p className="mt-2 text-gray-600">Create and manage your personalized children's storybooks</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Failed to load storybooks. Please try refreshing the page.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Storybook Card */}
          <Link
            href="/create-storybook"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-dashed border-gray-300 hover:border-orange-400"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Storybook</h3>
              <p className="text-gray-500">Start crafting your child's personalized adventure</p>
            </div>
          </Link>

          {/* Existing Storybooks */}
          {storybooks && storybooks.length > 0 ? (
            storybooks.map((storybook) => (
              <div key={storybook.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Hero Image */}
                <div className="aspect-w-16 aspect-h-9">
                  {storybook.hero_image_url ? (
                    <img 
                      src={storybook.hero_image_url} 
                      alt={storybook.title || 'Storybook hero'}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {storybook.title || 'Untitled Story'}
                    </h3>
                    {getStatusBadge(storybook.status)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Theme:</strong> {storybook.theme}
                  </p>
                  
                  {storybook.main_character && (
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Hero:</strong> {storybook.main_character}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-4">
                    Created {formatDate(storybook.created_at)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {storybook.status === 'completed' ? (
                      <Link href={`/storybook/${storybook.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          View Storybook
                        </Button>
                      </Link>
                    ) : storybook.status === 'generating' ? (
                      <Button disabled className="w-full" size="sm">
                        Generating...
                      </Button>
                    ) : storybook.status === 'failed' ? (
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1">
                          Retry
                        </Button>
                        <Link href={`/storybook/${storybook.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href="/create-storybook" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Continue
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No storybooks yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first personalized storybook to get started!
                </p>
                <Link href="/create-storybook">
                  <Button>
                    Create Your First Storybook
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}