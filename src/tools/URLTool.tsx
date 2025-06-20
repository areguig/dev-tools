import { useState, useCallback } from 'react'

type EncodingMode = 'url' | 'uri' | 'component'

const URLTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodingType, setEncodingType] = useState<EncodingMode>('url')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const encodeURL = useCallback((text: string, type: EncodingMode) => {
    try {
      switch (type) {
        case 'url':
          return encodeURI(text)
        case 'uri':
          return encodeURIComponent(text)
        case 'component':
          // More aggressive encoding for URL components
          return encodeURIComponent(text)
            .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
        default:
          return encodeURIComponent(text)
      }
    } catch (err) {
      throw new Error('Failed to encode URL')
    }
  }, [])

  const decodeURL = useCallback((text: string) => {
    try {
      // Try decodeURIComponent first (most common)
      return decodeURIComponent(text)
    } catch (err) {
      try {
        // Fallback to decodeURI
        return decodeURI(text)
      } catch (err2) {
        throw new Error('Invalid URL encoding')
      }
    }
  }, [])

  const processURL = useCallback((text: string) => {
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeURL(text, encodingType)
        setOutput(encoded)
      } else {
        const decoded = decodeURL(text)
        setOutput(decoded)
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process URL')
      setOutput('')
    }
  }, [mode, encodingType, encodeURL, decodeURL])

  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    processURL(value)
  }

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode)
    setCopied(false)
    if (input.trim()) {
      processURL(input)
    }
  }

  const handleEncodingTypeChange = (newType: EncodingMode) => {
    setEncodingType(newType)
    setCopied(false)
    if (input.trim() && mode === 'encode') {
      processURL(input)
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setCopied(false)
  }

  const analyzeURL = (url: string) => {
    if (!url.trim()) return null

    try {
      const urlObj = new URL(url)
      return {
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin
      }
    } catch (err) {
      return null
    }
  }

  const urlAnalysis = mode === 'decode' && output ? analyzeURL(output) : null

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          URL Encoder/Decoder
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Encode URLs for safe transmission or decode URL-encoded strings back to readable text.
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleModeChange('encode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Decode
              </button>
            </div>

            {/* Encoding Type (only for encode mode) */}
            {mode === 'encode' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type:
                </label>
                <select
                  value={encodingType}
                  onChange={(e) => handleEncodingTypeChange(e.target.value as EncodingMode)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="url">URL (encodeURI)</option>
                  <option value="uri">URI Component (encodeURIComponent)</option>
                  <option value="component">Component (strict)</option>
                </select>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
                </label>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL-encoded text to decode...'}
              />
            </div>

            {/* Output Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}
                </label>
                <button
                  onClick={copyToClipboard}
                  disabled={!output}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder={`${mode === 'encode' ? 'Encoded URL' : 'Decoded text'} will appear here...`}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* URL Analysis (for decode mode) */}
          {urlAnalysis && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                URL Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(urlAnalysis).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-white dark:bg-blue-900/30 p-3 rounded border">
                      <span className="font-medium text-blue-800 dark:text-blue-200 capitalize">
                        {key}:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300 font-mono text-sm break-all">
                        {value}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange('https://example.com/search?q=hello world&lang=en')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">URL with Query</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  ?q=hello world&lang=en
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange('Special chars: @#$%^&*()+=')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Special Characters</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  @#$%^&*()+= symbols
                </div>
              </button>

              <button
                onClick={() => handleInputChange('https%3A//example.com/path%20with%20spaces')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Encoded URL</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  https%3A//example.com/...
                </div>
              </button>

              <button
                onClick={() => handleInputChange('User input: "Hello & goodbye"')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Text with Quotes</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  "Hello & goodbye"
                </div>
              </button>
            </div>
          </div>

          {/* Encoding Types Info */}
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              URL Encoding Types
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <div>
                <strong>URL (encodeURI):</strong> Encodes a complete URL, preserving URL structure characters (:, /, ?, #)
              </div>
              <div>
                <strong>URI Component:</strong> Encodes URL components like query parameters, encoding all special characters
              </div>
              <div>
                <strong>Component (strict):</strong> Most aggressive encoding, including characters like parentheses and quotes
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About URL Encoding
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• URL encoding converts special characters to percent-encoded format (%20 for space)</li>
              <li>• Required for safely transmitting URLs with special characters</li>
              <li>• Different encoding types are used for different parts of URLs</li>
              <li>• Decoding converts percent-encoded strings back to readable text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default URLTool