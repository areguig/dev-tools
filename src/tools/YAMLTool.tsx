import { useState, useCallback } from 'react'
import yaml from 'js-yaml'

interface YAMLError {
  message: string
  line?: number
  column?: number
  position?: number
}

const YAMLTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<YAMLError | null>(null)
  const [mode, setMode] = useState<'validate' | 'convert'>('validate')
  const [copied, setCopied] = useState(false)

  const validateYAML = useCallback((yamlString: string) => {
    if (!yamlString.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      const parsed = yaml.load(yamlString)
      
      if (mode === 'validate') {
        setOutput('✅ Valid YAML')
        setError(null)
      } else {
        // Convert to JSON
        setOutput(JSON.stringify(parsed, null, 2))
        setError(null)
      }
    } catch (err) {
      if (err instanceof yaml.YAMLException) {
        const yamlError: YAMLError = {
          message: err.message,
          line: err.mark?.line !== undefined ? err.mark.line + 1 : undefined,
          column: err.mark?.column !== undefined ? err.mark.column + 1 : undefined,
          position: err.mark?.position
        }
        setError(yamlError)
        setOutput('')
      } else {
        setError({
          message: err instanceof Error ? err.message : 'Unknown error occurred'
        })
        setOutput('')
      }
    }
  }, [mode])

  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    validateYAML(value)
  }

  const handleModeChange = (newMode: 'validate' | 'convert') => {
    setMode(newMode)
    setCopied(false)
    if (input.trim()) {
      validateYAML(input)
    }
  }

  const copyToClipboard = async () => {
    if (!output || output === '✅ Valid YAML') return
    
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
    setError(null)
    setCopied(false)
  }

  const getLineNumbersArray = (text: string) => {
    return text.split('\n').map((_, index) => index + 1)
  }

  const highlightErrorLine = (text: string, errorLine?: number) => {
    if (!errorLine) return text
    
    const lines = text.split('\n')
    return lines.map((line, index) => {
      const lineNumber = index + 1
      if (lineNumber === errorLine) {
        return `>>> ${line} <<<`
      }
      return line
    }).join('\n')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          YAML Validator & Converter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Validate YAML syntax and convert YAML to JSON. Get detailed error information with line numbers.
          </p>
          
          {/* Mode Toggle */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleModeChange('validate')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'validate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Validate
            </button>
            <button
              onClick={() => handleModeChange('convert')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'convert'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Convert to JSON
            </button>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  YAML Input
                </label>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                  placeholder="Enter your YAML here..."
                />
                {/* Line numbers overlay */}
                <div className="absolute left-0 top-0 w-10 h-96 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600 rounded-l-md pointer-events-none">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono leading-5 p-2">
                    {getLineNumbersArray(input || '\n').map(num => (
                      <div key={num} className={error?.line === num ? 'text-red-600 font-bold' : ''}>
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'validate' ? 'Validation Result' : 'JSON Output'}
                </label>
                {mode === 'convert' && output && output !== '✅ Valid YAML' && (
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
                )}
              </div>
              <textarea
                value={output}
                readOnly
                className={`w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm resize-none font-mono text-sm ${
                  output === '✅ Valid YAML' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-center flex items-center justify-center text-lg' 
                    : 'bg-gray-50 dark:bg-gray-900 dark:text-white'
                }`}
                placeholder={mode === 'validate' ? 'Validation results will appear here...' : 'JSON output will appear here...'}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">YAML Syntax Error</h3>
              <p className="text-red-700 dark:text-red-300 mb-2">{error.message}</p>
              {error.line && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  <strong>Line {error.line}</strong>
                  {error.column && `, Column ${error.column}`}
                </p>
              )}
              {error.line && input && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded border">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">Error location:</p>
                  <pre className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                    {highlightErrorLine(input, error.line)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange(`name: John Doe
age: 30
email: john@example.com
active: true`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Simple Object</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  name: John Doe<br />age: 30
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange(`users:
  - name: Alice
    role: admin
    permissions:
      - read
      - write
  - name: Bob
    role: user
    permissions:
      - read`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Nested Arrays</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  users:<br />  - name: Alice<br />    permissions: [...]
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About YAML
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• YAML (YAML Ain't Markup Language) is a human-readable data format</li>
              <li>• Uses indentation to represent structure (spaces, not tabs)</li>
              <li>• Supports strings, numbers, booleans, arrays, and objects</li>
              <li>• Commonly used for configuration files and data exchange</li>
              <li>• Use colons for key-value pairs and hyphens for list items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YAMLTool