import { useState, useCallback, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import ShareWidget from '../components/ShareWidget'
import { useShareTrigger } from '../hooks/useShareTrigger'

type TimestampFormat = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'
type ConversionMode = 'toTimestamp' | 'fromTimestamp'

const TimestampTool = () => {
  const [mode, setMode] = useState<ConversionMode>('fromTimestamp')
  const [timestampInput, setTimestampInput] = useState('')
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>('seconds')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [timezoneInput, setTimezoneInput] = useState('UTC')
  const [result, setResult] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  
  const { isVisible: shareVisible, hideShare, triggerShare } = useShareTrigger({
    toolName: 'Timestamp Converter'
  })

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = useCallback((timestamp: number, format: TimestampFormat): number => {
    switch (format) {
      case 'seconds':
        return Math.floor(timestamp / 1000)
      case 'milliseconds':
        return timestamp
      case 'microseconds':
        return timestamp * 1000
      case 'nanoseconds':
        return timestamp * 1000000
      default:
        return timestamp
    }
  }, [])

  const parseTimestamp = useCallback((input: string, format: TimestampFormat): number => {
    const num = parseFloat(input)
    switch (format) {
      case 'seconds':
        return num * 1000
      case 'milliseconds':
        return num
      case 'microseconds':
        return num / 1000
      case 'nanoseconds':
        return num / 1000000
      default:
        return num
    }
  }, [])

  const convertFromTimestamp = useCallback(() => {
    if (!timestampInput.trim()) {
      setError('Please enter a timestamp')
      setResult('')
      return
    }

    try {
      const timestamp = parseTimestamp(timestampInput, timestampFormat)
      const date = new Date(timestamp)
      
      if (isNaN(date.getTime())) {
        setError('Invalid timestamp')
        setResult('')
        return
      }

      const utcDate = new Date(date.toISOString())
      const localDate = new Date(date.getTime())
      
      const formats = {
        'ISO 8601 (UTC)': utcDate.toISOString(),
        'ISO 8601 (Local)': localDate.toISOString().slice(0, -1),
        'UTC String': utcDate.toUTCString(),
        'Local String': localDate.toString(),
        'Date Only': localDate.toDateString(),
        'Time Only': localDate.toTimeString(),
        'Locale Date': localDate.toLocaleDateString(),
        'Locale Time': localDate.toLocaleTimeString(),
        'Locale DateTime': localDate.toLocaleString(),
        'Custom Format': `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')} ${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}:${String(localDate.getSeconds()).padStart(2, '0')}`
      }

      setResult(Object.entries(formats).map(([name, value]) => `${name}: ${value}`).join('\n'))
      setError('')
      // Trigger share when timestamp is successfully converted
      triggerShare()
    } catch (err) {
      setError('Failed to parse timestamp')
      setResult('')
    }
  }, [timestampInput, timestampFormat, parseTimestamp, triggerShare])

  const convertToTimestamp = useCallback(() => {
    if (!dateInput.trim()) {
      setError('Please enter a date')
      setResult('')
      return
    }

    try {
      let date: Date
      
      if (timeInput.trim()) {
        // Combine date and time
        const dateTimeString = `${dateInput}T${timeInput}`
        date = new Date(dateTimeString)
      } else {
        date = new Date(dateInput)
      }

      if (isNaN(date.getTime())) {
        setError('Invalid date/time format')
        setResult('')
        return
      }

      // Adjust for timezone if not UTC
      if (timezoneInput !== 'UTC') {
        // For simplicity, we'll handle common timezone offsets
        const timezoneOffsets: { [key: string]: number } = {
          'EST': -5, 'CST': -6, 'MST': -7, 'PST': -8,
          'EDT': -4, 'CDT': -5, 'MDT': -6, 'PDT': -7,
          'GMT': 0, 'UTC': 0,
          'CET': 1, 'EET': 2, 'JST': 9, 'AEST': 10
        }
        
        if (timezoneOffsets[timezoneInput] !== undefined) {
          date.setHours(date.getHours() - timezoneOffsets[timezoneInput])
        }
      }

      const timestamp = date.getTime()
      
      const formats = {
        'Unix Timestamp (seconds)': Math.floor(timestamp / 1000),
        'Unix Timestamp (milliseconds)': timestamp,
        'Unix Timestamp (microseconds)': timestamp * 1000,
        'Unix Timestamp (nanoseconds)': timestamp * 1000000
      }

      setResult(Object.entries(formats).map(([name, value]) => `${name}: ${value}`).join('\n'))
      setError('')
      // Trigger share when date is successfully converted to timestamp
      triggerShare()
    } catch (err) {
      setError('Failed to convert date to timestamp')
      setResult('')
    }
  }, [dateInput, timeInput, timezoneInput, triggerShare])

  const handleConvert = () => {
    if (mode === 'fromTimestamp') {
      convertFromTimestamp()
    } else {
      convertToTimestamp()
    }
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

  const setCurrentTimestamp = () => {
    const now = Date.now()
    setTimestampInput(formatTimestamp(now, timestampFormat).toString())
    setError('')
  }

  const setCurrentDateTime = () => {
    const now = new Date()
    setDateInput(now.toISOString().split('T')[0])
    setTimeInput(now.toTimeString().split(' ')[0])
    setError('')
  }

  const clearAll = () => {
    setTimestampInput('')
    setDateInput('')
    setTimeInput('')
    setResult('')
    setError('')
    setCopied('')
  }

  const commonTimezones = [
    'UTC', 'GMT', 'EST', 'CST', 'MST', 'PST', 
    'EDT', 'CDT', 'MDT', 'PDT', 'CET', 'EET', 'JST', 'AEST'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead
        title="Timestamp Converter"
        description="Convert between Unix timestamps and human-readable dates. Support for multiple timezones and date formats. Essential tool for developers working with time-based data."
        keywords="timestamp converter, unix timestamp, epoch converter, date converter, timezone converter"
        toolName="Timestamp Converter"
        category="Developer Utilities"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Timestamp Converter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert between Unix timestamps and human-readable dates. Supports multiple timestamp formats and timezones.
          </p>

          {/* Current Time Display */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Current Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Local Time:</span>
                <div className="font-mono text-blue-700 dark:text-blue-300">{currentTime.toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">UTC Time:</span>
                <div className="font-mono text-blue-700 dark:text-blue-300">{currentTime.toISOString()}</div>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Unix Timestamp:</span>
                <div className="font-mono text-blue-700 dark:text-blue-300">{Math.floor(currentTime.getTime() / 1000)}</div>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Milliseconds:</span>
                <div className="font-mono text-blue-700 dark:text-blue-300">{currentTime.getTime()}</div>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Conversion Mode
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('fromTimestamp')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'fromTimestamp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Timestamp → Date
              </button>
              <button
                onClick={() => setMode('toTimestamp')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'toTimestamp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Date → Timestamp
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            {mode === 'fromTimestamp' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Convert Timestamp to Date
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timestamp
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={timestampInput}
                        onChange={(e) => setTimestampInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="1640995200"
                      />
                      <button
                        onClick={setCurrentTimestamp}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Now
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format
                    </label>
                    <select
                      value={timestampFormat}
                      onChange={(e) => setTimestampFormat(e.target.value as TimestampFormat)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="seconds">Seconds (Unix)</option>
                      <option value="milliseconds">Milliseconds</option>
                      <option value="microseconds">Microseconds</option>
                      <option value="nanoseconds">Nanoseconds</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Convert Date to Timestamp
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      step="1"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezoneInput}
                      onChange={(e) => setTimezoneInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {commonTimezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={setCurrentDateTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Use Current Date/Time
                </button>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <div className="mb-6 flex space-x-3">
            <button
              onClick={handleConvert}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Convert
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversion Result
                </h3>
                <button
                  onClick={() => copyToClipboard(result, 'result')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied === 'result'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied === 'result' ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
                <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {result}
                </pre>
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
                onClick={() => {
                  setMode('fromTimestamp')
                  setTimestampInput('1640995200')
                  setTimestampFormat('seconds')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">New Year 2022</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Timestamp: 1640995200
                </div>
              </button>
              
              <button
                onClick={() => {
                  setMode('fromTimestamp')
                  setTimestampInput('0')
                  setTimestampFormat('seconds')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Unix Epoch</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  Timestamp: 0 (1970-01-01)
                </div>
              </button>

              <button
                onClick={() => {
                  setMode('toTimestamp')
                  setDateInput('2025-01-01')
                  setTimeInput('00:00:00')
                  setTimezoneInput('UTC')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">New Year 2025</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  2025-01-01 00:00:00 UTC
                </div>
              </button>

              <button
                onClick={() => {
                  setMode('fromTimestamp')
                  setTimestampInput(Date.now().toString())
                  setTimestampFormat('milliseconds')
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Current Time</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Now in milliseconds
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Unix Timestamps
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Unix timestamp represents seconds since January 1, 1970 00:00:00 UTC</li>
              <li>• JavaScript uses milliseconds, while most systems use seconds</li>
              <li>• Timestamps are timezone-independent (always UTC)</li>
              <li>• Maximum 32-bit timestamp is 2,147,483,647 (January 19, 2038)</li>
              <li>• Use 64-bit timestamps for dates beyond 2038</li>
            </ul>
          </div>
        </div>
      </div>
      
      <ShareWidget
        toolName="Timestamp Converter"
        isVisible={shareVisible}
        onClose={hideShare}
      />
    </div>
  )
}

export default TimestampTool