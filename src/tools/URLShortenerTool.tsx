import { useState, useCallback } from 'react'

interface ShortenedURL {
  original: string
  shortened: string
  timestamp: Date
}

const URLShortenerTool = () => {
  const [inputUrl, setInputUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ShortenedURL | null>(null)
  const [history, setHistory] = useState<ShortenedURL[]>([])
  const [copied, setCopied] = useState('')

  const validateURL = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const normalizeURL = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url
    }
    return url
  }

  const shortenURL = useCallback(async (url: string) => {
    const normalizedUrl = normalizeURL(url)
    
    if (!validateURL(normalizedUrl)) {
      throw new Error('Please enter a valid URL')
    }

    setIsLoading(true)
    setError('')

    try {
      // Using TinyURL API (free, no registration required)
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(normalizedUrl)}`)
      
      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const shortenedUrl = await response.text()
      
      if (shortenedUrl.includes('Error') || !shortenedUrl.includes('tinyurl.com')) {
        throw new Error('Invalid URL or service unavailable')
      }

      const newResult: ShortenedURL = {
        original: normalizedUrl,
        shortened: shortenedUrl,
        timestamp: new Date()
      }

      setResult(newResult)
      setHistory(prev => [newResult, ...prev.slice(0, 9)]) // Keep last 10
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to shorten URL'
      setError(errorMessage)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputUrl.trim()) {
      shortenURL(inputUrl.trim())
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const clearHistory = () => {
    setHistory([])
    setResult(null)
  }

  const generateQRCode = (url: string) => {
    // Using QR Server API (free, no registration required)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    window.open(qrUrl, '_blank')
  }

  const analyzeURL = (url: string) => {
    try {
      const urlObj = new URL(url)
      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search
      }
    } catch {
      return null
    }
  }

  const urlAnalysis = result ? analyzeURL(result.original) : null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          URL Shortener
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Shorten long URLs to make them easier to share. Uses TinyURL service for reliable link shortening.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter URL to shorten (e.g., https://example.com/very/long/path)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputUrl.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                URL Shortened Successfully!
              </h3>
              
              <div className="space-y-4">
                {/* Original URL */}
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Original URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={result.original}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(result.original, 'original')}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        copied === 'original'
                          ? 'bg-green-700 text-white'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {copied === 'original' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Shortened URL */}
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Shortened URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={result.shortened}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-sm font-mono font-bold text-green-700 dark:text-green-300"
                    />
                    <button
                      onClick={() => copyToClipboard(result.shortened, 'shortened')}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        copied === 'shortened'
                          ? 'bg-green-700 text-white'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {copied === 'shortened' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => window.open(result.shortened, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔗 Test Link
                  </button>
                  <button
                    onClick={() => generateQRCode(result.shortened)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                  >
                    📱 QR Code
                  </button>
                </div>

                {/* URL Analysis */}
                {urlAnalysis && (
                  <div className="mt-4 p-3 bg-white dark:bg-green-900/30 rounded border">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">URL Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Domain:</span> {urlAnalysis.hostname}</div>
                      <div><span className="font-medium">Protocol:</span> {urlAnalysis.protocol}</div>
                      {urlAnalysis.pathname !== '/' && (
                        <div><span className="font-medium">Path:</span> {urlAnalysis.pathname}</div>
                      )}
                      {urlAnalysis.search && (
                        <div><span className="font-medium">Query:</span> {urlAnalysis.search}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Shortened URLs
                </h3>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear History
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.original}
                        </div>
                        <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {item.shortened}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.timestamp.toLocaleDateString()}</span>
                        <button
                          onClick={() => copyToClipboard(item.shortened, `history-${index}`)}
                          className={`px-2 py-1 rounded transition-colors ${
                            copied === `history-${index}`
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {copied === `history-${index}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setInputUrl('https://github.com/facebook/react')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">GitHub Repository</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  github.com/facebook/react
                </div>
              </button>
              
              <button
                onClick={() => setInputUrl('https://developer.mozilla.org/en-US/docs/Web/JavaScript')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Documentation Link</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  MDN JavaScript docs
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About URL Shortening
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Shortened URLs redirect to the original URL when clicked</li>
              <li>• Perfect for social media, emails, and printed materials</li>
              <li>• QR codes can be generated for easy mobile access</li>
              <li>• All shortening is done through TinyURL's reliable service</li>
              <li>• Links are permanent and don't expire</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default URLShortenerTool