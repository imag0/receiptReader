import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await db.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's receipts
    const receipts = await db.getUserReceipts(user.id)

    return NextResponse.json(receipts)

  } catch (error) {
    console.error('Get receipts error:', error)
    return NextResponse.json(
      { error: 'Failed to get receipts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receiptData = await request.json()

    // Get user from database
    const user = await db.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription limits
    if (user.subscription_tier === 'free') {
      const receipts = await db.getUserReceipts(user.id)
      if (receipts.length >= 5) {
        return NextResponse.json(
          { error: 'Free plan limit reached. Upgrade to Pro for unlimited receipts.' },
          { status: 403 }
        )
      }
    }

    // Create receipt
    const newReceipt = await db.createReceipt({
      user_id: user.id,
      ...receiptData
    })

    return NextResponse.json(newReceipt, { status: 201 })

  } catch (error) {
    console.error('Create receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    )
  }
}
