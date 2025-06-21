import { useState } from 'react'

type FormatMode = 'beautify' | 'minify'

const CSSFormatterTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<FormatMode>('beautify')
  const [copied, setCopied] = useState(false)

  // CSS beautification
  const beautifyCSS = (css: string): string => {
    if (!css.trim()) return ''

    let formatted = css
      // Remove extra whitespace and newlines
      .replace(/\s+/g, ' ')
      .trim()

    // Add newlines after opening braces
    formatted = formatted.replace(/\{/g, ' {\n  ')
    
    // Add newlines after semicolons (but not inside url() or data: URLs)
    formatted = formatted.replace(/;(?![^()]*\))/g, ';\n  ')
    
    // Add newlines before closing braces
    formatted = formatted.replace(/\}/g, '\n}\n\n')
    
    // Handle media queries and at-rules
    formatted = formatted.replace(/@([^{]+)\{/g, '@$1 {\n  ')
    
    // Fix indentation for nested rules
    const lines = formatted.split('\n')
    let indentLevel = 0
    const indentedLines = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      
      // Decrease indent for closing braces
      if (trimmed === '}') {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      const indented = '  '.repeat(indentLevel) + trimmed
      
      // Increase indent after opening braces
      if (trimmed.endsWith('{')) {
        indentLevel++
      }
      
      return indented
    })

    // Clean up extra newlines
    return indentedLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // CSS minification
  const minifyCSS = (css: string): string => {
    if (!css.trim()) return ''

    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces around specific characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Remove quotes from URLs when possible
      .replace(/url\(['"]([^'"()]*)['"]\)/g, 'url($1)')
      // Convert to lowercase for certain properties
      .replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g, (match) => match.toLowerCase())
      // Remove unnecessary zeros
      .replace(/\b0+(\d+)/g, '$1')
      .replace(/\b0*\.(\d+)/g, '.$1')
      .replace(/(^|[^0-9])0px/g, '$10')
      .trim()
  }

  // Process CSS based on mode
  const processCSS = (css: string, formatMode: FormatMode): string => {
    try {
      return formatMode === 'beautify' ? beautifyCSS(css) : minifyCSS(css)
    } catch (error) {
      return 'Error processing CSS'
    }
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    
    if (value.trim()) {
      const processed = processCSS(value, mode)
      setOutput(processed)
    } else {
      setOutput('')
    }
  }

  // Handle mode change
  const handleModeChange = (newMode: FormatMode) => {
    setMode(newMode)
    setCopied(false)
    
    if (input.trim()) {
      const processed = processCSS(input, newMode)
      setOutput(processed)
    }
  }

  // Copy to clipboard
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

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
    setCopied(false)
  }

  // Get statistics
  const getStats = () => {
    if (!input || !output) return null
    
    const inputSize = new Blob([input]).size
    const outputSize = new Blob([output]).size
    const inputLines = input.split('\n').length
    const outputLines = output.split('\n').length
    const compressionRatio = inputSize > 0 ? ((inputSize - outputSize) / inputSize * 100).toFixed(1) : '0'
    
    return {
      inputSize,
      outputSize,
      inputLines,
      outputLines,
      compressionRatio: mode === 'minify' ? compressionRatio : null
    }
  }

  const stats = getStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          CSS Formatter & Minifier
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Format and beautify CSS code for readability, or minify it for production use.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleModeChange('beautify')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'beautify'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Beautify
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

            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>
          </div>

          {/* Input/Output Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CSS Input
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter your CSS code here..."
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'beautify' ? 'Formatted CSS' : 'Minified CSS'}
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
                placeholder={`${mode === 'beautify' ? 'Formatted' : 'Minified'} CSS will appear here...`}
              />
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Input Size:</span>
                  <div className="font-mono font-medium">{stats.inputSize} bytes</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Output Size:</span>
                  <div className="font-mono font-medium">{stats.outputSize} bytes</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Input Lines:</span>
                  <div className="font-mono font-medium">{stats.inputLines}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Output Lines:</span>
                  <div className="font-mono font-medium">{stats.outputLines}</div>
                </div>
                {stats.compressionRatio && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Compression:</span>
                    <div className="font-mono font-medium">{stats.compressionRatio}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange(`body{margin:0;padding:0;font-family:Arial,sans-serif}h1,h2{color:#333;margin-bottom:10px}.container{max-width:1200px;margin:0 auto;padding:20px}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Minified CSS</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  body{'{margin:0;padding:0;...}'}
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange(`.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Modern CSS</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  .hero {'{background: linear-gradient...}'}
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .hero {
    height: 60vh;
  }
  
  .card {
    margin: 1rem;
    padding: 1rem;
  }
}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Media Query</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  @media (max-width: 768px) {'{...}'}
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --text-color: #2c3e50;
  --bg-color: #ecf0f1;
}

.button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.button:hover {
  background: var(--secondary-color);
}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">CSS Variables</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  :root {'{--primary-color: #3498db;...}'}
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              CSS Formatting Features
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Beautify:</strong> Adds proper indentation, spacing, and line breaks for readability</li>
              <li>• <strong>Minify:</strong> Removes comments, whitespace, and unnecessary characters to reduce file size</li>
              <li>• Preserves CSS functionality while improving code organization</li>
              <li>• Handles media queries, CSS variables, and modern CSS features</li>
              <li>• Provides compression statistics for minified output</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSSFormatterTool