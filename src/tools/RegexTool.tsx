import { useState, useMemo } from 'react'
import SEOHead from '../components/SEOHead'
import ShareWidget from '../components/ShareWidget'
import { useShareTrigger } from '../hooks/useShareTrigger'

interface RegexMatch {
  match: string
  index: number
  groups: string[]
  namedGroups?: { [key: string]: string }
}

interface RegexFlags {
  global: boolean
  ignoreCase: boolean
  multiline: boolean
  dotAll: boolean
  unicode: boolean
  sticky: boolean
}

const RegexTool = () => {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  })
  const [replacement, setReplacement] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  
  const { isVisible: shareVisible, hideShare, triggerShare } = useShareTrigger({
    toolName: 'Regex Tester'
  })

  const flagsString = useMemo(() => {
    let result = ''
    if (flags.global) result += 'g'
    if (flags.ignoreCase) result += 'i'
    if (flags.multiline) result += 'm'
    if (flags.dotAll) result += 's'
    if (flags.unicode) result += 'u'
    if (flags.sticky) result += 'y'
    return result
  }, [flags])

  const regexObject = useMemo(() => {
    if (!pattern) return null
    try {
      return new RegExp(pattern, flagsString)
    } catch (err) {
      return null
    }
  }, [pattern, flagsString])

  const matches = useMemo(() => {
    if (!regexObject || !testString) return []
    
    setError('')
    const results: RegexMatch[] = []
    
    try {
      if (flags.global) {
        let match
        const regex = new RegExp(pattern, flagsString)
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups
          })
          
          // Prevent infinite loop
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regexObject.exec(testString)
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regex execution failed')
    }
    
    // Trigger share when regex finds matches
    if (results.length > 0) {
      triggerShare()
    }
    
    return results
  }, [regexObject, testString, pattern, flagsString, flags.global])

  const isValidRegex = useMemo(() => {
    if (!pattern) return true
    try {
      new RegExp(pattern, flagsString)
      setError('')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern')
      return false
    }
  }, [pattern, flagsString])

  const highlightedText = useMemo(() => {
    if (!testString || !isValidRegex || matches.length === 0) {
      return testString
    }

    let result = testString
    let offset = 0
    
    matches.forEach((match, index) => {
      const startIndex = match.index + offset
      const endIndex = startIndex + match.match.length
      const highlightClass = `bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded`
      const highlightedMatch = `<span class="${highlightClass}" data-match="${index}">${match.match}</span>`
      
      result = result.slice(0, startIndex) + highlightedMatch + result.slice(endIndex)
      offset += highlightedMatch.length - match.match.length
    })
    
    return result
  }, [testString, isValidRegex, matches])

  const replacedText = useMemo(() => {
    if (!regexObject || !testString || !replacement) return ''
    
    try {
      return testString.replace(regexObject, replacement)
    } catch (err) {
      return 'Error in replacement'
    }
  }, [regexObject, testString, replacement])

  const updateFlag = (flag: keyof RegexFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: value }))
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const clearAll = () => {
    setPattern('')
    setTestString('')
    setReplacement('')
    setError('')
    setCopied('')
  }

  const loadExample = (examplePattern: string, exampleText: string, exampleFlags: Partial<RegexFlags> = {}) => {
    setPattern(examplePattern)
    setTestString(exampleText)
    setFlags(prev => ({ ...prev, ...exampleFlags }))
    setError('')
  }

  const explainPattern = (pattern: string): string[] => {
    const explanations: string[] = []
    
    if (pattern.includes('^')) explanations.push('^ - Start of string/line')
    if (pattern.includes('$')) explanations.push('$ - End of string/line')
    if (pattern.includes('\\d')) explanations.push('\\d - Any digit (0-9)')
    if (pattern.includes('\\w')) explanations.push('\\w - Any word character (a-z, A-Z, 0-9, _)')
    if (pattern.includes('\\s')) explanations.push('\\s - Any whitespace character')
    if (pattern.includes('.')) explanations.push('. - Any character (except newline)')
    if (pattern.includes('*')) explanations.push('* - Zero or more of the preceding element')
    if (pattern.includes('+')) explanations.push('+ - One or more of the preceding element')
    if (pattern.includes('?')) explanations.push('? - Zero or one of the preceding element')
    if (pattern.includes('|')) explanations.push('| - OR operator')
    if (pattern.includes('[')) explanations.push('[] - Character class/set')
    if (pattern.includes('(')) explanations.push('() - Capturing group')
    if (pattern.includes('{')) explanations.push('{n,m} - Between n and m repetitions')
    
    return explanations
  }

  const patternExplanations = pattern ? explainPattern(pattern) : []

  return (
    <div className="max-w-6xl mx-auto">
      <SEOHead
        title="Regex Tester & Pattern Validator"
        description="Test and validate regular expressions with real-time matching. Interactive regex tester with match highlighting, capture groups, and pattern explanation. Perfect for developers debugging regex patterns."
        keywords="regex tester, regular expression tester, regex validator, pattern matcher, regex debugger, javascript regex"
        toolName="Regex Tester & Pattern Validator"
        category="Developer Utilities"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Regex Tester
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Test regular expressions against text, view matches and groups, and perform replacements with real-time feedback.
          </p>

          {/* Pattern Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Regular Expression Pattern
              </label>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 font-mono text-lg">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isValidRegex 
                    ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                }`}
                placeholder="Enter your regex pattern..."
              />
              <span className="text-gray-500 dark:text-gray-400 font-mono text-lg">/</span>
              <span className="text-gray-500 dark:text-gray-400 font-mono text-sm min-w-[2rem]">
                {flagsString}
              </span>
            </div>
          </div>

          {/* Flags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flags
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.global}
                  onChange={(e) => updateFlag('global', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">g</span> Global
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.ignoreCase}
                  onChange={(e) => updateFlag('ignoreCase', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">i</span> Ignore Case
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.multiline}
                  onChange={(e) => updateFlag('multiline', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">m</span> Multiline
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.dotAll}
                  onChange={(e) => updateFlag('dotAll', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">s</span> Dot All
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.unicode}
                  onChange={(e) => updateFlag('unicode', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">u</span> Unicode
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.sticky}
                  onChange={(e) => updateFlag('sticky', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold">y</span> Sticky
                </span>
              </label>
            </div>
          </div>

          {/* Test String */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test String
            </label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
              placeholder="Enter text to test your regex against..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {isValidRegex && pattern && testString && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Highlighted Text */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Highlighted Matches ({matches.length} found)
                </h3>
                <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 min-h-[8rem] max-h-64 overflow-auto">
                  <pre 
                    className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightedText || 'No matches found' }}
                  />
                </div>
              </div>

              {/* Match Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Match Details
                </h3>
                <div className="max-h-64 overflow-auto space-y-2">
                  {matches.length > 0 ? (
                    matches.map((match, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            Match {index + 1}
                          </span>
                          <button
                            onClick={() => copyToClipboard(match.match, `match-${index}`)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              copied === `match-${index}`
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {copied === `match-${index}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Text:</span> <span className="font-mono">{match.match}</span></div>
                          <div><span className="font-medium">Position:</span> {match.index} - {match.index + match.match.length}</div>
                          {match.groups.length > 0 && (
                            <div><span className="font-medium">Groups:</span> {match.groups.map((group, i) => 
                              <span key={i} className="font-mono ml-1">[{i+1}: "{group}"]</span>
                            )}</div>
                          )}
                          {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                            <div><span className="font-medium">Named Groups:</span> {Object.entries(match.namedGroups).map(([name, value]) => 
                              <span key={name} className="font-mono ml-1">{name}: "{value}"</span>
                            )}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                      No matches found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Replace Section */}
          {isValidRegex && pattern && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Replace
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Replacement Text
                  </label>
                  <input
                    type="text"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="$1, $2, etc. for groups"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Result
                    </label>
                    {replacedText && (
                      <button
                        onClick={() => copyToClipboard(replacedText, 'replaced')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          copied === 'replaced'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {copied === 'replaced' ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 min-h-[2.5rem]">
                    <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {replacedText || 'Enter replacement text to see result'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pattern Explanation */}
          {pattern && patternExplanations.length > 0 && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                Pattern Explanation
              </h3>
              <ul className="space-y-1">
                {patternExplanations.map((explanation, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300 font-mono">
                    {explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => loadExample(
                  '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                  'user@example.com\ninvalid-email\ntest.email+tag@domain.co.uk',
                  { global: true, multiline: true }
                )}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Email Validation</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'}
                </div>
              </button>
              
              <button
                onClick={() => loadExample(
                  '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b',
                  'Server IP: 192.168.1.1\nInvalid: 999.999.999.999\nLocal: 127.0.0.1',
                  { global: true }
                )}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">IP Address</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b'}
                </div>
              </button>

              <button
                onClick={() => loadExample(
                  '(\\d{4})-(\\d{2})-(\\d{2})',
                  'Today is 2025-01-15 and tomorrow is 2025-01-16.',
                  { global: true }
                )}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Date Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'(\\d{4})-(\\d{2})-(\\d{2})'}
                </div>
              </button>

              <button
                onClick={() => loadExample(
                  '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
                  'Colors: #FF0000 #00FF00 #0000FF #FFF #000',
                  { global: true }
                )}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Hex Colors</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  {'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b'}
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Regex Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <div className="font-medium mb-1">Character Classes:</div>
                <ul className="space-y-1 font-mono">
                  <li>{'\\d - Digit [0-9]'}</li>
                  <li>{'\\w - Word character [a-zA-Z0-9_]'}</li>
                  <li>{'\\s - Whitespace'}</li>
                  <li>. - Any character</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Quantifiers:</div>
                <ul className="space-y-1 font-mono">
                  <li>* - Zero or more</li>
                  <li>+ - One or more</li>
                  <li>? - Zero or one</li>
                  <li>{'{n,m} - Between n and m'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ShareWidget
        toolName="Regex Tester"
        isVisible={shareVisible}
        onClose={hideShare}
      />
    </div>
  )
}

export default RegexTool