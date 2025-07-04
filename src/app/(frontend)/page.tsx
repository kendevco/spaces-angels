import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home - Spaces Platform',
  description: 'The ultimate platform for creators, businesses, and communities to build, engage, and monetize their digital presence.',
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8">
        <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Spaces
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The ultimate platform for creators, businesses, and communities to build,
          engage, and monetize their digital presence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/spaces"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Explore Spaces
          </a>
          <a
            href="/products"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Products
          </a>
          <a
            href="/posts"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Latest Posts
          </a>
          <a
            href="/integrations"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center gap-2"
          >
            🔗 Integration Hub
          </a>
        </div>
      </div>
    </div>
  )
}
