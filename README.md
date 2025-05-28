# Storybook - Personalized Children's Books

Turn your child into the hero of their own adventure with AI-generated personalized storybooks.

## 🌟 Features

- **AI-Generated Art**: Beautiful, custom illustrations featuring your child as the hero
- **Delivered in <1h**: Fast turnaround from order to personalized storybook
- **Print-Ready PDF**: Professional quality, ready to print and bind (8.25" × 8.25")
- **Multiple Art Styles**: Pixar-inspired, Classic Watercolor, or Ghibli-style illustrations
- **Photo Analysis**: Upload a photo and AI analyzes it to create character descriptions
- **Secure Payments**: Stripe integration with webhook handling
- **Email Delivery**: Automated email with download links and printing instructions

## 🏗️ Architecture

This project consists of two main components:

### 1. Web Application (`web/`)
- **Next.js 14** with App Router and TypeScript
- **Supabase** for database and file storage
- **Stripe** for payment processing
- **OpenAI** for image and text generation
- **Resend** for email delivery
- **Tailwind CSS** for styling

### 2. Print Pipeline (`storybook-pipeline/`)
- **Standalone package** for generating print-ready PDFs
- **OpenAI DALL-E 3** for base image generation
- **Real-ESRGAN** via Replicate for 4x upscaling
- **Sharp** for image processing and text overlay
- **pdf-lib** for PDF assembly

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account
- Stripe account
- OpenAI API key
- Replicate account
- Resend account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd storybook-next
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp web/env.example web/.env.local
   # Fill in your API keys and configuration
   ```

4. **Set up Supabase database**
   Create the following table in your Supabase project:
   ```sql
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT NOT NULL,
     child_descriptor JSONB NOT NULL,
     theme JSONB NOT NULL,
     story_idea TEXT NOT NULL,
     hero_image_url TEXT,
     preview_pages JSONB DEFAULT '[]',
     full_story JSONB,
     status TEXT DEFAULT 'pending',
     progress INTEGER DEFAULT 0,
     pdf_url TEXT,
     stripe_session_id TEXT,
     stripe_payment_intent_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public) VALUES ('storybooks', 'storybooks', true);
   ```

5. **Set up Stripe**
   - Create a product and price in your Stripe dashboard
   - Set up a webhook endpoint pointing to `/api/stripe-webhook`
   - Add the price ID to your environment variables

6. **Run the development server**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
storybook-next/
├── web/                          # Next.js web application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── create/           # Onboarding flow
│   │   │   ├── preview/          # Preview and payment
│   │   │   ├── thank-you/        # Post-payment confirmation
│   │   │   └── api/              # API routes
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utility libraries
│   │   └── types/                # TypeScript definitions
│   ├── package.json
│   └── next.config.js
├── storybook-pipeline/           # Standalone PDF generation
│   ├── scripts/                  # Pipeline scripts
│   │   ├── generate-base-images.ts
│   │   ├── upscale-crop.ts
│   │   ├── overlay-text.ts
│   │   └── make-pdf.ts
│   ├── pages/                    # Input files
│   │   ├── prompts.json          # Image generation prompts
│   │   └── text.json             # Story text content
│   ├── build/                    # Output directory
│   └── package.json
└── package.json                  # Root workspace configuration
```

## 🔄 User Flow

1. **Landing Page**: User sees benefits and clicks "Create Your Book"
2. **Photo Upload**: User uploads child's photo, AI analyzes for character description
3. **Theme Selection**: User chooses art style (Pixar, Watercolor, or Ghibli)
4. **Email Input**: User provides email for delivery
5. **Story Idea**: User enters or selects story concept
6. **Preview Generation**: AI generates hero image and 3-page teaser (60s)
7. **Preview Display**: User sees hero image and story preview
8. **Payment**: User pays $29 via Stripe checkout
9. **Full Generation**: Pipeline creates 24-page illustrated PDF (15-25 min)
10. **Email Delivery**: User receives download link and printing instructions

## 🛠️ Development

### Web Application
```bash
cd web
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test         # Run Playwright tests
```

### Pipeline
```bash
cd storybook-pipeline
npm run all       # Run full pipeline
npm run generate  # Generate base images only
npm run upscale   # Upscale images only
npm run overlay   # Add text overlays only
npm run pdf       # Create PDF only
```

### Workspace Commands
```bash
pnpm dev          # Start web dev server
pnpm build        # Build both web and pipeline
pnpm lint         # Lint both packages
pnpm test         # Test both packages
```

## 🔧 Configuration

### Environment Variables

#### Web Application (`web/.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=your_stripe_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Pipeline (`storybook-pipeline/.env`)
```bash
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

## 🚀 Deployment

### Vercel (Recommended for Web App)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Pipeline Deployment
The pipeline runs on the same server as the web application. For production:
1. Ensure all dependencies are installed
2. Set up environment variables
3. Configure sufficient memory and timeout limits
4. Consider using a job queue for better reliability

## 📊 Performance

- **Preview Generation**: ~60 seconds (hero image + 3-page story)
- **Full Book Generation**: ~15-25 minutes (25 high-quality images + PDF)
- **PDF File Size**: 50-150 MB (optimized for print quality)
- **Concurrent Orders**: Limited by OpenAI rate limits (~50 requests/minute)

## 🔒 Security

- Environment variables for all API keys
- Stripe webhook signature verification
- Supabase Row Level Security (RLS) policies
- Input validation and sanitization
- Rate limiting on API endpoints

## 🧪 Testing

### Web Application
```bash
cd web
pnpm test         # Run Playwright E2E tests
```

### Pipeline
```bash
cd storybook-pipeline
npm test          # Run unit tests (placeholder)
```

## 📝 API Documentation

### Key Endpoints

- `POST /api/generate-preview` - Generate hero image and story teaser
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/stripe-webhook` - Handle payment completion
- `POST /api/generate-full-book` - Trigger full book generation
- `GET /api/orders/[id]` - Fetch order details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the troubleshooting sections in component READMEs
- Review GitHub issues
- Contact support at support@storybook.com

---

**Making magical memories, one story at a time.** ✨
