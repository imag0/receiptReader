import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: receiptId } = await context.params
    const updateData = await request.json()

    // Get user from database
    const user = await db.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify receipt belongs to user
    const receipts = await db.getUserReceipts(user.id)
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
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: receiptId } = await context.params

    // Get user from database
    const user = await db.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify receipt belongs to user (if using real database)
    const receipts = await db.getUserReceipts(user.id)
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
