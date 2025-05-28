import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    // Get order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(orderId, order.email)

    // Update order with session ID
    await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 