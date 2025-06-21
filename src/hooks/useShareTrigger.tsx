import { useState, useCallback } from 'react'

interface UseShareTriggerOptions {
  toolName: string
  triggerDelay?: number // Delay before showing share widget (in ms)
  cooldownPeriod?: number // Minimum time between shares (in ms)
}

interface ShareTriggerState {
  isVisible: boolean
  showShare: () => void
  hideShare: () => void
  triggerShare: () => void
}

export const useShareTrigger = ({
  toolName,
  triggerDelay = 2000, // 2 seconds delay
  cooldownPeriod = 30000 // 30 seconds cooldown
}: UseShareTriggerOptions): ShareTriggerState => {
  const [isVisible, setIsVisible] = useState(false)

  const storageKey = `share-cooldown-${toolName.replace(/\s+/g, '-').toLowerCase()}`

  const showShare = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hideShare = useCallback(() => {
    setIsVisible(false)
    // Update last shown time
    const now = Date.now()
    localStorage.setItem(storageKey, now.toString())
  }, [storageKey])

  const triggerShare = useCallback(() => {
    const now = Date.now()
    const lastShownTime = parseInt(localStorage.getItem(storageKey) || '0', 10)
    
    // Check if enough time has passed since last share
    if (now - lastShownTime > cooldownPeriod) {
      // Show share widget after delay
      setTimeout(() => {
        setIsVisible(true)
      }, triggerDelay)
    }
  }, [storageKey, cooldownPeriod, triggerDelay])

  // Hook is now simplified - no need to track lastShown in state

  return {
    isVisible,
    showShare,
    hideShare,
    triggerShare
  }
}