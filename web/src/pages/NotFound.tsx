import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page Not Found')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Wordmark */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg hover:opacity-80 transition-opacity">
          <span className="text-2xl">⚡</span>
          <span>Turbo Learning</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-green-500 leading-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-500 text-base leading-relaxed">
          Looks like this page went on a learning journey without you.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            Go to Journey
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
