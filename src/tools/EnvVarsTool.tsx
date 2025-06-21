import { useState } from 'react'

type OutputFormat = 'env' | 'json' | 'yaml' | 'docker' | 'shell' | 'javascript'

interface EnvVar {
  key: string
  value: string
  comment?: string
}

const EnvVarsTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse .env format
  const parseEnvFormat = (text: string): EnvVar[] => {
    const vars: EnvVar[] = []
    const lines = text.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue
      
      // Extract comment if present
      const commentMatch = trimmed.match(/^([^#]+)#(.*)$/)
      const envLine = commentMatch ? commentMatch[1].trim() : trimmed
      const comment = commentMatch ? commentMatch[2].trim() : undefined
      
      // Parse key=value
      const equalIndex = envLine.indexOf('=')
      if (equalIndex === -1) continue
      
      const key = envLine.substring(0, equalIndex).trim()
      let value = envLine.substring(equalIndex + 1).trim()
      
      // Handle quoted values
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      vars.push({ key, value, comment })
    }
    
    return vars
  }

  // Parse JSON format
  const parseJsonFormat = (text: string): EnvVar[] => {
    try {
      const obj = JSON.parse(text)
      return Object.entries(obj).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    } catch {
      throw new Error('Invalid JSON format')
    }
  }

  // Parse YAML-like format (simple key: value)
  const parseYamlFormat = (text: string): EnvVar[] => {
    const vars: EnvVar[] = []
    const lines = text.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue
      
      const key = trimmed.substring(0, colonIndex).trim()
      let value = trimmed.substring(colonIndex + 1).trim()
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      vars.push({ key, value })
    }
    
    return vars
  }

  // Auto-detect input format and parse
  const parseInput = (text: string): EnvVar[] => {
    if (!text.trim()) return []
    
    // Try JSON first
    if (text.trim().startsWith('{')) {
      try {
        return parseJsonFormat(text)
      } catch {
        // Fall through to other formats
      }
    }
    
    // Check if it looks like YAML (contains colons without equals)
    if (text.includes(':') && !text.includes('=')) {
      try {
        return parseYamlFormat(text)
      } catch {
        // Fall through to env format
      }
    }
    
    // Default to .env format
    return parseEnvFormat(text)
  }

  // Convert to different formats
  const convertToFormat = (vars: EnvVar[], format: OutputFormat): string => {
    switch (format) {
      case 'env':
        return vars.map(v => {
          const needsQuotes = v.value.includes(' ') || v.value.includes('"') || v.value.includes("'")
          const value = needsQuotes ? `"${v.value.replace(/"/g, '\\"')}"` : v.value
          const comment = v.comment ? ` # ${v.comment}` : ''
          return `${v.key}=${value}${comment}`
        }).join('\n')
      
      case 'json':
        const jsonObj = vars.reduce((acc, v) => {
          acc[v.key] = v.value
          return acc
        }, {} as Record<string, string>)
        return JSON.stringify(jsonObj, null, 2)
      
      case 'yaml':
        return vars.map(v => {
          const needsQuotes = v.value.includes(':') || v.value.includes('#') || v.value.includes('\n')
          const value = needsQuotes ? `"${v.value.replace(/"/g, '\\"')}"` : v.value
          const comment = v.comment ? ` # ${v.comment}` : ''
          return `${v.key}: ${value}${comment}`
        }).join('\n')
      
      case 'docker':
        const envVars = vars.map(v => `${v.key}=${v.value}`).join(' \\\n    ')
        return `ENV ${envVars}`
      
      case 'shell':
        return vars.map(v => {
          const needsQuotes = v.value.includes(' ') || v.value.includes('"') || v.value.includes("'") || v.value.includes('$')
          const value = needsQuotes ? `"${v.value.replace(/"/g, '\\"')}"` : v.value
          const comment = v.comment ? ` # ${v.comment}` : ''
          return `export ${v.key}=${value}${comment}`
        }).join('\n')
      
      case 'javascript':
        const lines = vars.map(v => {
          const comment = v.comment ? ` // ${v.comment}` : ''
          return `  ${v.key}: '${v.value.replace(/'/g, "\\'")}',${comment}`
        })
        return `const config = {\n${lines.join('\n')}\n};`
      
      default:
        return ''
    }
  }

  // Process input
  const processInput = (text: string) => {
    setInput(text)
    setCopied(false)
    setError(null)
    
    if (!text.trim()) {
      setOutput('')
      return
    }
    
    try {
      const vars = parseInput(text)
      const converted = convertToFormat(vars, outputFormat)
      setOutput(converted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse input')
      setOutput('')
    }
  }

  // Handle format change
  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format)
    setCopied(false)
    
    if (input.trim()) {
      try {
        const vars = parseInput(input)
        const converted = convertToFormat(vars, format)
        setOutput(converted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to convert format')
      }
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
    setError(null)
    setCopied(false)
  }

  // Get statistics
  const getStats = () => {
    if (!input) return null
    
    try {
      const vars = parseInput(input)
      const totalVars = vars.length
      const withComments = vars.filter(v => v.comment).length
      const uniqueKeys = new Set(vars.map(v => v.key)).size
      const avgValueLength = vars.length > 0 ? Math.round(vars.reduce((sum, v) => sum + v.value.length, 0) / vars.length) : 0
      
      return {
        totalVars,
        withComments,
        uniqueKeys,
        avgValueLength,
        duplicateKeys: totalVars - uniqueKeys
      }
    } catch {
      return null
    }
  }

  const stats = getStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Environment Variables Manager
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert environment variables between different formats: .env, JSON, YAML, Docker, Shell scripts, and JavaScript.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Output Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => handleFormatChange(e.target.value as OutputFormat)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="env">.env File</option>
                <option value="json">JSON Object</option>
                <option value="yaml">YAML</option>
                <option value="docker">Dockerfile ENV</option>
                <option value="shell">Shell Script</option>
                <option value="javascript">JavaScript Object</option>
              </select>
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
                Environment Variables Input
              </label>
              <textarea
                value={input}
                onChange={(e) => processInput(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Paste your environment variables here...
Supports .env, JSON, and YAML formats"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Auto-detects format: .env (KEY=value), JSON, or YAML
              </p>
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Converted Output ({outputFormat.toUpperCase()})
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
                placeholder="Converted environment variables will appear here..."
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Variables:</span>
                  <div className="font-mono font-medium">{stats.totalVars}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Unique Keys:</span>
                  <div className="font-mono font-medium">{stats.uniqueKeys}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">With Comments:</span>
                  <div className="font-mono font-medium">{stats.withComments}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Value Length:</span>
                  <div className="font-mono font-medium">{stats.avgValueLength}</div>
                </div>
                {stats.duplicateKeys > 0 && (
                  <div>
                    <span className="text-red-600 dark:text-red-400">Duplicate Keys:</span>
                    <div className="font-mono font-medium text-red-600 dark:text-red-400">{stats.duplicateKeys}</div>
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
                onClick={() => processInput(`DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=abc123def456
DEBUG=true
PORT=3000
APP_NAME="My Application"`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">.env Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  DATABASE_URL=postgresql://...
                </div>
              </button>
              
              <button
                onClick={() => processInput(`{
  "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
  "API_KEY": "abc123def456",
  "DEBUG": "true",
  "PORT": "3000",
  "APP_NAME": "My Application"
}`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">JSON Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'{\"DATABASE_URL\": \"postgresql://...\"}'}
                </div>
              </button>

              <button
                onClick={() => processInput(`DATABASE_URL: postgresql://user:pass@localhost:5432/db
API_KEY: abc123def456
DEBUG: true
PORT: 3000
APP_NAME: "My Application"`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">YAML Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  DATABASE_URL: postgresql://...
                </div>
              </button>

              <button
                onClick={() => processInput(`# Database configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/db # Primary database
API_KEY=abc123def456 # External API key
DEBUG=true # Enable debug mode
PORT=3000 # Server port
APP_NAME="My Application" # Application name`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">With Comments</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  # Database configuration...
                </div>
              </button>
            </div>
          </div>

          {/* Format Reference */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Supported Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-medium mb-2">Input Formats:</h4>
                <ul className="space-y-1">
                  <li>• <strong>.env:</strong> KEY=value</li>
                  <li>• <strong>JSON:</strong> {"{"}"key": "value"{"}"}</li>
                  <li>• <strong>YAML:</strong> key: value</li>
                  <li>• Comments supported in .env</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Output Formats:</h4>
                <ul className="space-y-1">
                  <li>• <strong>.env:</strong> Standard environment file</li>
                  <li>• <strong>JSON:</strong> Configuration object</li>
                  <li>• <strong>YAML:</strong> YAML configuration</li>
                  <li>• <strong>Docker:</strong> ENV instructions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Cases:</h4>
                <ul className="space-y-1">
                  <li>• Convert .env to JSON config</li>
                  <li>• Generate Docker ENV commands</li>
                  <li>• Create shell export scripts</li>
                  <li>• Format for JavaScript imports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvVarsTool