import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'

// Initialize Stripe with fallback for missing API key
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
}) : null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, userId } = await request.json()

    // If no Stripe key configured, return demo URL
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.log('No Stripe API key found, returning demo checkout')
      return NextResponse.json({ 
        url: 'https://billing.stripe.com/p/demo/test_YWNjdF8xT3BkVW1GOTNFdWVvZHc0LF9RVElwT2Y2SWJhSDF2Ujh2a1FSQ21Wa0Y0TVFNUDNQ01005U3DaEjh',
        message: 'Demo mode - no actual payment will be processed'
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: userId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
