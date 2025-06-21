import { useState, useCallback } from 'react'

type CaseType = 'lowercase' | 'uppercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot' | 'path' | 'inverse'

const TextCaseTool = () => {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Convert to different cases
  const convertCase = useCallback((text: string, caseType: CaseType): string => {
    if (!text) return ''

    switch (caseType) {
      case 'lowercase':
        return text.toLowerCase()
      
      case 'uppercase':
        return text.toUpperCase()
      
      case 'title':
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
      
      case 'sentence':
        return text.toLowerCase().replace(/^\w/, char => char.toUpperCase())
      
      case 'camel':
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[A-Z]/, char => char.toLowerCase())
      
      case 'pascal':
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[a-z]/, char => char.toUpperCase())
      
      case 'snake':
        return text
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
      
      case 'kebab':
        return text
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      
      case 'constant':
        return text
          .trim()
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
      
      case 'dot':
        return text
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '.')
          .replace(/^\.+|\.+$/g, '')
      
      case 'path':
        return text
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '/')
          .replace(/^\/+|\/+$/g, '')
      
      case 'inverse':
        return text.split('').map(char => {
          if (char === char.toLowerCase()) {
            return char.toUpperCase()
          } else if (char === char.toUpperCase()) {
            return char.toLowerCase()
          }
          return char
        }).join('')
      
      default:
        return text
    }
  }, [])

  // Copy to clipboard
  const copyToClipboard = async (text: string, caseType: CaseType) => {
    if (!text) return
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(caseType)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Clear input
  const clearInput = () => {
    setInput('')
    setCopied(null)
  }

  // Get stats
  const getStats = () => {
    if (!input) return null
    
    const words = input.trim().split(/\s+/).filter(word => word.length > 0)
    const chars = input.length
    const charsNoSpaces = input.replace(/\s/g, '').length
    const lines = input.split('\n').length
    
    return {
      words: words.length,
      chars,
      charsNoSpaces,
      lines
    }
  }

  const stats = getStats()

  const caseTypes: { type: CaseType; name: string; description: string; example: string }[] = [
    { type: 'lowercase', name: 'lowercase', description: 'All characters in lowercase', example: 'hello world' },
    { type: 'uppercase', name: 'UPPERCASE', description: 'All characters in uppercase', example: 'HELLO WORLD' },
    { type: 'title', name: 'Title Case', description: 'First letter of each word capitalized', example: 'Hello World' },
    { type: 'sentence', name: 'Sentence case', description: 'Only first letter capitalized', example: 'Hello world' },
    { type: 'camel', name: 'camelCase', description: 'First word lowercase, subsequent words capitalized', example: 'helloWorld' },
    { type: 'pascal', name: 'PascalCase', description: 'All words capitalized, no spaces', example: 'HelloWorld' },
    { type: 'snake', name: 'snake_case', description: 'Words separated by underscores', example: 'hello_world' },
    { type: 'kebab', name: 'kebab-case', description: 'Words separated by hyphens', example: 'hello-world' },
    { type: 'constant', name: 'CONSTANT_CASE', description: 'Uppercase with underscores', example: 'HELLO_WORLD' },
    { type: 'dot', name: 'dot.case', description: 'Words separated by dots', example: 'hello.world' },
    { type: 'path', name: 'path/case', description: 'Words separated by forward slashes', example: 'hello/world' },
    { type: 'inverse', name: 'iNVERSE cASE', description: 'Inverts the case of each character', example: 'hELLO wORLD' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Text Case Converter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert text between different case formats commonly used in programming and writing.
          </p>

          {/* Input Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text to Convert
              </label>
              <button
                onClick={clearInput}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter text to convert between different cases..."
            />
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Text Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                  <div className="font-mono font-medium">{stats.chars}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">No Spaces:</span>
                  <div className="font-mono font-medium">{stats.charsNoSpaces}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Words:</span>
                  <div className="font-mono font-medium">{stats.words}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Lines:</span>
                  <div className="font-mono font-medium">{stats.lines}</div>
                </div>
              </div>
            </div>
          )}

          {/* Case Conversions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseTypes.map((caseType) => {
              const convertedText = convertCase(input, caseType.type)
              const isCopied = copied === caseType.type
              
              return (
                <div
                  key={caseType.type}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {caseType.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {caseType.description}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                        {caseType.example}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(convertedText, caseType.type)}
                      disabled={!convertedText}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2 min-h-[3rem] max-h-24 overflow-y-auto">
                    <div className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                      {convertedText || (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          Converted text will appear here...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Examples */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => setInput('Hello World Example')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Simple Text</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Hello World Example
                </div>
              </button>
              
              <button
                onClick={() => setInput('user name field')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Variable Name</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  user name field
                </div>
              </button>

              <button
                onClick={() => setInput('API Response Handler')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Function Name</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  API Response Handler
                </div>
              </button>

              <button
                onClick={() => setInput('DATABASE CONNECTION STRING')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Constant</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  DATABASE CONNECTION STRING
                </div>
              </button>

              <button
                onClick={() => setInput('this is a long sentence that needs proper formatting')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Long Text</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  this is a long sentence...
                </div>
              </button>

              <button
                onClick={() => setInput('multi\nline\ntext\nexample')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Multi-line</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  multi\nline\ntext\nexample
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Common Use Cases
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>camelCase:</strong> JavaScript variables and functions</li>
              <li>• <strong>PascalCase:</strong> Class names and components</li>
              <li>• <strong>snake_case:</strong> Python variables and database columns</li>
              <li>• <strong>kebab-case:</strong> CSS classes and URL slugs</li>
              <li>• <strong>CONSTANT_CASE:</strong> Environment variables and constants</li>
              <li>• <strong>Title Case:</strong> Headings and proper nouns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextCaseTool