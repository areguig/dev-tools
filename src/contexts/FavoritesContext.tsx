import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (path: string) => void
  removeFavorite: (path: string) => void
  isFavorite: (path: string) => boolean
  toggleFavorite: (path: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

interface FavoritesProviderProps {
  children: ReactNode
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('dev-tools-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dev-tools-favorites', JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (path: string) => {
    setFavorites(prev => prev.includes(path) ? prev : [...prev, path])
  }

  const removeFavorite = (path: string) => {
    setFavorites(prev => prev.filter(fav => fav !== path))
  }

  const isFavorite = (path: string) => {
    return favorites.includes(path)
  }

  const toggleFavorite = (path: string) => {
    if (isFavorite(path)) {
      removeFavorite(path)
    } else {
      addFavorite(path)
    }
  }

  const value: FavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}