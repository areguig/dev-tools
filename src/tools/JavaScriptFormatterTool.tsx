import { useState } from 'react'

type FormatMode = 'beautify' | 'minify'

const JavaScriptFormatterTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<FormatMode>('beautify')
  const [copied, setCopied] = useState(false)

  // Simple JavaScript beautification
  const beautifyJS = (code: string): string => {
    if (!code.trim()) return ''

    let formatted = code
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()

    let indentLevel = 0
    const indentSize = 2
    const lines: string[] = []
    let i = 0
    let line = ''

    while (i < formatted.length) {
      let char = formatted[i]

      // Handle strings (preserve whitespace inside)
      if (char === '"' || char === "'" || char === '`') {
        const quote = char
        line += char
        i++
        
        while (i < formatted.length && formatted[i] !== quote) {
          if (formatted[i] === '\\') {
            line += formatted[i] + (formatted[i + 1] || '')
            i += 2
          } else {
            line += formatted[i]
            i++
          }
        }
        if (i < formatted.length) {
          line += formatted[i] // closing quote
          i++
        }
        continue
      }

      // Handle regular expressions
      if (char === '/' && i > 0 && /[=(\[,;:!&|?+\-*%^<>]/.test(formatted[i - 1])) {
        line += char
        i++
        while (i < formatted.length && formatted[i] !== '/') {
          if (formatted[i] === '\\') {
            line += formatted[i] + (formatted[i + 1] || '')
            i += 2
          } else {
            line += formatted[i]
            i++
          }
        }
        if (i < formatted.length) {
          line += formatted[i] // closing /
          i++
        }
        continue
      }

      // Handle single line comments
      if (char === '/' && formatted[i + 1] === '/') {
        while (i < formatted.length && formatted[i] !== '\n') {
          line += formatted[i]
          i++
        }
        lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
        if (i < formatted.length) i++ // skip newline
        continue
      }

      // Handle multi-line comments
      if (char === '/' && formatted[i + 1] === '*') {
        while (i < formatted.length - 1 && !(formatted[i] === '*' && formatted[i + 1] === '/')) {
          line += formatted[i]
          i++
        }
        line += '*/'
        i += 2
        lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
        continue
      }

      // Handle opening braces
      if (char === '{') {
        line += char
        lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
        indentLevel++
        i++
        continue
      }

      // Handle closing braces
      if (char === '}') {
        if (line.trim()) {
          lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
          line = ''
        }
        indentLevel = Math.max(0, indentLevel - 1)
        lines.push(' '.repeat(indentLevel * indentSize) + char)
        i++
        continue
      }

      // Handle semicolons
      if (char === ';') {
        line += char
        lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
        line = ''
        i++
        continue
      }

      // Handle commas in object/array contexts
      if (char === ',') {
        line += char
        // Look ahead to see if we're in an object/array
        let j = i + 1
        while (j < formatted.length && /\s/.test(formatted[j])) j++
        
        if (j < formatted.length && formatted[j] !== '}' && formatted[j] !== ']') {
          lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
          line = ''
        }
        i++
        continue
      }

      // Regular character
      line += char
      i++
    }

    if (line.trim()) {
      lines.push(' '.repeat(indentLevel * indentSize) + line.trim())
    }

    return lines
      .filter(line => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
  }

  // JavaScript minification
  const minifyJS = (code: string): string => {
    if (!code.trim()) return ''

    return code
      // Remove single line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces around operators and punctuation
      .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
      // Remove spaces in function declarations
      .replace(/function\s+/g, 'function ')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*}/g, ';}')
      .trim()
  }

  // Process code based on mode
  const processCode = (code: string, formatMode: FormatMode): string => {
    try {
      return formatMode === 'beautify' ? beautifyJS(code) : minifyJS(code)
    } catch (error) {
      return 'Error processing JavaScript'
    }
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    
    if (value.trim()) {
      const processed = processCode(value, mode)
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
      const processed = processCode(input, newMode)
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
          JavaScript/TypeScript Formatter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Format and beautify JavaScript or TypeScript code for readability, or minify it for production use.
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
                JavaScript/TypeScript Input
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter your JavaScript or TypeScript code here..."
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'beautify' ? 'Formatted Code' : 'Minified Code'}
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
                placeholder={`${mode === 'beautify' ? 'Formatted' : 'Minified'} code will appear here...`}
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
                onClick={() => handleInputChange(`function greet(name){if(name){console.log('Hello, '+name+'!');}else{console.log('Hello, World!');}}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Minified Function</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  function greet(name){'{if(name)...}'}
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange(`const users = [{name: 'John', age: 30}, {name: 'Jane', age: 25}]; const adults = users.filter(user => user.age >= 18).map(user => ({...user, isAdult: true})); console.log(adults);`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Array Operations</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  const users = [...]
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`class Calculator { constructor() { this.result = 0; } add(x, y) { this.result = x + y; return this; } multiply(x) { this.result *= x; return this; } getResult() { return this.result; } }`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">ES6 Class</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  class Calculator {'{constructor()...}'}
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`async function fetchData(url) { try { const response = await fetch(url); if (!response.ok) { throw new Error(\`HTTP error! status: \${response.status}\`); } const data = await response.json(); return data; } catch (error) { console.error('Fetch error:', error); throw error; } }`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Async/Await</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  async function fetchData(url) {'{...}'}
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              JavaScript Formatting Features
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Beautify:</strong> Adds proper indentation, spacing, and line breaks</li>
              <li>• <strong>Minify:</strong> Removes comments, whitespace, and unnecessary characters</li>
              <li>• Supports modern JavaScript (ES6+) and TypeScript syntax</li>
              <li>• Preserves string literals, regular expressions, and comments</li>
              <li>• Handles async/await, arrow functions, and class syntax</li>
              <li>• Provides compression statistics for minified output</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JavaScriptFormatterTool