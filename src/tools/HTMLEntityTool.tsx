import { useState, useCallback, useMemo } from 'react'

type ConversionMode = 'encode' | 'decode'
type EncodingType = 'named' | 'numeric' | 'hex' | 'mixed'

const HTMLEntityTool = () => {
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [encodingType, setEncodingType] = useState<EncodingType>('named')
  const [copied, setCopied] = useState(false)

  // Common HTML entities mapping
  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    ' ': '&nbsp;',
    '¡': '&iexcl;',
    '¢': '&cent;',
    '£': '&pound;',
    '¤': '&curren;',
    '¥': '&yen;',
    '¦': '&brvbar;',
    '§': '&sect;',
    '¨': '&uml;',
    '©': '&copy;',
    'ª': '&ordf;',
    '«': '&laquo;',
    '¬': '&not;',
    '®': '&reg;',
    '¯': '&macr;',
    '°': '&deg;',
    '±': '&plusmn;',
    '²': '&sup2;',
    '³': '&sup3;',
    '´': '&acute;',
    'µ': '&micro;',
    '¶': '&para;',
    '·': '&middot;',
    '¸': '&cedil;',
    '¹': '&sup1;',
    'º': '&ordm;',
    '»': '&raquo;',
    '¼': '&frac14;',
    '½': '&frac12;',
    '¾': '&frac34;',
    '¿': '&iquest;',
    'À': '&Agrave;',
    'Á': '&Aacute;',
    'Â': '&Acirc;',
    'Ã': '&Atilde;',
    'Ä': '&Auml;',
    'Å': '&Aring;',
    'Æ': '&AElig;',
    'Ç': '&Ccedil;',
    'È': '&Egrave;',
    'É': '&Eacute;',
    'Ê': '&Ecirc;',
    'Ë': '&Euml;',
    'Ì': '&Igrave;',
    'Í': '&Iacute;',
    'Î': '&Icirc;',
    'Ï': '&Iuml;',
    'Ð': '&ETH;',
    'Ñ': '&Ntilde;',
    'Ò': '&Ograve;',
    'Ó': '&Oacute;',
    'Ô': '&Circ;',
    'Õ': '&Otilde;',
    'Ö': '&Ouml;',
    '×': '&times;',
    'Ø': '&Oslash;',
    'Ù': '&Ugrave;',
    'Ú': '&Uacute;',
    'Û': '&Ucirc;',
    'Ü': '&Uuml;',
    'Ý': '&Yacute;',
    'Þ': '&THORN;',
    'ß': '&szlig;',
    'à': '&agrave;',
    'á': '&aacute;',
    'â': '&acirc;',
    'ã': '&atilde;',
    'ä': '&auml;',
    'å': '&aring;',
    'æ': '&aelig;',
    'ç': '&ccedil;',
    'è': '&egrave;',
    'é': '&eacute;',
    'ê': '&ecirc;',
    'ë': '&euml;',
    'ì': '&igrave;',
    'í': '&iacute;',
    'î': '&icirc;',
    'ï': '&iuml;',
    'ð': '&eth;',
    'ñ': '&ntilde;',
    'ò': '&ograve;',
    'ó': '&oacute;',
    'ô': '&ocirc;',
    'õ': '&otilde;',
    'ö': '&ouml;',
    '÷': '&divide;',
    'ø': '&oslash;',
    'ù': '&ugrave;',
    'ú': '&uacute;',
    'û': '&ucirc;',
    'ü': '&uuml;',
    'ý': '&yacute;',
    'þ': '&thorn;',
    'ÿ': '&yuml;'
  }

  // Reverse mapping for decoding
  const reverseEntities = useMemo(() => {
    const reverse: { [key: string]: string } = {}
    Object.entries(htmlEntities).forEach(([char, entity]) => {
      reverse[entity] = char
    })
    return reverse
  }, [])

  // Encode text to HTML entities
  const encodeToEntities = useCallback((text: string, type: EncodingType): string => {
    return text.replace(/./g, (char) => {
      const charCode = char.charCodeAt(0)
      
      // Always encode basic HTML characters
      if (htmlEntities[char] && (type === 'named' || type === 'mixed')) {
        return htmlEntities[char]
      }
      
      // For non-ASCII characters or when using numeric/hex encoding
      if (charCode > 127 || (type === 'numeric' || type === 'hex')) {
        switch (type) {
          case 'numeric':
            return `&#${charCode};`
          case 'hex':
            return `&#x${charCode.toString(16).toUpperCase()};`
          case 'mixed':
            // Use named entities for common ones, numeric for others
            return htmlEntities[char] || `&#${charCode};`
          default:
            return char
        }
      }
      
      return char
    })
  }, [])

  // Decode HTML entities to text
  const decodeEntities = useCallback((text: string): string => {
    return text
      // First decode numeric entities (decimal)
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = parseInt(dec, 10)
        return String.fromCharCode(code)
      })
      // Then decode hex entities
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
        const code = parseInt(hex, 16)
        return String.fromCharCode(code)
      })
      // Finally decode named entities
      .replace(/&[a-zA-Z][a-zA-Z0-9]*;/g, (match) => {
        return reverseEntities[match] || match
      })
  }, [reverseEntities])

  // Process input based on mode
  const processInput = useCallback((text: string) => {
    if (!text) {
      setOutput('')
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeToEntities(text, encodingType)
        setOutput(encoded)
      } else {
        const decoded = decodeEntities(text)
        setOutput(decoded)
      }
    } catch (error) {
      setOutput('Error processing text')
    }
  }, [mode, encodingType, encodeToEntities, decodeEntities])

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    processInput(value)
  }

  // Handle mode change
  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode)
    setCopied(false)
    if (input) {
      // Re-process with new mode
      if (newMode === 'encode') {
        const encoded = encodeToEntities(input, encodingType)
        setOutput(encoded)
      } else {
        const decoded = decodeEntities(input)
        setOutput(decoded)
      }
    }
  }

  // Handle encoding type change
  const handleEncodingTypeChange = (newType: EncodingType) => {
    setEncodingType(newType)
    setCopied(false)
    if (input && mode === 'encode') {
      const encoded = encodeToEntities(input, newType)
      setOutput(encoded)
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
    
    const inputLength = input.length
    const outputLength = output.length
    const entityCount = mode === 'encode' 
      ? (output.match(/&[#a-zA-Z][a-zA-Z0-9]*;/g) || []).length
      : (input.match(/&[#a-zA-Z][a-zA-Z0-9]*;/g) || []).length
    
    return {
      inputLength,
      outputLength,
      entityCount,
      compressionRatio: inputLength > 0 ? (outputLength / inputLength).toFixed(2) : '0'
    }
  }

  const stats = getStats()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          HTML Entity Encoder/Decoder
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert text to HTML entities for safe display in web pages, or decode HTML entities back to readable text.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleModeChange('encode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Decode
              </button>
            </div>

            {/* Encoding Type (only for encode mode) */}
            {mode === 'encode' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Encoding:
                </label>
                <select
                  value={encodingType}
                  onChange={(e) => handleEncodingTypeChange(e.target.value as EncodingType)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="named">Named Entities</option>
                  <option value="numeric">Numeric Entities</option>
                  <option value="hex">Hex Entities</option>
                  <option value="mixed">Mixed (Smart)</option>
                </select>
              </div>
            )}

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
                {mode === 'encode' ? 'Text to Encode' : 'HTML Entities to Decode'}
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter HTML entities to decode...'}
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'HTML Entities' : 'Decoded Text'}
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
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder={`${mode === 'encode' ? 'HTML entities' : 'Decoded text'} will appear here...`}
              />
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Input Length:</span>
                  <div className="font-mono font-medium">{stats.inputLength}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Output Length:</span>
                  <div className="font-mono font-medium">{stats.outputLength}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Entities:</span>
                  <div className="font-mono font-medium">{stats.entityCount}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Size Ratio:</span>
                  <div className="font-mono font-medium">{stats.compressionRatio}x</div>
                </div>
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
                onClick={() => handleInputChange('<script>alert("Hello & goodbye!");</script>')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">HTML/JS Code</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'<script>alert("Hello & goodbye!");</script>'}
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange('Copyright © 2025 • "Company & Co." ™')}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Special Characters</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Copyright © 2025 • "Company & Co." ™
                </div>
              </button>

              <button
                onClick={() => {
                  setMode('decode')
                  handleInputChange('&lt;div class=&quot;example&quot;&gt;Hello &amp; welcome!&lt;/div&gt;')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Decode HTML</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  &lt;div class=&quot;example&quot;&gt;...
                </div>
              </button>

              <button
                onClick={() => {
                  setMode('decode')
                  handleInputChange('&#8364; &#8482; &#169; &#174; &#8230;')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Numeric Entities</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  &#8364; &#8482; &#169; &#174; &#8230;
                </div>
              </button>
            </div>
          </div>

          {/* Encoding Types Info */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Encoding Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <div className="font-medium mb-1">Named Entities:</div>
                <div>Uses named references like &amp;amp; &amp;lt; &amp;gt;</div>
                <div className="font-mono text-xs mt-1">© → &amp;copy;</div>
              </div>
              <div>
                <div className="font-medium mb-1">Numeric Entities:</div>
                <div>Uses decimal character codes</div>
                <div className="font-mono text-xs mt-1">© → &amp;#169;</div>
              </div>
              <div>
                <div className="font-medium mb-1">Hex Entities:</div>
                <div>Uses hexadecimal character codes</div>
                <div className="font-mono text-xs mt-1">© → &amp;#xA9;</div>
              </div>
              <div>
                <div className="font-medium mb-1">Mixed (Smart):</div>
                <div>Named for common, numeric for others</div>
                <div className="font-mono text-xs mt-1">Best of both worlds</div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              About HTML Entities
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• HTML entities prevent interpretation of special characters as HTML code</li>
              <li>• Essential for displaying {"<, >, &, \", '"} characters in HTML</li>
              <li>• Numeric entities work for any Unicode character</li>
              <li>• Named entities are more readable but limited to predefined set</li>
              <li>• Always encode user input to prevent XSS attacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HTMLEntityTool