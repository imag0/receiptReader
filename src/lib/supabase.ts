import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client-side operations)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server client (for server-side operations with service role)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface UserProfile {
  id: string
  email: string
  subscription_tier: 'free' | 'pro'
  receipts_this_month: number
  created_at: string
}

export interface Receipt {
  id: string
  user_id: string
  image_url?: string
  vendor?: string
  date?: string
  amount?: number
  currency: string
  category?: string
  created_at: string
}

export interface Subscription {
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: 'active' | 'cancelled' | 'past_due'
  current_period_end?: string
}
