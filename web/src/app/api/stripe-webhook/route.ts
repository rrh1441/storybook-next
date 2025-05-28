import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (orderId) {
      try {
        // Update order status to paid
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        // Trigger full book generation
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-full-book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        })
      } catch (error) {
        console.error('Error processing payment:', error)
      }
    }
  }

  return NextResponse.json({ received: true })
} 