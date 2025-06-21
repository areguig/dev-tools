import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import ShareWidget from '../components/ShareWidget'
import { useShareTrigger } from '../hooks/useShareTrigger'

interface DecodedToken {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

const JWTTool = () => {
  const [input, setInput] = useState('')
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null)
  
  const { isVisible: shareVisible, hideShare, triggerShare } = useShareTrigger({
    toolName: 'JWT Token Decoder'
  })

  const base64UrlDecode = (str: string): string => {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    try {
      // Decode base64 and handle UTF-8
      const decoded = atob(base64)
      return decodeURIComponent(escape(decoded))
    } catch (err) {
      throw new Error('Invalid base64url encoding')
    }
  }

  const decodeJWT = useCallback((token: string) => {
    try {
      // Split the token into its three parts
      const parts = token.split('.')
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format: must have three parts separated by dots')
      }

      const [headerPart, payloadPart, signaturePart] = parts

      // Decode header
      const headerJson = base64UrlDecode(headerPart)
      const header = JSON.parse(headerJson)

      // Decode payload
      const payloadJson = base64UrlDecode(payloadPart)
      const payload = JSON.parse(payloadJson)

      setDecodedToken({
        header,
        payload,
        signature: signaturePart
      })
      setError('')
      // Trigger share when JWT is successfully decoded
      triggerShare()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JWT token')
      setDecodedToken(null)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(null)
    
    if (!value.trim()) {
      setDecodedToken(null)
      setError('')
      return
    }

    decodeJWT(value.trim())
  }

  const copyToClipboard = async (section: 'header' | 'payload') => {
    if (!decodedToken) return
    
    const data = section === 'header' ? decodedToken.header : decodedToken.payload
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(section)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const clearAll = () => {
    setInput('')
    setDecodedToken(null)
    setError('')
    setCopied(null)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const isExpired = (exp?: number) => {
    if (!exp) return false
    return Date.now() >= exp * 1000
  }

  const getExpirationStatus = (exp?: number) => {
    if (!exp) return null
    const now = Date.now()
    const expTime = exp * 1000
    const isTokenExpired = now >= expTime
    const timeUntilExpiry = expTime - now
    
    if (isTokenExpired) {
      return { expired: true, message: 'Token has expired' }
    }
    
    const hours = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
    const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return { expired: false, message: `Expires in ${hours}h ${minutes}m` }
    } else {
      return { expired: false, message: `Expires in ${minutes}m` }
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SEOHead
        title="JWT Token Decoder"
        description="Decode and inspect JWT (JSON Web Token) headers and payloads. View token claims, expiration times, and understand JWT structure. Essential tool for developers working with authentication tokens."
        keywords="jwt decoder, jwt parser, json web token decoder, jwt inspector, decode jwt token, jwt analyzer"
        toolName="JWT Token Decoder"
        category="Security & Hashing"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          JWT Token Decoder
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Decode and inspect JSON Web Tokens (JWT). Verify token structure and examine claims.
          </p>
          
          {/* Input Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                JWT Token
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
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
              placeholder="Paste your JWT token here..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Token Info */}
          {decodedToken && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Header
                  </h3>
                  <button
                    onClick={() => copyToClipboard('header')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      copied === 'header'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied === 'header' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto text-sm">
                  <code className="text-gray-900 dark:text-gray-100">
                    {JSON.stringify(decodedToken.header, null, 2)}
                  </code>
                </pre>
              </div>

              {/* Payload Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payload
                  </h3>
                  <button
                    onClick={() => copyToClipboard('payload')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      copied === 'payload'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied === 'payload' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto text-sm">
                  <code className="text-gray-900 dark:text-gray-100">
                    {JSON.stringify(decodedToken.payload, null, 2)}
                  </code>
                </pre>

                {/* Claims Analysis */}
                <div className="mt-4 space-y-4">
                  {/* Standard Claims */}
                  {decodedToken.payload.iss != null && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Issuer: </span>
                      <span className="text-gray-900 dark:text-white">{String(decodedToken.payload.iss)}</span>
                    </div>
                  )}
                  
                  {decodedToken.payload.sub != null && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Subject: </span>
                      <span className="text-gray-900 dark:text-white">{String(decodedToken.payload.sub)}</span>
                    </div>
                  )}
                  
                  {decodedToken.payload.aud != null && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Audience: </span>
                      <span className="text-gray-900 dark:text-white">{String(decodedToken.payload.aud)}</span>
                    </div>
                  )}
                  
                  {decodedToken.payload.iat != null && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Issued At: </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatTimestamp(Number(decodedToken.payload.iat))}
                      </span>
                    </div>
                  )}
                  
                  {decodedToken.payload.exp != null && (
                    <div className={`p-3 rounded border ${
                      isExpired(Number(decodedToken.payload.exp))
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800'
                    }`}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Expires At: </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatTimestamp(Number(decodedToken.payload.exp))}
                      </span>
                      {(() => {
                        const status = getExpirationStatus(Number(decodedToken.payload.exp))
                        return status && (
                          <div className={`text-sm mt-1 ${
                            status.expired 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {status.message}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  
                  {decodedToken.payload.nbf != null && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Not Before: </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatTimestamp(Number(decodedToken.payload.nbf))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Signature
                </h3>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <code className="text-gray-900 dark:text-gray-100 font-mono text-sm break-all">
                    {decodedToken.signature}
                  </code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  The signature is used to verify the token hasn't been tampered with. 
                  Verification requires the secret key or public key.
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About JWT Tokens
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• JWT consists of three parts: Header, Payload, and Signature</li>
              <li>• This tool only decodes tokens - it doesn't verify signatures</li>
              <li>• All processing happens in your browser (no server communication)</li>
              <li>• Never share JWT tokens containing sensitive information</li>
              <li>• Check expiration times to ensure tokens are still valid</li>
            </ul>
          </div>
        </div>
      </div>
      
      <ShareWidget
        toolName="JWT Token Decoder"
        isVisible={shareVisible}
        onClose={hideShare}
      />
    </div>
  )
}

export default JWTTool