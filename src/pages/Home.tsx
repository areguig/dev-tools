import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../contexts/FavoritesContext'
import { useHistory } from '../contexts/HistoryContext'
import { useEnhancedSearch } from '../hooks/useEnhancedSearch'
import EnhancedSearch from '../components/EnhancedSearch'

const Home = () => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recentTools, clearHistory } = useHistory()
  const { query, groupedResults, searchResults } = useEnhancedSearch()
  const navigate = useNavigate()

  // Filter categories based on search and favorites
  const displayedCategories = useMemo(() => {
    // If there's a search query, use enhanced search results
    if (query.trim()) {
      return groupedResults
    }

    // If showing favorites only, filter to favorite tools
    if (showFavoritesOnly) {
      const favoriteTools = searchResults.filter(tool => favorites.includes(tool.path))
      const favoritesMap = new Map()
      
      favoriteTools.forEach(tool => {
        const categoryTitle = tool.category
        if (!favoritesMap.has(categoryTitle)) {
          favoritesMap.set(categoryTitle, {
            title: categoryTitle,
            description: tool.categoryTitle || '',
            tools: []
          })
        }
        favoritesMap.get(categoryTitle).tools.push({
          name: tool.name,
          path: tool.path,
          icon: tool.icon
        })
      })
      
      return Array.from(favoritesMap.values())
    }

    // Default: show all categories from enhanced search (no query, no filters)
    return groupedResults
  }, [query, groupedResults, showFavoritesOnly, favorites, searchResults])

  return (
    <main className="max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Developer Tools Suite - 31 Professional Utilities
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Comprehensive collection of free developer tools - Base64 encoder, JSON formatter, JWT generator, hash calculator, regex tester and more. All running locally in your browser with complete privacy.
        </p>
        
        {/* Enhanced Search */}
        <div className="mb-8">
          <EnhancedSearch 
            onToolSelect={(toolPath) => navigate(toolPath)}
            placeholder="Search tools... (try 'json', 'hash', 'base64', or 'security')"
          />
        </div>
        
        {/* Favorites Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showFavoritesOnly
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Tools (31)
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⭐ Favorites ({favorites.length})
            </button>
          </div>
        </div>
      </header>

      {/* Recent Tools Section */}
      {!query && !showFavoritesOnly && recentTools.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recently Used
            </h2>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear History
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentTools.slice(0, 5).map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">
                  {tool.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(tool.timestamp).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {query && displayedCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try searching for "json", "hash", "color", or "regex"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedCategories.map((category) => (
          <div
            key={category.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {category.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {category.description}
            </p>
            <div className="space-y-2">
              {category.tools.map((tool: { name: string; path: string; icon: string }) => (
                <div key={tool.path} className="flex items-center">
                  <Link
                    to={tool.path}
                    className="flex items-center flex-1 p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-2xl mr-3">{tool.icon}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {tool.name}
                    </span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(tool.path)
                    }}
                    className={`ml-2 p-2 rounded-md transition-colors ${
                      isFavorite(tool.path)
                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isFavorite(tool.path) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 More tools coming soon!
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            This is just the beginning. We're adding more developer utilities regularly.
          </p>
        </div>
      </div>
    </main>
  )
}

export default Home