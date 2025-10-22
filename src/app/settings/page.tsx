'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/SupabaseAuthProvider'

export default function Settings() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [loading, user, router])

  const handleUpgradeToPro = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1234567890', // Demo price ID
          userId: user?.id
        }),
      })

      const data = await response.json()
      
      if (data.message) {
        alert(`${data.message}\n\nIn production, you would:\n1. Set up Stripe products\n2. Configure webhook endpoints\n3. Add real price IDs`)
      }
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access to unlimited receipts.')) {
      return
    }

    setIsLoading(true)
    try {
      await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        }),
      })

      alert('Subscription cancelled successfully.')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmText !== 'DELETE') {
      return
    }

    setIsLoading(true)
    try {
      await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Account Information
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userProfile?.subscription_tier === 'pro' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userProfile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                  </span>
                  {userProfile?.subscription_tier === 'free' && (
                    <span className="ml-2 text-sm text-gray-500">5 receipts per month</span>
                  )}
                  {userProfile?.subscription_tier === 'pro' && (
                    <span className="ml-2 text-sm text-gray-500">Unlimited receipts</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription
            </h2>
          </div>
          <div className="px-6 py-4">
            {userProfile?.subscription_tier === 'free' ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upgrade to Pro</h3>
                <p className="text-gray-600 mb-4">
                  Get unlimited receipt scanning for just $15/month.
                </p>
                <button
                  onClick={handleUpgradeToPro}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pro Plan Active</h3>
                <p className="text-gray-600 mb-4">
                  You have unlimited access to receipt scanning.
                </p>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <h2 className="text-lg font-medium text-red-900 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
