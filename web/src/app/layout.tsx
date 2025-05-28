import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Storybook - Turn Your Child Into the Hero of Their Own Adventure',
  description: 'Create personalized children\'s books with AI-generated art and stories. Delivered in under 1 hour with print-ready PDFs.',
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
        {children}
      </body>
    </html>
  )
} 