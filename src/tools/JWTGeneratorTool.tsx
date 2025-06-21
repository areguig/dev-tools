import { useState } from 'react'

interface JWTHeader {
  alg: string
  typ: string
}

interface JWTPayload {
  [key: string]: any
}

const JWTGeneratorTool = () => {
  const [algorithm, setAlgorithm] = useState('HS256')
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [payload, setPayload] = useState(`{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": ${Math.floor(Date.now() / 1000)},
  "exp": ${Math.floor(Date.now() / 1000) + 3600}
}`)
  const [generatedToken, setGeneratedToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Base64 URL encode (RFC 4648)
  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Simple HMAC-SHA256 implementation (for demo purposes)
  const hmacSha256 = async (message: string, secret: string): Promise<string> => {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
  }

  // Generate JWT token
  const generateJWT = async () => {
    setError(null)
    
    try {
      // Parse payload JSON
      let payloadObj: JWTPayload
      try {
        payloadObj = JSON.parse(payload)
      } catch (err) {
        setError('Invalid JSON in payload')
        return
      }

      // Create header
      const header: JWTHeader = {
        alg: algorithm,
        typ: 'JWT'
      }

      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header))
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj))
      
      // Create signature
      const message = `${encodedHeader}.${encodedPayload}`
      let signature = ''
      
      if (algorithm === 'HS256') {
        signature = await hmacSha256(message, secret)
      } else {
        // For other algorithms, we'll create a mock signature for demo
        signature = base64UrlEncode(`mock-signature-${algorithm}`)
      }
      
      // Combine all parts
      const token = `${encodedHeader}.${encodedPayload}.${signature}`
      setGeneratedToken(token)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate JWT')
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!generatedToken) return
    
    try {
      await navigator.clipboard.writeText(generatedToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Clear all
  const clearAll = () => {
    setPayload(`{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": ${Math.floor(Date.now() / 1000)},
  "exp": ${Math.floor(Date.now() / 1000) + 3600}
}`)
    setSecret('your-256-bit-secret')
    setGeneratedToken('')
    setError(null)
    setCopied(false)
  }

  // Add common claims
  const addClaim = (claimType: string) => {
    try {
      const payloadObj = JSON.parse(payload)
      const now = Math.floor(Date.now() / 1000)
      
      switch (claimType) {
        case 'iat':
          payloadObj.iat = now
          break
        case 'exp':
          payloadObj.exp = now + 3600 // 1 hour
          break
        case 'nbf':
          payloadObj.nbf = now
          break
        case 'iss':
          payloadObj.iss = 'https://your-domain.com'
          break
        case 'aud':
          payloadObj.aud = 'your-audience'
          break
        case 'jti':
          payloadObj.jti = crypto.randomUUID()
          break
      }
      
      setPayload(JSON.stringify(payloadObj, null, 2))
    } catch (err) {
      setError('Invalid JSON in payload')
    }
  }

  // Preset templates
  const useTemplate = (templateType: string) => {
    const now = Math.floor(Date.now() / 1000)
    
    let template = {}
    
    switch (templateType) {
      case 'user':
        template = {
          sub: '1234567890',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'user',
          iat: now,
          exp: now + 3600
        }
        break
      case 'admin':
        template = {
          sub: '9876543210',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
          iat: now,
          exp: now + 7200
        }
        break
      case 'api':
        template = {
          iss: 'https://api.example.com',
          sub: 'api-client-123',
          aud: 'https://api.example.com/v1',
          scope: 'read:users write:users',
          iat: now,
          exp: now + 86400 // 24 hours
        }
        break
      case 'refresh':
        template = {
          sub: '1234567890',
          type: 'refresh',
          iat: now,
          exp: now + 2592000 // 30 days
        }
        break
    }
    
    setPayload(JSON.stringify(template, null, 2))
  }

  // Get token parts for display
  const getTokenParts = () => {
    if (!generatedToken) return null
    
    const parts = generatedToken.split('.')
    if (parts.length !== 3) return null
    
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      
      return {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2]
      }
    } catch {
      return null
    }
  }

  const tokenParts = getTokenParts()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          JWT Token Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate JSON Web Tokens with custom payloads and signing algorithms. Perfect for testing APIs and authentication flows.
          </p>

          {/* Template Presets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Templates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => useTemplate('user')}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="font-medium text-blue-900 dark:text-blue-100 text-sm">User Token</div>
                <div className="text-blue-600 dark:text-blue-400 text-xs">Basic user claims</div>
              </button>
              
              <button
                onClick={() => useTemplate('admin')}
                className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="font-medium text-purple-900 dark:text-purple-100 text-sm">Admin Token</div>
                <div className="text-purple-600 dark:text-purple-400 text-xs">With permissions</div>
              </button>
              
              <button
                onClick={() => useTemplate('api')}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="font-medium text-green-900 dark:text-green-100 text-sm">API Token</div>
                <div className="text-green-600 dark:text-green-400 text-xs">Service-to-service</div>
              </button>
              
              <button
                onClick={() => useTemplate('refresh')}
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <div className="font-medium text-orange-900 dark:text-orange-100 text-sm">Refresh Token</div>
                <div className="text-orange-600 dark:text-orange-400 text-xs">Long-lived token</div>
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Algorithm and Secret */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signing Algorithm
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="HS256">HS256 (HMAC SHA-256)</option>
                  <option value="HS384">HS384 (HMAC SHA-384)</option>
                  <option value="HS512">HS512 (HMAC SHA-512)</option>
                  <option value="RS256">RS256 (RSA SHA-256)</option>
                  <option value="ES256">ES256 (ECDSA SHA-256)</option>
                </select>
                {algorithm !== 'HS256' && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ This algorithm uses a mock signature for demo purposes
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="Enter your secret key"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use a strong, random secret for production
                </p>
              </div>

              {/* Quick Claim Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Standard Claims
                </label>
                <div className="flex flex-wrap gap-2">
                  {['iat', 'exp', 'nbf', 'iss', 'aud', 'jti'].map(claim => (
                    <button
                      key={claim}
                      onClick={() => addClaim(claim)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {claim}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payload Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payload (Claims)
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter JWT payload as JSON"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={generateJWT}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Generate JWT
            </button>
            
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Generated Token */}
          {generatedToken && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated JWT Token
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
                <textarea
                  value={generatedToken}
                  readOnly
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm break-all"
                />
              </div>

              {/* Token Parts Display */}
              {tokenParts && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Header</h4>
                    <pre className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-xs overflow-auto max-h-32">
                      {tokenParts.header}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payload</h4>
                    <pre className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-xs overflow-auto max-h-32">
                      {tokenParts.payload}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Signature</h4>
                    <pre className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-xs overflow-auto max-h-32 break-all">
                      {tokenParts.signature}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims Reference */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Standard JWT Claims
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-medium mb-2">Registered Claims:</h4>
                <ul className="space-y-1">
                  <li>• <code>iss</code> - Issuer</li>
                  <li>• <code>sub</code> - Subject</li>
                  <li>• <code>aud</code> - Audience</li>
                  <li>• <code>exp</code> - Expiration Time</li>
                  <li>• <code>nbf</code> - Not Before</li>
                  <li>• <code>iat</code> - Issued At</li>
                  <li>• <code>jti</code> - JWT ID</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security Notes:</h4>
                <ul className="space-y-1">
                  <li>• Always use strong, random secrets</li>
                  <li>• Set appropriate expiration times</li>
                  <li>• Never include sensitive data in payload</li>
                  <li>• Validate tokens on the server side</li>
                  <li>• Use HTTPS for token transmission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JWTGeneratorTool