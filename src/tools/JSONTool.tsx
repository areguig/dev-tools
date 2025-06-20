import { useState, useCallback } from 'react'

const JSONTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indentSize, setIndentSize] = useState(2)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJSON = useCallback((text: string, indent: number) => {
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed, null, indent)
    } catch (err) {
      throw new Error('Invalid JSON syntax')
    }
  }, [])

  const minifyJSON = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed)
    } catch (err) {
      throw new Error('Invalid JSON syntax')
    }
  }, [])

  const processJSON = useCallback((text: string) => {
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      if (mode === 'format') {
        const formatted = formatJSON(text, indentSize)
        setOutput(formatted)
      } else {
        const minified = minifyJSON(text)
        setOutput(minified)
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process JSON')
      setOutput('')
    }
  }, [mode, indentSize, formatJSON, minifyJSON])

  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    processJSON(value)
  }

  const handleModeChange = (newMode: 'format' | 'minify') => {
    setMode(newMode)
    setCopied(false)
    if (input.trim()) {
      processJSON(input)
    }
  }

  const handleIndentChange = (newIndent: number) => {
    setIndentSize(newIndent)
    setCopied(false)
    if (input.trim() && mode === 'format') {
      processJSON(input)
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

  const validateJSON = (text: string) => {
    if (!text.trim()) return null
    
    try {
      JSON.parse(text)
      return { valid: true, size: new Blob([text]).size }
    } catch (err) {
      return { valid: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
    }
  }

  const jsonStatus = validateJSON(input)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          JSON Formatter & Validator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Format, minify, and validate JSON data. Check syntax and make your JSON readable.
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleModeChange('format')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'format'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Format
              </button>
              <button
                onClick={() => handleModeChange('minify')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'minify'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Minify
              </button>
            </div>

            {/* Indent Size */}
            {mode === 'format' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Indent:
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => handleIndentChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
            )}

            {/* JSON Status */}
            {jsonStatus && (
              <div className={`px-3 py-1 rounded-md text-sm ${
                jsonStatus.valid
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {jsonStatus.valid 
                  ? `Valid JSON (${jsonStatus.size} bytes)` 
                  : 'Invalid JSON'
                }
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Input JSON
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
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Paste your JSON here..."
              />
            </div>

            {/* Output Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'format' ? 'Formatted' : 'Minified'} JSON
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
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder={`${mode === 'format' ? 'Formatted' : 'Minified'} JSON will appear here...`}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange('{"name":"John","age":30,"city":"New York"}')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Simple Object</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {"{"}"name":"John","age":30{"}"}
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange('[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Array of Objects</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  [{"{"}"id":1,"name":"Alice"{"}"}...]
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About JSON
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• JSON (JavaScript Object Notation) is a lightweight data format</li>
              <li>• Supports strings, numbers, booleans, arrays, objects, and null</li>
              <li>• Use formatting to make JSON readable, minifying to reduce size</li>
              <li>• All string keys and values must be in double quotes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JSONTool