import { createContext, useContext, type ReactNode } from 'react'

interface ShareEvent {
  toolName: string
  platform: string
  timestamp: number
  url: string
}

interface ShareAnalyticsContextType {
  trackShare: (toolName: string, platform: string, url: string) => void
  getShareStats: () => ShareEvent[]
}

const ShareAnalyticsContext = createContext<ShareAnalyticsContextType | undefined>(undefined)

interface ShareAnalyticsProviderProps {
  children: ReactNode
}

export const ShareAnalyticsProvider = ({ children }: ShareAnalyticsProviderProps) => {
  const trackShare = (toolName: string, platform: string, url: string) => {
    const shareEvent: ShareEvent = {
      toolName,
      platform,
      timestamp: Date.now(),
      url
    }

    // Store in localStorage for analytics
    const existingShares = JSON.parse(localStorage.getItem('share-analytics') || '[]')
    existingShares.push(shareEvent)
    
    // Keep only last 100 share events to prevent localStorage bloat
    if (existingShares.length > 100) {
      existingShares.splice(0, existingShares.length - 100)
    }
    
    localStorage.setItem('share-analytics', JSON.stringify(existingShares))
  }

  const getShareStats = (): ShareEvent[] => {
    return JSON.parse(localStorage.getItem('share-analytics') || '[]')
  }

  return (
    <ShareAnalyticsContext.Provider value={{ trackShare, getShareStats }}>
      {children}
    </ShareAnalyticsContext.Provider>
  )
}

export const useShareAnalytics = () => {
  const context = useContext(ShareAnalyticsContext)
  if (context === undefined) {
    throw new Error('useShareAnalytics must be used within a ShareAnalyticsProvider')
  }
  return context
}