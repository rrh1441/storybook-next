'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  }[toast.type]

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  }[toast.type]

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }[toast.type]

  return (
    <div
      className={`${bgColor} ${textColor} border rounded-lg p-4 shadow-lg flex items-start space-x-3 animate-slide-in-right`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 ml-4 hover:opacity-70"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

let toastCount = 0
const toastListeners: Set<(toasts: Toast[]) => void> = new Set()
let toasts: Toast[] = []

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = `toast-${++toastCount}`
  const newToast: Toast = { id, message, type }
  
  toasts = [...toasts, newToast]
  toastListeners.forEach(listener => listener(toasts))
}

export function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const [localToasts, setLocalToasts] = useState<Toast[]>([])

  useEffect(() => {
    setMounted(true)
    
    const listener = (newToasts: Toast[]) => {
      setLocalToasts(newToasts)
    }
    
    toastListeners.add(listener)
    
    return () => {
      toastListeners.delete(listener)
    }
  }, [])

  const handleDismiss = (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    toastListeners.forEach(listener => listener(toasts))
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {localToasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={handleDismiss}
        />
      ))}
    </div>,
    document.body
  )
}