import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Storybook - Your Ideas, Their Adventures',
  description: 'Create personalized children\'s books with AI-generated illustrations featuring your child as the hero.',
  keywords: 'personalized children\'s books, AI-generated stories, custom storybooks, children\'s literature',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
} 