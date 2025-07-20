import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { handleApiError, AppError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      throw new AppError('Order ID is required', 400)
    }

    // Get order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      throw new AppError('Order not found', 404)
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
    return handleApiError(error)
  }
} 