import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with fallback
let supabase: any = null

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Mock database for development when Supabase isn't configured
class MockDatabase {
  private getFromStorage(key: string) {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private saveToStorage(key: string, data: any) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      console.error('Failed to save to localStorage')
    }
  }

  async getUserByEmail(email: string) {
    const users = this.getFromStorage('users') || []
    return users.find((user: any) => user.email === email)
  }

  async createUser(userData: any) {
    const users = this.getFromStorage('users') || []
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      created_at: new Date().toISOString()
    }
    users.push(newUser)
    this.saveToStorage('users', users)
    return newUser
  }

  async getUserReceipts(userId: string) {
    const receipts = this.getFromStorage('receipts') || []
    return receipts.filter((receipt: any) => receipt.user_id === userId)
  }

  async createReceipt(receiptData: any) {
    const receipts = this.getFromStorage('receipts') || []
    const newReceipt = {
      id: crypto.randomUUID(),
      ...receiptData,
      created_at: new Date().toISOString()
    }
    receipts.push(newReceipt)
    this.saveToStorage('receipts', receipts)
    return newReceipt
  }

  async deleteReceipt(receiptId: string) {
    const receipts = this.getFromStorage('receipts') || []
    const filtered = receipts.filter((receipt: any) => receipt.id !== receiptId)
    this.saveToStorage('receipts', filtered)
    return true
  }

  async updateReceipt(receiptId: string, updates: any) {
    const receipts = this.getFromStorage('receipts') || []
    const receiptIndex = receipts.findIndex((receipt: any) => receipt.id === receiptId)
    if (receiptIndex !== -1) {
      receipts[receiptIndex] = { ...receipts[receiptIndex], ...updates }
      this.saveToStorage('receipts', receipts)
      return receipts[receiptIndex]
    }
    return null
  }

  async updateUser(userId: string, updates: any) {
    const users = this.getFromStorage('users') || []
    const userIndex = users.findIndex((user: any) => user.id === userId)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      this.saveToStorage('users', users)
      return users[userIndex]
    }
    return null
  }

  async deleteUser(userId: string) {
    const users = this.getFromStorage('users') || []
    const receipts = this.getFromStorage('receipts') || []
    
    // Remove user
    const filteredUsers = users.filter((user: any) => user.id !== userId)
    this.saveToStorage('users', filteredUsers)
    
    // Remove user's receipts
    const filteredReceipts = receipts.filter((receipt: any) => receipt.user_id !== userId)
    this.saveToStorage('receipts', filteredReceipts)
    
    return true
  }
}

const mockDB = new MockDatabase()

export const db = {
  // User operations
  getUserByEmail: async (email: string) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      return error ? null : data
    }
    return mockDB.getUserByEmail(email)
  },

  createUser: async (userData: any) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()
      if (error) throw error
      return data
    }
    return mockDB.createUser(userData)
  },

  updateUser: async (userId: string, updates: any) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    }
    return mockDB.updateUser(userId, updates)
  },

  deleteUser: async (userId: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      if (error) throw error
      return true
    }
    return mockDB.deleteUser(userId)
  },

  // Receipt operations
  getUserReceipts: async (userId: string) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return error ? [] : data
    }
    return mockDB.getUserReceipts(userId)
  },

  createReceipt: async (receiptData: any) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('receipts')
        .insert([receiptData])
        .select()
        .single()
      if (error) throw error
      return data
    }
    return mockDB.createReceipt(receiptData)
  },

  deleteReceipt: async (receiptId: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId)
      if (error) throw error
      return true
    }
    return mockDB.deleteReceipt(receiptId)
  },

  updateReceipt: async (receiptId: string, updates: any) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', receiptId)
        .select()
        .single()
      if (error) throw error
      return data
    }
    return mockDB.updateReceipt(receiptId, updates)
  }
}

export { supabase }
