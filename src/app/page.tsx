import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Receipt Scanner</h1>
          <div className="space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Scan receipts in seconds
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload receipt photos and extract vendor, date, amount, and category data instantly. 
            No more manual data entry.
          </p>
          
          {/* Demo placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
              <div className="text-gray-400 text-center">
                <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg">Demo: Upload → Extract → Export</p>
                <p className="text-sm text-gray-500">Interactive demo coming soon</p>
              </div>
            </div>
          </div>

          <Link 
            href="/auth/signup" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">Simple Pricing</h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Free</h4>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600 mb-6">5 receipts per month</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Photo upload
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Data extraction
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  CSV export
                </li>
              </ul>
              <Link 
                href="/auth/signup"
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-center block"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-blue-600 rounded-lg p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                Popular
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Pro</h4>
              <div className="text-4xl font-bold text-gray-900 mb-2">$15</div>
              <p className="text-gray-600 mb-6">per month</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited receipts
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All free features
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link 
                href="/auth/signup"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center block"
              >
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2025 Receipt Scanner. Keep it simple.</p>
        </div>
      </footer>
    </main>
  )
}
