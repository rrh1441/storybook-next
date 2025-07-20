# Storybook Web Application - Setup & Testing Guide

## Fixed Issues

1. ✅ **Missing /create-storybook page** - Now redirects to main /create flow
2. ✅ **Database schema unified** - Orders table now supports authenticated users
3. ✅ **Client-side image analysis replaced** - Now uses server-side OpenAI Vision API
4. ✅ **Test assertions updated** - Tests now match actual UI text
5. ✅ **Error handling added** - Global error boundary, toast notifications, and API error handling
6. ✅ **Authenticated flow connected** - Users can now see their orders in dashboard

## Database Setup

Run the migration script in your Supabase SQL editor:

```sql
-- Run the migration from database-migration.sql
```

## Environment Variables

Ensure all required environment variables are set in `.env.local`:

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

## Running Tests

### Unit Tests (To be implemented)
```bash
# Install Jest and React Testing Library
pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Run unit tests
pnpm test:unit
```

### E2E Tests with Playwright
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/landing.spec.ts

# Run tests in UI mode
pnpm playwright test --ui

# Run tests with specific browser
pnpm playwright test --project=chromium
```

### Test Coverage

Current test files:
- `tests/landing.spec.ts` - Landing page navigation tests
- `tests/create-flow.spec.ts` - Create flow, authentication, and preview tests

## API Endpoints

All API endpoints now have proper error handling:

- `POST /api/analyze-photo` - Analyzes uploaded photos using OpenAI Vision
- `POST /api/generate-preview` - Creates order and generates preview
- `POST /api/checkout` - Creates Stripe checkout session
- `GET /api/orders/[id]` - Retrieves order details
- `POST /api/stripe-webhook` - Handles Stripe webhooks
- `POST /api/generate-full-book` - Generates complete storybook

## Security Improvements

1. **Row Level Security** - Orders table has RLS policies
2. **Input Validation** - All API routes validate required fields
3. **Error Handling** - Centralized error handling with proper status codes
4. **Authentication** - Orders automatically linked to authenticated users

## User Flows

### Guest Flow
1. Land on homepage → Click "Start Creating Stories"
2. Go to signup page (optional - can continue as guest)
3. Create character (upload photo or manual description)
4. Select theme and story details
5. Generate preview
6. Make payment via Stripe
7. Receive storybook via email

### Authenticated Flow
1. Sign up / Log in
2. Access dashboard to see previous orders
3. Click "Create New Storybook" → redirects to /create
4. Same flow as guest but order is linked to account
5. Can view all orders in dashboard

## Known Limitations

1. **Photo Analysis** - Falls back to manual input if OpenAI Vision fails
2. **Stripe Webhook** - Requires proper webhook configuration in Stripe dashboard
3. **Email Delivery** - Requires valid Resend API key and verified domain

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm tsc --noEmit
```

## Troubleshooting

### "Order not found" error
- Check if order exists in database
- Verify order ID in URL is correct
- Ensure RLS policies allow access

### Photo upload fails
- Check file size (should be under 5MB)
- Verify OpenAI API key is valid
- Check browser console for errors

### Payment fails
- Verify Stripe keys are correct
- Check Stripe webhook is configured
- Ensure price ID matches your Stripe product

### Dashboard shows no orders
- Run database migration to link orders with users
- Check if user is properly authenticated
- Verify orders have user_id field populated