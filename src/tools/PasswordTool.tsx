import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

const PasswordTool = () => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' })
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'\"~,;.<>'
  }

  const calculateStrength = useCallback((pwd: string) => {
    let score = 0

    // Length scoring
    if (pwd.length >= 12) score += 25
    else if (pwd.length >= 8) score += 15
    else if (pwd.length >= 6) score += 5

    // Character variety scoring
    if (/[a-z]/.test(pwd)) score += 5
    if (/[A-Z]/.test(pwd)) score += 5
    if (/[0-9]/.test(pwd)) score += 5
    if (/[^A-Za-z0-9]/.test(pwd)) score += 10

    // Pattern penalties
    if (/(.)\1{2,}/.test(pwd)) score -= 10 // Repeated characters
    if (/123|abc|qwe|asd/i.test(pwd)) score -= 15 // Common sequences

    // Bonus for length
    if (pwd.length >= 16) score += 10
    if (pwd.length >= 20) score += 15

    // Determine label and color
    let label = ''
    let color = ''
    
    if (score < 30) {
      label = 'Very Weak'
      color = 'text-red-600 dark:text-red-400'
    } else if (score < 50) {
      label = 'Weak'
      color = 'text-orange-600 dark:text-orange-400'
    } else if (score < 70) {
      label = 'Fair'
      color = 'text-yellow-600 dark:text-yellow-400'
    } else if (score < 85) {
      label = 'Good'
      color = 'text-blue-600 dark:text-blue-400'
    } else {
      label = 'Strong'
      color = 'text-green-600 dark:text-green-400'
    }

    return { score: Math.min(100, Math.max(0, score)), label, color }
  }, [])

  const generatePassword = useCallback(() => {
    let charset = ''
    
    if (options.includeUppercase) charset += characterSets.uppercase
    if (options.includeLowercase) charset += characterSets.lowercase
    if (options.includeNumbers) charset += characterSets.numbers
    if (options.includeSymbols) charset += characterSets.symbols

    if (options.excludeSimilar) {
      characterSets.similar.split('').forEach(char => {
        charset = charset.replace(new RegExp(char, 'g'), '')
      })
    }

    if (options.excludeAmbiguous) {
      characterSets.ambiguous.split('').forEach(char => {
        charset = charset.replace(new RegExp('\\' + char, 'g'), '')
      })
    }

    if (!charset) {
      setPassword('Error: No character types selected')
      setStrength({ score: 0, label: 'Invalid', color: 'text-red-600' })
      return
    }

    let result = ''
    const array = new Uint8Array(options.length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < options.length; i++) {
      result += charset[array[i] % charset.length]
    }

    setPassword(result)
    setStrength(calculateStrength(result))
    setCopied(false)

    // Add to history (keep last 5)
    setHistory(prev => [result, ...prev.slice(0, 4)])
  }, [options, calculateStrength])

  const copyToClipboard = async () => {
    if (!password || password.startsWith('Error:')) return
    
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const useFromHistory = (historicalPassword: string) => {
    setPassword(historicalPassword)
    setStrength(calculateStrength(historicalPassword))
    setCopied(false)
  }

  const clearHistory = () => {
    setHistory([])
  }

  // Auto-generate on mount and option changes
  useState(() => {
    generatePassword()
  })

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead
        title="Password Generator - Strong & Secure"
        description="Generate strong, secure passwords with customizable options. Password strength analyzer, character sets, and preset templates. Create secure passwords for your accounts and applications."
        keywords="password generator, strong password generator, secure password, random password, password strength"
        toolName="Password Generator"
        category="Security & Hashing"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Password Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate secure, random passwords with customizable options. All generation happens locally in your browser.
          </p>

          {/* Generated Password Display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Password
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!password || password.startsWith('Error:')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={generatePassword}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Generate New
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={password}
                readOnly
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white font-mono text-lg break-all"
                placeholder="Generated password will appear here..."
              />
            </div>
            
            {/* Strength Indicator */}
            {password && !password.startsWith('Error:') && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength</span>
                  <span className={`text-sm font-medium ${strength.color}`}>
                    {strength.label} ({strength.score}/100)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      strength.score < 30 ? 'bg-red-500' :
                      strength.score < 50 ? 'bg-orange-500' :
                      strength.score < 70 ? 'bg-yellow-500' :
                      strength.score < 85 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Length Control */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Length: {options.length}
              </h3>
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={(e) => updateOption('length', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>4</span>
                <span>32</span>
                <span>64</span>
                <span>128</span>
              </div>
            </div>

            {/* Character Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Character Types
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Uppercase Letters (A-Z)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Lowercase Letters (a-z)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Numbers (0-9)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Symbols (!@#$%^&*)
                </span>
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Advanced Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Exclude similar characters (i, l, 1, L, o, 0, O)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Exclude ambiguous characters ({`{ } [ ] ( ) / \\ ' " ~ , ; . < >`})
                </span>
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setOptions({
                  length: 12,
                  includeUppercase: true,
                  includeLowercase: true,
                  includeNumbers: true,
                  includeSymbols: false,
                  excludeSimilar: true,
                  excludeAmbiguous: false
                })}
                className="p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="font-medium text-blue-900 dark:text-blue-100">Easy to Type</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">12 chars, no symbols/similar</div>
              </button>
              
              <button
                onClick={() => setOptions({
                  length: 16,
                  includeUppercase: true,
                  includeLowercase: true,
                  includeNumbers: true,
                  includeSymbols: true,
                  excludeSimilar: false,
                  excludeAmbiguous: false
                })}
                className="p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="font-medium text-green-900 dark:text-green-100">Balanced</div>
                <div className="text-sm text-green-700 dark:text-green-300">16 chars, all types included</div>
              </button>
              
              <button
                onClick={() => setOptions({
                  length: 32,
                  includeUppercase: true,
                  includeLowercase: true,
                  includeNumbers: true,
                  includeSymbols: true,
                  excludeSimilar: true,
                  excludeAmbiguous: true
                })}
                className="p-3 text-left bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <div className="font-medium text-red-900 dark:text-red-100">Maximum Security</div>
                <div className="text-sm text-red-700 dark:text-red-300">32 chars, filtered characters</div>
              </button>
            </div>
          </div>

          {/* Password History */}
          {history.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Passwords
                </h3>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {history.map((pwd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded border"
                  >
                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                      {pwd}
                    </span>
                    <button
                      onClick={() => useFromHistory(pwd)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tips */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Password Security Tips
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Use unique passwords for each account</li>
              <li>• Enable two-factor authentication when available</li>
              <li>• Store passwords in a reputable password manager</li>
              <li>• Avoid using personal information in passwords</li>
              <li>• Change passwords if you suspect they've been compromised</li>
              <li>• Longer passwords are generally more secure than complex short ones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordTool