import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import ShareWidget from '../components/ShareWidget'
import { useShareTrigger } from '../hooks/useShareTrigger'

type QRCodeSize = '100' | '150' | '200' | '300' | '400' | '500'
type QRCodeFormat = 'PNG' | 'JPG' | 'GIF' | 'SVG'
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface QRCodeOptions {
  size: QRCodeSize
  format: QRCodeFormat
  errorCorrection: ErrorCorrectionLevel
  margin: number
  color: string
  backgroundColor: string
}

const QRCodeTool = () => {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<QRCodeOptions>({
    size: '200',
    format: 'PNG',
    errorCorrection: 'M',
    margin: 0,
    color: '000000',
    backgroundColor: 'ffffff'
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Array<{data: string, url: string, timestamp: Date}>>([])
  
  const { isVisible: shareVisible, hideShare, triggerShare } = useShareTrigger({
    toolName: 'QR Code Generator'
  })

  const generateQRCode = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter text or URL to generate QR code')
      setQrCodeUrl('')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Using QR Server API (free, no registration required)
      const params = new URLSearchParams({
        data: input.trim(),
        size: `${options.size}x${options.size}`,
        format: options.format.toLowerCase(),
        ecc: options.errorCorrection,
        margin: options.margin.toString(),
        color: options.color,
        bgcolor: options.backgroundColor
      })

      const url = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
      
      // Test the URL by trying to load it
      const img = new Image()
      img.onload = () => {
        setQrCodeUrl(url)
        // Add to history
        setHistory(prev => [
          { data: input.trim(), url, timestamp: new Date() },
          ...prev.slice(0, 9) // Keep last 10
        ])
        // Trigger share when QR code is generated successfully
        triggerShare()
      }
      img.onerror = () => {
        setError('Failed to generate QR code. Please check your input.')
        setQrCodeUrl('')
      }
      img.src = url

    } catch (err) {
      setError('Failed to generate QR code')
      setQrCodeUrl('')
    } finally {
      setIsGenerating(false)
    }
  }, [input, options])

  const updateOption = <K extends keyof QRCodeOptions>(key: K, value: QRCodeOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode.${options.format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download QR code:', err)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  const useFromHistory = (data: string) => {
    setInput(data)
    setError('')
    setQrCodeUrl('')
  }

  const detectInputType = (text: string): string => {
    if (text.match(/^https?:\/\//)) return 'URL'
    if (text.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return 'Email'
    if (text.match(/^[\+]?[1-9][\d]{0,15}$/)) return 'Phone'
    if (text.includes('\n') || text.length > 100) return 'Text'
    return 'Text'
  }

  const inputType = input.trim() ? detectInputType(input.trim()) : ''

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead
        title="QR Code Generator"
        description="Generate QR codes for text, URLs, WiFi, and more. Customizable size, error correction, and download options. Create QR codes for sharing links, contact info, and data."
        keywords="qr code generator, qr code creator, generate qr code, qr code maker, barcode generator"
        toolName="QR Code Generator"
        category="URL & QR Tools"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          QR Code Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate QR codes for URLs, text, contact information, or any data. Customize size, colors, and format.
          </p>

          {/* Input Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text or URL to Encode
                {inputType && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                    {inputType}
                  </span>
                )}
              </label>
              <button
                onClick={generateQRCode}
                disabled={!input.trim() || isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter text, URL, email, phone number, or any data..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Generated QR Code
              </h3>
              <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  📥 Download {options.format}
                </button>
                <button
                  onClick={() => window.open(qrCodeUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔍 View Full Size
                </button>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Size and Format */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Size & Format
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size: {options.size}x{options.size} pixels
                </label>
                <select
                  value={options.size}
                  onChange={(e) => updateOption('size', e.target.value as QRCodeSize)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="100">100x100 (Small)</option>
                  <option value="150">150x150</option>
                  <option value="200">200x200 (Medium)</option>
                  <option value="300">300x300 (Large)</option>
                  <option value="400">400x400</option>
                  <option value="500">500x500 (Extra Large)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <select
                  value={options.format}
                  onChange={(e) => updateOption('format', e.target.value as QRCodeFormat)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="PNG">PNG (Recommended)</option>
                  <option value="JPG">JPG</option>
                  <option value="GIF">GIF</option>
                  <option value="SVG">SVG (Vector)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={options.errorCorrection}
                  onChange={(e) => updateOption('errorCorrection', e.target.value as ErrorCorrectionLevel)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="L">Low (~7%)</option>
                  <option value="M">Medium (~15%)</option>
                  <option value="Q">Quartile (~25%)</option>
                  <option value="H">High (~30%)</option>
                </select>
              </div>
            </div>

            {/* Colors and Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Colors & Style
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={`#${options.color}`}
                    onChange={(e) => updateOption('color', e.target.value.replace('#', ''))}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.color}
                    onChange={(e) => updateOption('color', e.target.value.replace('#', ''))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={`#${options.backgroundColor}`}
                    onChange={(e) => updateOption('backgroundColor', e.target.value.replace('#', ''))}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.backgroundColor}
                    onChange={(e) => updateOption('backgroundColor', e.target.value.replace('#', ''))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Margin: {options.margin}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={options.margin}
                  onChange={(e) => updateOption('margin', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setInput('https://github.com')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Website URL</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  https://github.com
                </div>
              </button>
              
              <button
                onClick={() => setInput('mailto:hello@example.com')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Email</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  mailto:hello@example.com
                </div>
              </button>

              <button
                onClick={() => setInput('tel:+1234567890')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Phone</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  tel:+1234567890
                </div>
              </button>

              <button
                onClick={() => setInput('WIFI:T:WPA;S:MyNetwork;P:password123;H:false;')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">WiFi</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Network credentials
                </div>
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent QR Codes
                </h3>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => useFromHistory(item.data)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.data}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About QR Codes
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• QR codes can store URLs, text, contact info, WiFi credentials, and more</li>
              <li>• Higher error correction allows scanning even if partially damaged</li>
              <li>• SVG format provides infinite scalability for print materials</li>
              <li>• Most smartphones can scan QR codes with their camera app</li>
              <li>• Keep colors high contrast for better scanning reliability</li>
            </ul>
          </div>
        </div>
      </div>
      
      <ShareWidget
        toolName="QR Code Generator"
        isVisible={shareVisible}
        onClose={hideShare}
      />
    </div>
  )
}

export default QRCodeTool