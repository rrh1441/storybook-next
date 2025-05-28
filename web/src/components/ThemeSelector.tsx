'use client'

import { useState } from 'react'
import { THEMES } from '@/lib/openai'
import { StoryTheme } from '@/types'

interface ThemeSelectorProps {
  onThemeSelected: (theme: StoryTheme) => void
}

export default function ThemeSelector({ onThemeSelected }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    onThemeSelected(THEMES[themeId as keyof typeof THEMES])
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Choose Your Art Style</h2>
      <p className="text-gray-600 mb-6">
        Select the artistic style for your child's storybook illustrations.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(THEMES).map(([id, theme]) => (
          <div
            key={id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedTheme === id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleThemeSelect(id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                {id === 'pixar' && '🎬'}
                {id === 'watercolor' && '🎨'}
                {id === 'ghibli' && '🌸'}
              </div>
              <h3 className="font-semibold text-lg mb-2">{theme.name}</h3>
              <p className="text-sm text-gray-600">{theme.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedTheme && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ {THEMES[selectedTheme as keyof typeof THEMES].name} style selected
          </p>
        </div>
      )}
    </div>
  )
} 