import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'

type UUIDVersion = '1' | '4'
type UUIDFormat = 'uppercase' | 'lowercase' | 'braces' | 'hyphens-removed'

const UUIDTool = () => {
  const [version, setVersion] = useState<UUIDVersion>('4')
  const [format, setFormat] = useState<UUIDFormat>('lowercase')
  const [quantity, setQuantity] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState('')

  // Generate UUID v4 (random)
  const generateUUIDv4 = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }, [])

  // Generate UUID v1 (timestamp-based - simplified version)
  const generateUUIDv1 = useCallback((): string => {
    const timestamp = Date.now()
    const randomPart = Math.random().toString(16).substring(2, 15)
    const clockSeq = Math.floor(Math.random() * 0x3fff)
    
    // Simplified UUID v1 format (not fully compliant but demonstrates concept)
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0')
    const timeMid = ((timestamp >>> 32) & 0xffff).toString(16).padStart(4, '0')
    const timeHigh = (0x1000 | ((timestamp >>> 48) & 0x0fff)).toString(16).padStart(4, '0')
    const clockSeqHigh = (0x80 | ((clockSeq >>> 8) & 0x3f)).toString(16).padStart(2, '0')
    const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, '0')
    const node = randomPart.substring(0, 12)
    
    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${node}`
  }, [])

  // Format UUID according to selected format
  const formatUUID = useCallback((uuid: string, formatType: UUIDFormat): string => {
    switch (formatType) {
      case 'uppercase':
        return uuid.toUpperCase()
      case 'lowercase':
        return uuid.toLowerCase()
      case 'braces':
        return `{${uuid.toLowerCase()}}`
      case 'hyphens-removed':
        return uuid.replace(/-/g, '').toLowerCase()
      default:
        return uuid.toLowerCase()
    }
  }, [])

  // Generate UUIDs based on version and settings
  const generateUUIDs = useCallback(() => {
    const newUuids: string[] = []
    
    for (let i = 0; i < quantity; i++) {
      let uuid: string
      if (version === '1') {
        uuid = generateUUIDv1()
      } else {
        uuid = generateUUIDv4()
      }
      
      const formattedUuid = formatUUID(uuid, format)
      newUuids.push(formattedUuid)
    }
    
    setUuids(newUuids)
    setCopied('')
  }, [version, format, quantity, generateUUIDv1, generateUUIDv4, formatUUID])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const copyAllUUIDs = async () => {
    const allUuidsText = uuids.join('\n')
    await copyToClipboard(allUuidsText, 'all')
  }

  const clearAll = () => {
    setUuids([])
    setCopied('')
  }

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const uuidRegexNoDashes = /^[0-9a-f]{32}$/i
    const uuidRegexBraces = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/i
    
    return uuidRegex.test(uuid) || uuidRegexNoDashes.test(uuid) || uuidRegexBraces.test(uuid)
  }

  const getUUIDInfo = (uuid: string) => {
    // Remove braces and normalize
    const cleanUuid = uuid.replace(/[{}]/g, '')
    
    // Add hyphens if missing
    const normalizedUuid = cleanUuid.length === 32 && !cleanUuid.includes('-')
      ? `${cleanUuid.substring(0, 8)}-${cleanUuid.substring(8, 12)}-${cleanUuid.substring(12, 16)}-${cleanUuid.substring(16, 20)}-${cleanUuid.substring(20)}`
      : cleanUuid
    
    if (!validateUUID(normalizedUuid)) {
      return null
    }

    const versionDigit = normalizedUuid.charAt(14)
    const variantBits = normalizedUuid.charAt(19)
    
    let version = 'Unknown'
    if (versionDigit === '1') version = 'Version 1 (Time-based)'
    else if (versionDigit === '4') version = 'Version 4 (Random)'
    else if (versionDigit === '3') version = 'Version 3 (Name-based MD5)'
    else if (versionDigit === '5') version = 'Version 5 (Name-based SHA-1)'
    
    let variant = 'Unknown'
    if (['8', '9', 'a', 'b', 'A', 'B'].includes(variantBits)) {
      variant = 'RFC 4122 (Standard)'
    }
    
    return {
      version,
      variant,
      format: uuid.includes('{') ? 'Braces' : 
               uuid.includes('-') ? 'Hyphenated' : 'No hyphens'
    }
  }

  // Auto-generate on mount
  useState(() => {
    generateUUIDs()
  })

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead
        title="UUID/GUID Generator"
        description="Generate UUID (Universally Unique Identifier) and GUID values. Support for UUID v1 and v4 with multiple format options. Bulk generation and validation features for developers."
        keywords="uuid generator, guid generator, unique id generator, uuid v4, uuid v1, identifier generator"
        toolName="UUID/GUID Generator"
        category="Developer Utilities"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          UUID/GUID Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate Universally Unique Identifiers (UUIDs) or Globally Unique Identifiers (GUIDs) in various formats.
          </p>

          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Version Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UUID Version
              </label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value as UUIDVersion)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="4">Version 4 (Random)</option>
                <option value="1">Version 1 (Time-based)</option>
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as UUIDFormat)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="lowercase">Lowercase</option>
                <option value="uppercase">Uppercase</option>
                <option value="braces">With Braces</option>
                <option value="hyphens-removed">No Hyphens</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity: {quantity}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={generateUUIDs}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Generate UUIDs
            </button>
            {uuids.length > 0 && (
              <>
                <button
                  onClick={copyAllUUIDs}
                  className={`px-4 py-3 rounded-md transition-colors ${
                    copied === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {copied === 'all' ? 'Copied All!' : 'Copy All'}
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated UUIDs */}
          {uuids.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Generated UUIDs ({uuids.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100 flex-1 break-all">
                      {uuid}
                    </span>
                    <button
                      onClick={() => copyToClipboard(uuid, `uuid-${index}`)}
                      className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                        copied === `uuid-${index}`
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied === `uuid-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UUID Validator */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              UUID Validator & Analyzer
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Paste a UUID to validate and analyze..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => {
                  const uuid = e.target.value.trim()
                  if (uuid) {
                    const info = getUUIDInfo(uuid)
                    const nextElement = e.target.nextElementSibling as HTMLElement
                    if (nextElement) {
                      if (info) {
                        nextElement.innerHTML = `
                          <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                            <div class="text-green-800 dark:text-green-200 text-sm space-y-1">
                              <div><strong>Valid UUID</strong></div>
                              <div>Version: ${info.version}</div>
                              <div>Variant: ${info.variant}</div>
                              <div>Format: ${info.format}</div>
                            </div>
                          </div>
                        `
                      } else {
                        nextElement.innerHTML = `
                          <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <div class="text-red-800 dark:text-red-200 text-sm">
                              <strong>Invalid UUID format</strong>
                            </div>
                          </div>
                        `
                      }
                    }
                  } else {
                    const nextElement = e.target.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.innerHTML = ''
                    }
                  }
                }}
              />
              <div></div>
            </div>
          </div>

          {/* Format Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Format Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900 dark:text-white mb-2">Standard Formats:</div>
                <div className="space-y-1 font-mono text-gray-700 dark:text-gray-300">
                  <div>550e8400-e29b-41d4-a716-446655440000</div>
                  <div>550E8400-E29B-41D4-A716-446655440000</div>
                  <div>{'{550e8400-e29b-41d4-a716-446655440000}'}</div>
                  <div>550e8400e29b41d4a716446655440000</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white mb-2">Use Cases:</div>
                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                  <div>• Database primary keys</div>
                  <div>• API request/response IDs</div>
                  <div>• File naming</div>
                  <div>• Session identifiers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Version Comparison */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              UUID Versions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <div className="font-medium mb-1">Version 1 (Time-based):</div>
                <ul className="space-y-1">
                  <li>• Based on timestamp and MAC address</li>
                  <li>• Sortable by creation time</li>
                  <li>• May reveal system information</li>
                  <li>• Good for ordered sequences</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Version 4 (Random):</div>
                <ul className="space-y-1">
                  <li>• Cryptographically random</li>
                  <li>• No system information leaked</li>
                  <li>• Most commonly used</li>
                  <li>• Best for security-sensitive uses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              About UUIDs
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• UUID = Universally Unique Identifier, GUID = Globally Unique Identifier</li>
              <li>• 128-bit values typically displayed as 32 hexadecimal digits</li>
              <li>• Extremely low probability of collision (duplication)</li>
              <li>• Standard format: 8-4-4-4-12 hexadecimal digits</li>
              <li>• Can be generated without a central authority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UUIDTool