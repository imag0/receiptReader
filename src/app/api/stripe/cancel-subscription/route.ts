import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    // Get user from database
    const user = await db.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user to free tier (in a real app, you'd also cancel in Stripe)
    await db.updateUser(user.id, { 
      subscription_tier: 'free',
      receipts_this_month: 0 
    })

    return NextResponse.json({ message: 'Subscription cancelled successfully' })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
