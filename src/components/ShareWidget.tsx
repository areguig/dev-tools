import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useShareAnalytics } from '../contexts/ShareAnalyticsContext'

interface ShareWidgetProps {
  toolName: string
  isVisible: boolean
  onClose: () => void
}

interface SharePlatform {
  name: string
  icon: string
  color: string
  action: (url: string, text: string) => void
}

const ShareWidget = ({ toolName, isVisible, onClose }: ShareWidgetProps) => {
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const { trackShare } = useShareAnalytics()

  const currentUrl = `https://areguig.github.io/dev-tools${location.pathname}`
  
  const shareText = `🔧 Just used this awesome ${toolName} tool! Perfect for developers - fast, secure, and runs locally in your browser.`
  
  const platforms: SharePlatform[] = [
    {
      name: 'Twitter/X',
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-800',
      action: (url, text) => {
        const tweetText = `${text}\n\n${url}\n\n#DeveloperTools #Coding #WebDev #OpenSource`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
        trackShare(toolName, 'Twitter/X', url)
      }
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: (url, text) => {
        const linkedInText = `${text}\n\nFree developer utilities collection with 31+ tools including Base64 encoder, JSON formatter, JWT generator, and more.`
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(linkedInText)}`, '_blank')
        trackShare(toolName, 'LinkedIn', url)
      }
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      action: (url, text) => {
        const whatsappText = `${text}\n\nCheck it out: ${url}`
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
        trackShare(toolName, 'WhatsApp', url)
      }
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: (url, text) => {
        const telegramText = `${text}\n\n${url}`
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(telegramText)}`, '_blank')
        trackShare(toolName, 'Telegram', url)
      }
    },
    {
      name: 'Slack',
      icon: '💬',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: (url, text) => {
        const slackText = `${text}\n\nGreat for team productivity: ${url}`
        // Slack doesn't have a direct share URL, so we'll copy a formatted message
        navigator.clipboard.writeText(slackText).then(() => {
          alert('Message copied! Paste it in your Slack channel.')
          trackShare(toolName, 'Slack', url)
        })
      }
    },
    {
      name: 'Teams',
      icon: '🏢',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: (url, text) => {
        const teamsText = `${text}\n\nUseful developer tools for our team: ${url}`
        navigator.clipboard.writeText(teamsText).then(() => {
          alert('Message copied! Paste it in your Teams chat.')
          trackShare(toolName, 'Teams', url)
        })
      }
    }
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackShare(toolName, 'Copy Link', currentUrl)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  // Auto-hide after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 transform transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚀</span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Found this useful?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
          Share {toolName} with your team or network!
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => platform.action(currentUrl, shareText)}
              className={`${platform.color} text-white text-xs px-2 py-2 rounded-md transition-colors flex flex-col items-center justify-center min-h-[60px]`}
              title={`Share on ${platform.name}`}
            >
              <span className="text-lg mb-1">{platform.icon}</span>
              <span className="text-[10px] text-center leading-tight">{platform.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={currentUrl}
            readOnly
            className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          />
          <button
            onClick={copyLink}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="text-center mt-3">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Help us grow by sharing! 💙
          </span>
        </div>
      </div>
    </div>
  )
}

export default ShareWidget