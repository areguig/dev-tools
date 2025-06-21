import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'

const Base64Tool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleEncode = useCallback((text: string) => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)))
      setOutput(encoded)
      setError('')
    } catch (err) {
      setError('Failed to encode: Invalid input')
      setOutput('')
    }
  }, [])

  const handleDecode = useCallback((text: string) => {
    try {
      const decoded = decodeURIComponent(escape(atob(text)))
      setOutput(decoded)
      setError('')
    } catch (err) {
      setError('Failed to decode: Invalid Base64 string')
      setOutput('')
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInput(value)
    setError('')
    setCopied(false)
    
    if (!value.trim()) {
      setOutput('')
      return
    }

    if (mode === 'encode') {
      handleEncode(value)
    } else {
      handleDecode(value)
    }
  }

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode)
    setError('')
    setCopied(false)
    
    if (input.trim()) {
      if (newMode === 'encode') {
        handleEncode(input)
      } else {
        handleDecode(input)
      }
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

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead
        title="Base64 Encoder/Decoder"
        description="Free online Base64 encoder and decoder tool. Encode text to Base64 or decode Base64 strings back to text. Supports UTF-8 encoding including emojis and special characters. Secure, fast, and runs locally in your browser."
        keywords="base64 encoder, base64 decoder, base64 tool, encode decode base64, utf-8 base64, online base64 converter"
        toolName="Base64 Encoder/Decoder"
        category="Text Processing"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Base64 Encoder/Decoder
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Encode text to Base64 or decode Base64 strings back to text. Supports UTF-8 encoding.
          </p>
          
          {/* Mode Toggle */}
          <div className="flex space-x-4 mb-6">
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

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Output Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </label>
              <div className="flex space-x-2">
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
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none"
              placeholder={`${mode === 'encode' ? 'Base64 encoded' : 'Decoded'} text will appear here...`}
            />
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Base64 Encoding
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Base64 is used to encode binary data as ASCII text</li>
              <li>• Commonly used in email attachments, data URLs, and web APIs</li>
              <li>• Supports UTF-8 characters including emojis and special symbols</li>
              <li>• Encoded data is about 33% larger than the original</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Base64Tool