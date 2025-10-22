import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id: receiptId } = await context.params
    const updateData = await request.json()

    // Verify receipt belongs to user
    const receipts = await db.getReceipts(user.id)
    const receipt = receipts.find((r: any) => r.id === receiptId)
    
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Update receipt
    const updatedReceipt = await db.updateReceipt(receiptId, updateData)

    return NextResponse.json(updatedReceipt)

  } catch (error) {
    console.error('Update receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to update receipt' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id: receiptId } = await context.params

    // Verify receipt belongs to user
    const receipts = await db.getReceipts(user.id)
    const receipt = receipts.find((r: any) => r.id === receiptId)
    
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Delete receipt
    await db.deleteReceipt(receiptId)

    return NextResponse.json({ message: 'Receipt deleted successfully' })

  } catch (error) {
    console.error('Delete receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to delete receipt' },
      { status: 500 }
    )
  }
}
