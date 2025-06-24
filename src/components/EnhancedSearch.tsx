import React, { useState, useEffect, useRef } from 'react'
import { useEnhancedSearch } from '../hooks/useEnhancedSearch'

interface EnhancedSearchProps {
  onToolSelect?: (toolPath: string) => void
  placeholder?: string
}

const EnhancedSearch = ({ 
  onToolSelect, 
  placeholder = "Search tools... (try 'json', 'hash', or 'base64')" 
}: EnhancedSearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const { 
    query, 
    setQuery, 
    searchResults
  } = useEnhancedSearch()

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(value.length > 0)
  }

  // Handle search input focus
  const handleInputFocus = () => {
    if (query.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // Handle search suggestion click
  const handleSuggestionClick = (toolPath: string) => {
    setShowSuggestions(false)
    if (onToolSelect) {
      onToolSelect(toolPath)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get top search suggestions (limit to 5)
  const topSuggestions = searchResults.slice(0, 5)

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && topSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 max-h-64 overflow-y-auto"
        >
          {topSuggestions.map((tool, index) => (
            <button
              key={tool.path}
              onMouseDown={(e) => {
                e.preventDefault() // Prevent input blur
                handleSuggestionClick(tool.path)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                index === 0 ? 'rounded-t-lg' : ''
              } ${
                index === topSuggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{tool.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</div>
              </div>
              {tool.score && (
                <div className="text-xs text-gray-400">
                  {Math.round((1 - tool.score) * 100)}% match
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnhancedSearch