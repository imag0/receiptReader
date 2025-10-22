'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Download, Settings, Search, LogOut, Copy, Mail } from 'lucide-react'
import EditReceiptModal from '@/components/EditReceiptModal'
import { useAuth } from '@/components/SupabaseAuthProvider'

interface Receipt {
  id: string
  vendor: string
  date: string
  amount: number
  currency: string
  category: string
  imageUrl?: string
  created_at: string
}

export default function Dashboard() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [loading, user, router])

  // Load receipts on mount
  useEffect(() => {
    if (user) {
      loadReceipts()
    }
  }, [user])

  const loadReceipts = async () => {
    try {
      const response = await fetch('/api/receipts')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error('Failed to load receipts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true)
    
    for (const file of acceptedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Max size is 10MB.')
        continue
      }

      try {
        // Create FormData and send to API
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/receipts/extract', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to process receipt')
        }

        const extractedData = await response.json()
        
        // Create new receipt with extracted data
        const newReceipt: Receipt = {
          id: Date.now().toString(),
          vendor: extractedData.vendor || 'Unknown Vendor',
          date: extractedData.date || new Date().toISOString().split('T')[0],
          amount: extractedData.amount || 0,
          currency: extractedData.currency || 'USD',
          category: extractedData.category || 'Other',
          imageUrl: URL.createObjectURL(file),
          created_at: new Date().toISOString()
        }

        // Save to database
        const saveResponse = await fetch('/api/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendor: newReceipt.vendor,
            date: newReceipt.date,
            amount: newReceipt.amount,
            currency: newReceipt.currency,
            category: newReceipt.category,
            image_url: newReceipt.imageUrl
          }),
        })

        if (saveResponse.status === 403) {
          const errorData = await saveResponse.json()
          alert(errorData.error)
          return
        }

        if (saveResponse.ok) {
          const savedReceipt = await saveResponse.json()
          setReceipts(prev => [savedReceipt, ...prev])
        } else {
          // Still show in UI even if save failed
          setReceipts(prev => [newReceipt, ...prev])
        }
        
      } catch (error) {
        console.error('Error processing receipt:', error)
        alert('Failed to process receipt. Please try again.')
      }
    }
    
    setIsUploading(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const deleteReceipt = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    try {
      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReceipts(prev => prev.filter(r => r.id !== receiptId))
      } else {
        alert('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Error deleting receipt:', error)
      alert('Failed to delete receipt')
    }
  }

  const updateReceipt = async (receiptId: string, updatedData: Partial<Receipt>) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedReceipt = await response.json()
        setReceipts(prev => prev.map(r => r.id === receiptId ? updatedReceipt : r))
      } else {
        alert('Failed to update receipt')
      }
    } catch (error) {
      console.error('Error updating receipt:', error)
      alert('Failed to update receipt')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Vendor', 'Date', 'Amount', 'Currency', 'Category'],
      ...receipts.map(r => [r.vendor, r.date, r.amount.toString(), r.currency, r.category])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'receipts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const emailToSelf = async () => {
    try {
      const response = await fetch('/api/receipts/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receipts }),
      })

      if (response.ok) {
        const { mailtoLink } = await response.json()
        window.location.href = mailtoLink
      } else {
        alert('Failed to prepare email')
      }
    } catch (error) {
      console.error('Error preparing email:', error)
      alert('Failed to prepare email')
    }
  }

  const copyToClipboard = async () => {
    const csvContent = [
      ['Vendor', 'Date', 'Amount', 'Currency', 'Category'],
      ...receipts.map(r => [r.vendor, r.date, r.amount.toString(), r.currency, r.category])
    ].map(row => row.join(',')).join('\n')

    try {
      await navigator.clipboard.writeText(csvContent)
      alert('Receipt data copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const filteredReceipts = receipts.filter(receipt =>
    receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Receipt Scanner</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userProfile?.subscription_tier === 'free' 
                  ? `Free Plan: ${receipts.length}/5 receipts` 
                  : 'Pro Plan: Unlimited'}
              </span>
              <button 
                onClick={() => router.push('/settings')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-5 w-5 mr-1" />
                Settings
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isUploading ? (
              <p className="text-lg text-blue-600">Processing receipt...</p>
            ) : (
              <>
                <p className="text-lg text-gray-600 mb-2">
                  {isDragActive ? 'Drop your receipt here' : 'Drag & drop receipt photos here, or click to select'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, HEIC up to 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Data
            </button>
            <button
              onClick={emailToSelf}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email to Self
            </button>
          </div>
        </div>

        {/* Receipts List */}
        <div className="bg-white rounded-lg shadow">
          {filteredReceipts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No receipts found. Upload your first receipt above!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{receipt.vendor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{receipt.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {receipt.currency} {receipt.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setEditingReceipt(receipt)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteReceipt(receipt.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingReceipt && (
        <EditReceiptModal
          receipt={editingReceipt}
          isOpen={!!editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onSave={updateReceipt}
        />
      )}
    </div>
  )
}
