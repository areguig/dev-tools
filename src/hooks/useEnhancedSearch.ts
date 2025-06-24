import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { toolsData, type Tool } from '../data/toolsData'

export interface SearchResult extends Tool {
  score?: number
  matches?: any[]
  categoryTitle?: string
  categoryDescription?: string
}

export const useEnhancedSearch = () => {
  const [query, setQueryState] = useState('')

  // Flatten all tools for search
  const allTools = useMemo(() => {
    return toolsData.flatMap(category => 
      category.tools.map(tool => ({
        ...tool,
        categoryTitle: category.title,
        categoryDescription: category.description
      }))
    )
  }, [])

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const options = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.4, // 0 = exact match, 1 = match anything
      minMatchCharLength: 2,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'keywords', weight: 0.1 }
      ]
    }
    return new Fuse(allTools, options)
  }, [allTools])

  // Search function with fuzzy matching
  const searchResults = useMemo(() => {
    let results: SearchResult[] = []

    if (query.trim()) {
      // Use fuzzy search
      const fuseResults = fuse.search(query)
      results = fuseResults.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches ? [...result.matches] : undefined
      }))
    } else {
      // No query, return all tools
      results = allTools.map(tool => ({ ...tool }))
    }

    // Sort by popularity and relevance
    return results.sort((a, b) => {
      // If we have search scores, use them first
      if (a.score !== undefined && b.score !== undefined) {
        if (Math.abs(a.score - b.score) > 0.1) {
          return a.score - b.score // Lower score = better match
        }
      }
      // Then by popularity
      return b.popularity - a.popularity
    })
  }, [query, fuse, allTools])

  // Group results by category
  const groupedResults = useMemo(() => {
    const grouped: { [category: string]: SearchResult[] } = {}
    
    searchResults.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = []
      }
      grouped[tool.category].push(tool)
    })

    return Object.entries(grouped).map(([category, tools]) => ({
      title: category,
      description: toolsData.find(cat => cat.title === category)?.description || '',
      tools
    }))
  }, [searchResults])

  // Update search query
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
  }, [])

  return {
    query,
    searchResults,
    groupedResults,
    setQuery,
    allTools
  }
}