# Storybook Pipeline

A standalone package for generating print-ready personalized children's storybook PDFs.

## Overview

This pipeline takes story prompts and text content as input and produces a professional-quality PDF ready for printing at 8.25" × 8.25" with proper bleed margins.

## Features

- 🎨 **AI Image Generation**: Uses OpenAI DALL-E 3 for high-quality illustrations
- 🔍 **Image Upscaling**: Real-ESRGAN 4x upscaling via Replicate for crisp print quality
- 📝 **Text Overlay**: Professional text rendering with SVG and Sharp
- 📚 **PDF Assembly**: Print-ready PDF with proper dimensions and bleed
- ⚡ **Automated Pipeline**: Single command execution with `npm run all`

## Requirements

- Node.js 18+
- OpenAI API key
- Replicate API token

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with:

```bash
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

## Input Files

### `pages/prompts.json`
Contains image generation prompts:
```json
{
  "cover": "Create a book cover illustration...",
  "pages": [
    "Create an illustration for page 1...",
    "Create an illustration for page 2...",
    ...
  ]
}
```

### `pages/text.json`
Contains story text content:
```json
{
  "title": "The Adventures of Hero",
  "pages": [
    "Page 1: Once upon a time...",
    "Page 2: The next day...",
    ...
  ]
}
```

## Usage

### Full Pipeline
```bash
npm run all
```

### Individual Steps
```bash
npm run generate  # Generate base images with DALL-E
npm run upscale   # Upscale images with Real-ESRGAN
npm run overlay   # Add text overlays
npm run pdf       # Create final PDF
```

## Output

The pipeline produces:
- `build/book-interior.pdf` - Final print-ready PDF
- `build/images/` - Original 1024x1024 generated images
- `build/upscaled/` - Upscaled and cropped images
- `build/final/` - Images with text overlays

## Print Specifications

- **Dimensions**: 8.25" × 8.25" (210mm × 210mm)
- **Bleed**: 0.125" (3.175mm) on all sides
- **Resolution**: 300 DPI
- **Final PDF size**: 8.5" × 8.5" including bleed
- **Color space**: RGB (convert to CMYK for professional printing)

## Performance

- **Generation time**: ~15-25 minutes for 25 images
- **File size**: Typically 50-150 MB depending on image complexity
- **Rate limiting**: Built-in delays to respect API limits

## Error Handling

- Automatic fallback to standard resizing if upscaling fails
- Graceful handling of missing images with placeholder pages
- Comprehensive logging for debugging

## Integration

This package is designed to be called from the main web application:

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Run the pipeline
await execAsync('npm run all', {
  cwd: 'path/to/storybook-pipeline',
  env: { ...process.env, ORDER_ID: orderId }
})
```

## Development

```bash
npm run lint    # Check code quality
npm run test    # Run tests (placeholder)
npm run build   # Same as npm run all
```

## Troubleshooting

### Common Issues

1. **Out of memory errors**: Reduce batch size or increase Node.js memory limit
2. **API rate limits**: Increase delays between requests
3. **Large file sizes**: Adjust image quality settings in Sharp operations
4. **Missing fonts**: Ensure system fonts are available for text rendering

### Debug Mode

Set `DEBUG=1` environment variable for verbose logging:

```bash
DEBUG=1 npm run all
```

## License

MIT License - see LICENSE file for details. 