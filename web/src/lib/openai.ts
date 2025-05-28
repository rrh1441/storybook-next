import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const THEMES = {
  pixar: {
    id: 'pixar',
    name: 'Pixar-Inspired',
    description: 'Colorful, vibrant 3D animation style',
    style: 'Pixar-inspired 3D animation style, vibrant colors, expressive characters, warm lighting, detailed textures',
  },
  watercolor: {
    id: 'watercolor',
    name: 'Classic Storybook Watercolor',
    description: 'Soft, dreamy watercolor illustrations',
    style: 'Classic children\'s book watercolor illustration, soft brushstrokes, gentle colors, whimsical details, traditional storybook art',
  },
  ghibli: {
    id: 'ghibli',
    name: 'Ghibli-Style',
    description: 'Studio Ghibli inspired artwork',
    style: 'Studio Ghibli inspired illustration, hand-drawn animation style, natural environments, magical realism, detailed backgrounds',
  },
} as const

export type ThemeId = keyof typeof THEMES 