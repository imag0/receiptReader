import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Expose a flag to indicate whether Supabase is configured
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

// Only create the browser client when env vars exist to avoid runtime errors
export const supabase = hasSupabase
  ? createBrowserClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as unknown as ReturnType<typeof createBrowserClient>) // Only create the admin client when service role key is present (server-side only usage)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = serviceRoleKey && supabaseUrl
  ? createClient(supabaseUrl as string, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : (null as unknown as ReturnType<typeof createClient>) // Database types
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
