import { useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

interface Header {
  key: string
  value: string
  enabled: boolean
}

interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: string
  duration: number
  size: number
}

const APITestTool = () => {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '', enabled: true }])
  const [body, setBody] = useState('')
  const [bodyType, setBodyType] = useState<'json' | 'text' | 'form'>('json')
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add new header
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  // Remove header
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  // Update header
  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const updatedHeaders = [...headers]
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value }
    setHeaders(updatedHeaders)
  }

  // Get enabled headers as object
  const getEnabledHeaders = (): Record<string, string> => {
    const enabledHeaders: Record<string, string> = {}
    headers.forEach(header => {
      if (header.enabled && header.key.trim() && header.value.trim()) {
        enabledHeaders[header.key.trim()] = header.value.trim()
      }
    })
    return enabledHeaders
  }

  // Send API request
  const sendRequest = async () => {
    if (!url.trim()) {
      setError('URL is required')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    const startTime = Date.now()

    try {
      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          ...getEnabledHeaders(),
          ...(bodyType === 'json' && body.trim() ? { 'Content-Type': 'application/json' } : {}),
          ...(bodyType === 'form' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
        }
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        requestOptions.body = body
      }

      // Make the request
      const response = await fetch(url, requestOptions)
      const duration = Date.now() - startTime

      // Get response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // Get response body
      const responseText = await response.text()
      const size = new Blob([responseText]).size

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseText,
        duration,
        size
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // Format response data
  const formatResponseData = (data: string, contentType?: string): string => {
    try {
      if (contentType?.includes('application/json') || data.trim().startsWith('{') || data.trim().startsWith('[')) {
        return JSON.stringify(JSON.parse(data), null, 2)
      }
    } catch {
      // If JSON parsing fails, return as is
    }
    return data
  }

  // Get status color
  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Copy response to clipboard
  const copyResponse = async () => {
    if (!response?.data) return
    
    try {
      await navigator.clipboard.writeText(response.data)
    } catch (err) {
      console.error('Failed to copy response:', err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          API Testing Tool
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Test REST APIs with custom headers, request bodies, and get detailed response information.
          </p>

          {/* Request Section */}
          <div className="space-y-6 mb-8">
            {/* URL and Method */}
            <div className="flex gap-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={sendRequest}
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Headers */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Headers
                </label>
                <button
                  onClick={addHeader}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Add Header
                </button>
              </div>
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="Header name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => removeHeader(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Request Body
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBodyType('json')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        bodyType === 'json'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setBodyType('text')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        bodyType === 'text'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => setBodyType('form')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        bodyType === 'form'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Form Data
                    </button>
                  </div>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                  placeholder={
                    bodyType === 'json'
                      ? '{\n  "key": "value"\n}'
                      : bodyType === 'form'
                      ? 'key1=value1&key2=value2'
                      : 'Request body content...'
                  }
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400 font-medium">Error:</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Response Section */}
          {response && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Response</h2>
                <button
                  onClick={copyResponse}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy Response
                </button>
              </div>

              {/* Response Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Status:</span>
                  <div className={`font-bold text-lg ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Duration:</span>
                  <div className="font-mono font-medium">{response.duration}ms</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Size:</span>
                  <div className="font-mono font-medium">{formatSize(response.size)}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Headers Count:</span>
                  <div className="font-mono font-medium">{Object.keys(response.headers).length}</div>
                </div>
              </div>

              {/* Response Headers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Response Headers</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex py-1 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="font-medium text-gray-900 dark:text-white w-1/3 break-all">{key}:</div>
                      <div className="text-gray-600 dark:text-gray-400 w-2/3 break-all font-mono">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Response Body</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words text-gray-900 dark:text-white max-h-96 overflow-y-auto">
                    {formatResponseData(response.data, response.headers['content-type'])}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Sending request...</p>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setUrl('https://jsonplaceholder.typicode.com/posts/1')
                  setMethod('GET')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">GET Request</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  GET https://jsonplaceholder.typicode.com/posts/1
                </div>
              </button>
              
              <button
                onClick={() => {
                  setUrl('https://httpbin.org/post')
                  setMethod('POST')
                  setBodyType('json')
                  setBody('{\n  "title": "Test Post",\n  "body": "This is a test",\n  "userId": 1\n}')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">POST with JSON</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  POST https://httpbin.org/post
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              API Testing Features
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Support for all common HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)</li>
              <li>• Custom headers with enable/disable toggles</li>
              <li>• Request body support with JSON, text, and form data formats</li>
              <li>• Detailed response information including status, headers, and timing</li>
              <li>• Automatic JSON formatting for readable response display</li>
              <li>• Copy response data to clipboard for further analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APITestTool