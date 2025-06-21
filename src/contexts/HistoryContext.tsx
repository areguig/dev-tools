import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface HistoryItem {
  path: string
  name: string
  icon: string
  timestamp: number
}

interface HistoryContextType {
  recentTools: HistoryItem[]
  addToHistory: (path: string, name: string, icon: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const useHistory = () => {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}

interface HistoryProviderProps {
  children: ReactNode
}

const MAX_HISTORY_ITEMS = 10

export const HistoryProvider = ({ children }: HistoryProviderProps) => {
  const [recentTools, setRecentTools] = useState<HistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('dev-tools-history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        const validHistory = parsed.filter((item: HistoryItem) => item.timestamp > thirtyDaysAgo)
        setRecentTools(validHistory)
      } catch (error) {
        console.error('Failed to load history from localStorage:', error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dev-tools-history', JSON.stringify(recentTools))
  }, [recentTools])

  const addToHistory = (path: string, name: string, icon: string) => {
    setRecentTools(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(item => item.path !== path)
      
      // Add new entry at the beginning
      const newItem: HistoryItem = {
        path,
        name,
        icon,
        timestamp: Date.now()
      }
      
      // Keep only the most recent MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const clearHistory = () => {
    setRecentTools([])
  }

  const value: HistoryContextType = {
    recentTools,
    addToHistory,
    clearHistory
  }

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  )
}