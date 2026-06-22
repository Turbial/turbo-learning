import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing !== 'accepted' && existing !== 'declined') {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg p-4 flex items-center gap-4 flex-wrap">
      <p className="flex-1 text-sm text-gray-700 min-w-0">
        🍪 We use cookies to improve your experience and analyse usage. Read our{' '}
        <Link
          to="/privacy"
          className="text-green-600 hover:text-green-700 underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDecline}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
