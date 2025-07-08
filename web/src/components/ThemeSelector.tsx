'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Theme {
  id: string
  name: string
  description: string
  icon: string
  examples: string[]
  color: string
}

const predefinedThemes: Theme[] = [
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Exciting journeys, exploration, and brave quests',
    icon: '🗺️',
    examples: ['treasure hunts', 'jungle expeditions', 'mountain climbing'],
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'friendship',
    name: 'Friendship',
    description: 'Making friends, helping others, and working together',
    icon: '🤝',
    examples: ['helping a new friend', 'solving problems together', 'sharing and caring'],
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'magic',
    name: 'Magic & Fantasy',
    description: 'Magical worlds, talking animals, and enchanted adventures',
    icon: '✨',
    examples: ['fairy tale kingdoms', 'magical creatures', 'enchanted forests'],
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 'learning',
    name: 'Learning & Discovery',
    description: 'Educational adventures about science, nature, and knowledge',
    icon: '🔬',
    examples: ['space exploration', 'ocean adventures', 'animal discovery'],
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  },
  {
    id: 'family',
    name: 'Family & Home',
    description: 'Stories about family love, traditions, and home adventures',
    icon: '🏠',
    examples: ['family traditions', 'helping at home', 'celebrating together'],
    color: 'bg-pink-100 border-pink-300 text-pink-800'
  },
  {
    id: 'courage',
    name: 'Courage & Bravery',
    description: 'Overcoming fears, being brave, and standing up for others',
    icon: '🦁',
    examples: ['facing fears', 'helping others', 'being a hero'],
    color: 'bg-red-100 border-red-300 text-red-800'
  }
]

interface ThemeSelectorProps {
  selectedTheme: string
  onThemeChange: (theme: string) => void
  customTheme: string
  onCustomThemeChange: (theme: string) => void
  mainCharacter?: string
  onMainCharacterChange: (character: string) => void
  educationalFocus?: string
  onEducationalFocusChange: (focus: string) => void
  additionalInstructions?: string
  onAdditionalInstructionsChange: (instructions: string) => void
}

export default function ThemeSelector({
  selectedTheme,
  onThemeChange,
  customTheme,
  onCustomThemeChange,
  mainCharacter = '',
  onMainCharacterChange,
  educationalFocus = '',
  onEducationalFocusChange,
  additionalInstructions = '',
  onAdditionalInstructionsChange
}: ThemeSelectorProps) {
  const [showCustomTheme, setShowCustomTheme] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    if (themeId === 'custom') {
      setShowCustomTheme(true)
      onThemeChange(customTheme || '')
    } else {
      setShowCustomTheme(false)
      onThemeChange(themeId)
    }
  }

  const isSelected = (themeId: string) => {
    if (themeId === 'custom') {
      return showCustomTheme
    }
    return selectedTheme === themeId && !showCustomTheme
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Story Theme</h3>
        <p className="text-gray-600 text-sm">
          Select a theme that will guide the adventure and tone of your child's personalized storybook.
        </p>
      </div>

      {/* Predefined Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predefinedThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              isSelected(theme.id) 
                ? `${theme.color} border-current shadow-md` 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{theme.icon}</span>
              <h4 className="font-semibold">{theme.name}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
            <div className="text-xs text-gray-500">
              Examples: {theme.examples.join(', ')}
            </div>
          </button>
        ))}

        {/* Custom Theme Option */}
        <button
          onClick={() => handleThemeSelect('custom')}
          className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
            isSelected('custom')
              ? 'bg-gray-100 border-gray-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">🎨</span>
            <h4 className="font-semibold">Custom Theme</h4>
          </div>
          <p className="text-sm text-gray-600">
            Create your own unique theme for a completely personalized story
          </p>
        </button>
      </div>

      {/* Custom Theme Input */}
      {showCustomTheme && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <Label htmlFor="custom-theme">Custom Theme</Label>
          <Input
            id="custom-theme"
            value={customTheme}
            onChange={(e) => {
              onCustomThemeChange(e.target.value)
              onThemeChange(e.target.value)
            }}
            placeholder="e.g., underwater exploration, space adventure, dinosaur discovery"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Describe the type of adventure or story theme you'd like
          </p>
        </div>
      )}

      {/* Story Customization Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold">Story Customization</h4>
        
        <div>
          <Label htmlFor="main-character">Main Character Name</Label>
          <Input
            id="main-character"
            value={mainCharacter}
            onChange={(e) => onMainCharacterChange(e.target.value)}
            placeholder="Enter your child's name"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            This will be the hero of the story
          </p>
        </div>

        <div>
          <Label htmlFor="educational-focus">Educational Focus (Optional)</Label>
          <Input
            id="educational-focus"
            value={educationalFocus}
            onChange={(e) => onEducationalFocusChange(e.target.value)}
            placeholder="e.g., counting, colors, kindness, sharing"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add a learning element to weave into the story
          </p>
        </div>

        <div>
          <Label htmlFor="additional-instructions">Additional Story Details (Optional)</Label>
          <Textarea
            id="additional-instructions"
            value={additionalInstructions}
            onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
            placeholder="Any specific details, preferences, or requests for the story..."
            rows={3}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum 500 characters. Be specific about what you'd like to include!
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {selectedTheme && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Story Preview</h4>
          <p className="text-sm text-blue-800">
            <strong>Theme:</strong> {showCustomTheme ? customTheme || 'Custom theme' : predefinedThemes.find(t => t.id === selectedTheme)?.name}
            {mainCharacter && (
              <>
                <br />
                <strong>Hero:</strong> {mainCharacter}
              </>
            )}
            {educationalFocus && (
              <>
                <br />
                <strong>Learning Focus:</strong> {educationalFocus}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}