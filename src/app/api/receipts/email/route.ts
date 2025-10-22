import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receipts } = await request.json()

    // In a real app, you'd use a service like SendGrid, Resend, or AWS SES
    // For now, we'll create a mailto link
    const csvContent = [
      ['Vendor', 'Date', 'Amount', 'Currency', 'Category'],
      ...receipts.map((r: any) => [r.vendor, r.date, r.amount.toString(), r.currency, r.category])
    ].map((row: string[]) => row.join(',')).join('\\n')

    const subject = `Receipt Export - ${new Date().toLocaleDateString()}`
    const body = `Here are your receipts:\\n\\n${csvContent}`
    
    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    return NextResponse.json({ 
      mailtoLink,
      message: 'Email client will open with your receipt data'
    })

  } catch (error) {
    console.error('Email export error:', error)
    return NextResponse.json(
      { error: 'Failed to prepare email' },
      { status: 500 }
    )
  }
}
