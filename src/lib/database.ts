import { supabase, supabaseAdmin, UserProfile, Receipt } from './supabase'

// Check if we have Supabase configuration
const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface LocalUser {
  id: string
  email: string
  subscription_tier: 'free' | 'pro'
  receipts_this_month: number
  created_at: string
}

interface LocalReceipt {
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

// Define the database client interface for better type inference
interface DatabaseClient {
  getUser(userId: string): Promise<UserProfile | null>
  getUserByEmail(email: string): Promise<UserProfile | null>
  createUser(user: Omit<UserProfile, 'created_at'>): Promise<UserProfile | null>
  updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>
  getReceipts(userId: string): Promise<Receipt[]>
  createReceipt(receipt: Omit<Receipt, 'id' | 'created_at'>): Promise<Receipt | null>
  updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<Receipt | null>
  deleteReceipt(receiptId: string): Promise<boolean>
  deleteUser(userId: string): Promise<boolean>
}

// Database client that works with both Supabase and localStorage
export const db: DatabaseClient = {
  // User operations
  async getUser(userId: string): Promise<UserProfile | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error || !data) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      return users.find((u: LocalUser) => u.id === userId) || null
    }
  },

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error || !data) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      return users.find((u: LocalUser) => u.email === email) || null
    }
  },

  async createUser(user: Omit<UserProfile, 'created_at'>): Promise<UserProfile | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([user])
        .select()
        .single()
      
      if (error) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const newUser: LocalUser = {
        ...user,
        created_at: new Date().toISOString()
      }
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      return newUser
    }
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u: LocalUser) => u.id === userId)
      if (userIndex === -1) return null
      
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('users', JSON.stringify(users))
      return users[userIndex]
    }
  },

  // Receipt operations
  async getReceipts(userId: string): Promise<Receipt[]> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) return []
      return data || []
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return []
      const receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
      return receipts.filter((r: LocalReceipt) => r.user_id === userId)
    }
  },

  async createReceipt(receipt: Omit<Receipt, 'id' | 'created_at'>): Promise<Receipt | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('receipts')
        .insert([receipt])
        .select()
        .single()
      
      if (error) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const newReceipt: LocalReceipt = {
        ...receipt,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      const receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
      receipts.push(newReceipt)
      localStorage.setItem('receipts', JSON.stringify(receipts))
      return newReceipt
    }
  },

  async updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', receiptId)
        .select()
        .single()
      
      if (error) return null
      return data
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return null
      const receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
      const receiptIndex = receipts.findIndex((r: LocalReceipt) => r.id === receiptId)
      if (receiptIndex === -1) return null
      
      receipts[receiptIndex] = { ...receipts[receiptIndex], ...updates }
      localStorage.setItem('receipts', JSON.stringify(receipts))
      return receipts[receiptIndex]
    }
  },

  async deleteReceipt(receiptId: string): Promise<boolean> {
    if (hasSupabase) {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId)
      
      return !error
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return false
      const receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
      const filteredReceipts = receipts.filter((r: LocalReceipt) => r.id !== receiptId)
      localStorage.setItem('receipts', JSON.stringify(filteredReceipts))
      return true
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (hasSupabase) {
      // This will cascade delete receipts and subscriptions due to foreign key constraints
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      return !error
    } else {
      // localStorage fallback
      if (typeof window === 'undefined') return false
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
      
      const filteredUsers = users.filter((u: LocalUser) => u.id !== userId)
      const filteredReceipts = receipts.filter((r: LocalReceipt) => r.user_id !== userId)
      
      localStorage.setItem('users', JSON.stringify(filteredUsers))
      localStorage.setItem('receipts', JSON.stringify(filteredReceipts))
      return true
    }
  }
}