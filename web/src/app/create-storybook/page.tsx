'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateStorybookPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main create flow
    router.push('/create')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}