import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">Storybook</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Turn Your Child Into the{' '}
            <span className="text-primary-500">Hero</span> of Their Own{' '}
            <span className="text-secondary-500">Adventure</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create magical, personalized storybooks where your child becomes the
            main character in their very own adventure.
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Art</h3>
              <p className="text-gray-600">
                Beautiful, custom illustrations featuring your child as the hero
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Delivered in &lt;1h</h3>
              <p className="text-gray-600">
                Fast turnaround from order to your personalized storybook
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">Print-Ready PDF</h3>
              <p className="text-gray-600">
                Professional quality, ready to print and bind at home or
                professionally
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link href="/create" className="btn-primary text-xl px-12 py-4 inline-block">
              Create Your Book
            </Link>
            <p className="text-gray-500">
              Preview for free • Full book for $29
            </p>
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