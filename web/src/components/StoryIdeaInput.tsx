'use client'

import { useState } from 'react'

interface StoryIdeaInputProps {
  onStoryIdeaSubmitted: (storyIdea: string) => void
}

const STORY_SUGGESTIONS = [
  'A magical adventure in an enchanted forest',
  'Becoming a superhero who saves the day',
  'Discovering a secret world under the bed',
  'Going on a treasure hunt with friendly pirates',
  'Meeting talking animals in a magical kingdom',
  'Traveling to space and making alien friends',
  'Solving mysteries as a young detective',
  'Learning magic at a wizard school'
]

export default function StoryIdeaInput({ onStoryIdeaSubmitted }: StoryIdeaInputProps) {
  const [storyIdea, setStoryIdea] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (storyIdea.trim()) {
      onStoryIdeaSubmitted(storyIdea.trim())
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setStoryIdea(suggestion)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">What's Your Story Idea?</h2>
      <p className="text-gray-600 mb-6">
        Tell us what kind of adventure you'd like your child to go on.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            placeholder="Describe the adventure you'd like your child to experience..."
            className="textarea h-32"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!storyIdea.trim()}
          className="btn-primary w-full"
        >
          Create Preview
        </button>
      </form>

      <div className="mt-8">
        <h3 className="font-semibold mb-4 text-gray-700">Need inspiration? Try these ideas:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STORY_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 