import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!

export async function createCheckoutSession(orderId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/preview?order_id=${orderId}`,
    customer_email: email,
    metadata: {
      orderId,
    },
  })

  return session
} 