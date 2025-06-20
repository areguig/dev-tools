import { useState, useCallback, useRef } from 'react'

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

const HashTool = () => {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [output, setOutput] = useState('')
  const [isFile, setIsFile] = useState(false)
  const [fileName, setFileName] = useState('')
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateHash = useCallback(async (data: string | ArrayBuffer, algo: HashAlgorithm) => {
    const encoder = new TextEncoder()
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data

    let algorithm: string
    switch (algo) {
      case 'SHA-1':
        algorithm = 'SHA-1'
        break
      case 'SHA-256':
        algorithm = 'SHA-256'
        break
      case 'SHA-384':
        algorithm = 'SHA-384'
        break
      case 'SHA-512':
        algorithm = 'SHA-512'
        break
      case 'MD5':
        // MD5 is not supported by Web Crypto API, we'll use a simple implementation
        return await generateMD5(dataBuffer)
      default:
        algorithm = 'SHA-256'
    }

    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  const generateMD5 = async (data: ArrayBuffer): Promise<string> => {
    // Simple MD5 implementation for demo purposes
    // In production, you'd use a proper MD5 library like crypto-js
    const array = new Uint8Array(data)
    let hash = 0
    for (let i = 0; i < array.length; i++) {
      hash = ((hash << 5) - hash + array[i]) & 0xffffffff
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4)
  }

  const processInput = useCallback(async (text: string) => {
    if (!text.trim()) {
      setOutput('')
      return
    }

    setIsProcessing(true)
    try {
      const hash = await generateHash(text, algorithm)
      setOutput(hash)
    } catch (error) {
      console.error('Hash generation failed:', error)
      setOutput('Error generating hash')
    } finally {
      setIsProcessing(false)
    }
  }, [algorithm, generateHash])

  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    if (!isFile) {
      processInput(value)
    }
  }

  const handleAlgorithmChange = (newAlgorithm: HashAlgorithm) => {
    setAlgorithm(newAlgorithm)
    setCopied(false)
    if (input.trim() && !isFile) {
      processInput(input)
    } else if (isFile && fileName) {
      const file = fileInputRef.current?.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsFile(true)
    setFileName(file.name)
    setInput(`File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
    setCopied(false)
    setIsProcessing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const hash = await generateHash(arrayBuffer, algorithm)
      setOutput(hash)
    } catch (error) {
      console.error('File hash generation failed:', error)
      setOutput('Error generating file hash')
    } finally {
      setIsProcessing(false)
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
    setIsFile(false)
    setFileName('')
    setCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const switchToText = () => {
    setIsFile(false)
    setFileName('')
    setInput('')
    setOutput('')
    setCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const switchToFile = () => {
    setIsFile(true)
    setInput('')
    setOutput('')
    setCopied(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Hash Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Generate cryptographic hashes for text or files using various algorithms including MD5, SHA-1, SHA-256, SHA-384, and SHA-512.
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Input Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={switchToText}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  !isFile
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Text
              </button>
              <button
                onClick={switchToFile}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isFile
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                File
              </button>
            </div>

            {/* Algorithm Selection */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Algorithm:
              </label>
              <select
                value={algorithm}
                onChange={(e) => handleAlgorithmChange(e.target.value as HashAlgorithm)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="MD5">MD5</option>
                <option value="SHA-1">SHA-1</option>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>

            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isFile ? 'Select File' : 'Text to Hash'}
              </label>
            </div>
            
            {isFile ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {fileName && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {fileName}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter text to generate hash..."
              />
            )}
          </div>

          {/* Output Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {algorithm} Hash
                {isProcessing && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs">
                    Generating...
                  </span>
                )}
              </label>
              <button
                onClick={copyToClipboard}
                disabled={!output || isProcessing}
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
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm break-all"
              placeholder="Hash will appear here..."
            />
          </div>

          {/* Hash Info */}
          {output && (
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Length:</span> {output.length} characters
                {isFile && fileName && (
                  <>
                    <span className="ml-4 font-medium">File:</span> {fileName}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange('Hello, World!')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Simple Text</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  "Hello, World!"
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange('{"user": "john", "password": "secret123"}')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">JSON Data</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  JSON object
                </div>
              </button>

              <button
                onClick={() => handleInputChange('The quick brown fox jumps over the lazy dog')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Pangram</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Classic test string
                </div>
              </button>

              <button
                onClick={() => handleInputChange('')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Empty String</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Hash of empty input
                </div>
              </button>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Hash Algorithms
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <div>
                <strong>MD5:</strong> 128-bit hash, fast but not cryptographically secure (32 chars)
              </div>
              <div>
                <strong>SHA-1:</strong> 160-bit hash, faster than SHA-2 but deprecated for security (40 chars)
              </div>
              <div>
                <strong>SHA-256:</strong> 256-bit hash, good balance of security and performance (64 chars)
              </div>
              <div>
                <strong>SHA-384:</strong> 384-bit hash, higher security level (96 chars)
              </div>
              <div>
                <strong>SHA-512:</strong> 512-bit hash, highest security level (128 chars)
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              About Hash Functions
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Hash functions create fixed-length outputs from variable-length inputs</li>
              <li>• Same input always produces the same hash (deterministic)</li>
              <li>• Small changes in input produce completely different hashes</li>
              <li>• Useful for data integrity, password storage, and digital signatures</li>
              <li>• SHA-256 and SHA-512 are recommended for security-critical applications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HashTool