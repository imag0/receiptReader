import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's receipts
    const receipts = await db.getReceipts(user.id)

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
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receiptData = await request.json()

    // Get user profile from database
    const userProfile = await db.getUser(user.id)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check subscription limits
    if (userProfile.subscription_tier === 'free') {
      const receipts = await db.getReceipts(user.id)
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
