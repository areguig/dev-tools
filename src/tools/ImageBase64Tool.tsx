import { useState, useRef, useMemo } from 'react'

type ConversionMode = 'encode' | 'decode'

interface ImageInfo {
  name: string
  size: number
  type: string
  width?: number
  height?: number
}

const ImageBase64Tool = () => {
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [base64Input, setBase64Input] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file)

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setBase64Output(result)
        setPreviewUrl(result)
        setImageInfo({
          name: file.name,
          size: file.size,
          type: file.type,
          width: dimensions.width,
          height: dimensions.height
        })
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to process image')
      setLoading(false)
    }
  }

  // Handle base64 input change
  const handleBase64InputChange = (value: string) => {
    setBase64Input(value)
    setCopied(false)
    setError(null)

    if (!value.trim()) {
      setPreviewUrl(null)
      setImageInfo(null)
      return
    }

    try {
      // Validate base64 format
      let base64Data = value.trim()
      
      // Extract data URL info if present
      const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/)
      if (dataUrlMatch) {
        const mimeType = dataUrlMatch[1]
        const base64Only = dataUrlMatch[2]
        
        // Validate it's an image
        if (!mimeType.startsWith('image/')) {
          setError('Base64 data is not an image')
          return
        }

        setPreviewUrl(base64Data)
        
        // Calculate approximate file size
        const sizeInBytes = Math.round((base64Only.length * 3) / 4)
        setImageInfo({
          name: 'decoded-image.' + mimeType.split('/')[1],
          size: sizeInBytes,
          type: mimeType
        })
      } else {
        // Try to add data URL prefix for common image types
        const testDataUrl = `data:image/png;base64,${base64Data}`
        setPreviewUrl(testDataUrl)
        
        const sizeInBytes = Math.round((base64Data.length * 3) / 4)
        setImageInfo({
          name: 'decoded-image.png',
          size: sizeInBytes,
          type: 'image/png'
        })
      }
    } catch (err) {
      setError('Invalid base64 format')
      setPreviewUrl(null)
      setImageInfo(null)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    const textToCopy = mode === 'encode' ? base64Output : base64Input
    if (!textToCopy) return
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Download image
  const downloadImage = () => {
    if (!previewUrl || !imageInfo) return

    const link = document.createElement('a')
    link.href = previewUrl
    link.download = imageInfo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Clear all
  const clearAll = () => {
    setBase64Input('')
    setBase64Output('')
    setImageInfo(null)
    setPreviewUrl(null)
    setError(null)
    setCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get stats
  const getStats = useMemo(() => {
    const data = mode === 'encode' ? base64Output : base64Input
    if (!data) return null

    const isDataUrl = data.startsWith('data:')
    const base64Part = isDataUrl ? data.split(',')[1] || '' : data
    const base64Length = base64Part.length
    const estimatedSize = Math.round((base64Length * 3) / 4)

    return {
      base64Length,
      estimatedSize: formatFileSize(estimatedSize),
      hasDataUrlPrefix: isDataUrl,
      compressionRatio: imageInfo ? (estimatedSize / imageInfo.size).toFixed(2) : null
    }
  }, [mode, base64Output, base64Input, imageInfo])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Image to Base64 Converter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert images to Base64 encoded strings for embedding in HTML, CSS, or JSON, or decode Base64 back to images.
          </p>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('encode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Image → Base64
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Base64 → Image
              </button>
            </div>
            
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear All
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {mode === 'encode' ? (
            /* Image Upload Section */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Image File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      Click to select an image file
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      Supports JPG, PNG, GIF, WebP (max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Processing image...</span>
                </div>
              )}
            </div>
          ) : (
            /* Base64 Input Section */
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base64 Encoded Image
              </label>
              <textarea
                value={base64Input}
                onChange={(e) => handleBase64InputChange(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Paste Base64 encoded image data here..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Accepts data URLs (data:image/png;base64,...) or raw Base64 strings
              </p>
            </div>
          )}

          {/* Image Info & Preview */}
          {imageInfo && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Image Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                  <div className="font-mono font-medium break-all">{imageInfo.name}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                  <div className="font-mono font-medium">{formatFileSize(imageInfo.size)}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <div className="font-mono font-medium">{imageInfo.type}</div>
                </div>
                {imageInfo.width && imageInfo.height && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                    <div className="font-mono font-medium">{imageInfo.width} × {imageInfo.height}</div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preview</h4>
                    <button
                      onClick={downloadImage}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-64 border border-gray-200 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Base64 Output */}
          {(base64Output || (mode === 'decode' && base64Input)) && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'Base64 Encoded Data' : 'Base64 Input'}
                </label>
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                value={mode === 'encode' ? base64Output : base64Input}
                readOnly
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Statistics */}
          {getStats && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Base64 Length:</span>
                  <div className="font-mono font-medium">{getStats.base64Length.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Estimated Size:</span>
                  <div className="font-mono font-medium">{getStats.estimatedSize}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Data URL:</span>
                  <div className="font-mono font-medium">{getStats.hasDataUrlPrefix ? 'Yes' : 'No'}</div>
                </div>
                {getStats.compressionRatio && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Size Ratio:</span>
                    <div className="font-mono font-medium">{getStats.compressionRatio}x</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Base64 Image Encoding
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Base64 encoding increases file size by approximately 33%</li>
              <li>• Useful for embedding images directly in HTML, CSS, or JSON</li>
              <li>• Data URLs include MIME type: data:image/png;base64,...</li>
              <li>• Eliminates need for separate image files and HTTP requests</li>
              <li>• Best for small images, icons, and inline graphics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageBase64Tool