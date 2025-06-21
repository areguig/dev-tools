import { useState, useEffect } from 'react'

interface CronField {
  value: string
  type: 'value' | 'range' | 'list' | 'step' | 'any'
}

interface CronExpression {
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

const CronBuilderTool = () => {
  const [expression, setExpression] = useState<CronExpression>({
    minute: { value: '0', type: 'value' },
    hour: { value: '0', type: 'value' },
    dayOfMonth: { value: '*', type: 'any' },
    month: { value: '*', type: 'any' },
    dayOfWeek: { value: '*', type: 'any' }
  })
  
  const [cronString, setCronString] = useState('0 0 * * *')
  const [customCron, setCustomCron] = useState('')
  const [nextRuns, setNextRuns] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [copied, setCopied] = useState(false)

  // Field options
  const fieldOptions = {
    minute: { min: 0, max: 59, label: 'Minute' },
    hour: { min: 0, max: 23, label: 'Hour' },
    dayOfMonth: { min: 1, max: 31, label: 'Day of Month' },
    month: { min: 1, max: 12, label: 'Month' },
    dayOfWeek: { min: 0, max: 6, label: 'Day of Week' }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  // Convert field to cron string part
  const fieldToCron = (field: CronField): string => {
    switch (field.type) {
      case 'any':
        return '*'
      case 'value':
        return field.value
      case 'range':
        const [start, end] = field.value.split('-')
        return `${start}-${end}`
      case 'list':
        return field.value
      case 'step':
        const [base, step] = field.value.split('/')
        return `${base || '*'}/${step}`
      default:
        return '*'
    }
  }

  // Generate cron string from expression
  const generateCronString = (): string => {
    return [
      fieldToCron(expression.minute),
      fieldToCron(expression.hour),
      fieldToCron(expression.dayOfMonth),
      fieldToCron(expression.month),
      fieldToCron(expression.dayOfWeek)
    ].join(' ')
  }

  // Parse cron string to expression
  const parseCronString = (cron: string): CronExpression | null => {
    const parts = cron.trim().split(/\s+/)
    if (parts.length !== 5) return null

    const parseField = (value: string): CronField => {
      if (value === '*') return { value: '*', type: 'any' }
      if (value.includes('/')) return { value, type: 'step' }
      if (value.includes('-')) return { value, type: 'range' }
      if (value.includes(',')) return { value, type: 'list' }
      return { value, type: 'value' }
    }

    try {
      return {
        minute: parseField(parts[0]),
        hour: parseField(parts[1]),
        dayOfMonth: parseField(parts[2]),
        month: parseField(parts[3]),
        dayOfWeek: parseField(parts[4])
      }
    } catch {
      return null
    }
  }

  // Generate human-readable description
  const generateDescription = (cron: string): string => {
    const parts = cron.split(' ')
    if (parts.length !== 5) return 'Invalid cron expression'

    const [min, hour, day, month, dow] = parts

    let desc = 'Runs '

    // Handle frequency
    if (min === '*' && hour === '*') {
      desc += 'every minute'
    } else if (hour === '*') {
      if (min === '0') desc += 'every hour'
      else if (min.includes('/')) desc += `every ${min.split('/')[1]} minutes`
      else desc += `at minute ${min} of every hour`
    } else if (min === '0' && hour === '0') {
      desc += 'daily at midnight'
    } else if (min === '0') {
      const h = parseInt(hour)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      desc += `daily at ${displayHour}:00 ${ampm}`
    } else {
      const h = parseInt(hour)
      const m = parseInt(min)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      desc += `daily at ${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`
    }

    // Handle day restrictions
    if (dow !== '*' && day !== '*') {
      desc += ` on day ${day} of the month and on ${dayNames[parseInt(dow)]}`
    } else if (dow !== '*') {
      if (dow.includes(',')) {
        const days = dow.split(',').map(d => dayNames[parseInt(d)]).join(', ')
        desc += ` on ${days}`
      } else {
        desc += ` on ${dayNames[parseInt(dow)]}s`
      }
    } else if (day !== '*') {
      desc += ` on the ${day}${getOrdinalSuffix(parseInt(day))} day of the month`
    }

    // Handle month restrictions
    if (month !== '*') {
      if (month.includes(',')) {
        const months = month.split(',').map(m => monthNames[parseInt(m) - 1]).join(', ')
        desc += ` in ${months}`
      } else {
        desc += ` in ${monthNames[parseInt(month) - 1]}`
      }
    }

    return desc
  }

  // Get ordinal suffix
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  // Calculate next run times (simplified)
  const calculateNextRuns = (cron: string): string[] => {
    const runs: string[] = []
    const now = new Date()
    
    // This is a simplified calculation for demo purposes
    // In a real application, you'd use a proper cron library
    const parts = cron.split(' ')
    if (parts.length !== 5) return []

    const [min, hour] = parts
    
    for (let i = 0; i < 5; i++) {
      const nextRun = new Date(now)
      nextRun.setDate(now.getDate() + i)
      
      if (hour !== '*') {
        nextRun.setHours(parseInt(hour))
      }
      if (min !== '*') {
        nextRun.setMinutes(parseInt(min))
      }
      nextRun.setSeconds(0)
      
      runs.push(nextRun.toLocaleString())
    }
    
    return runs
  }

  // Update field
  const updateField = (fieldName: keyof CronExpression, field: Partial<CronField>) => {
    setExpression(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...field }
    }))
  }

  // Preset expressions
  const presets = [
    { name: 'Every minute', cron: '* * * * *' },
    { name: 'Every hour', cron: '0 * * * *' },
    { name: 'Daily at midnight', cron: '0 0 * * *' },
    { name: 'Daily at noon', cron: '0 12 * * *' },
    { name: 'Weekly (Sunday)', cron: '0 0 * * 0' },
    { name: 'Monthly (1st)', cron: '0 0 1 * *' },
    { name: 'Yearly (Jan 1st)', cron: '0 0 1 1 *' },
    { name: 'Weekdays at 9 AM', cron: '0 9 * * 1-5' },
    { name: 'Every 15 minutes', cron: '*/15 * * * *' },
    { name: 'Every 6 hours', cron: '0 */6 * * *' }
  ]

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cronString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Update cron string when expression changes
  useEffect(() => {
    const newCron = generateCronString()
    setCronString(newCron)
    setCustomCron(newCron)
    setDescription(generateDescription(newCron))
    setNextRuns(calculateNextRuns(newCron))
  }, [expression])

  // Handle custom cron input
  const handleCustomCronChange = (value: string) => {
    setCustomCron(value)
    const parsed = parseCronString(value)
    if (parsed) {
      setExpression(parsed)
      setCronString(value)
      setDescription(generateDescription(value))
      setNextRuns(calculateNextRuns(value))
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Cron Expression Builder
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Build and test cron expressions with an intuitive interface, or use presets for common scheduling patterns.
          </p>

          {/* Presets */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Presets</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleCustomCronChange(preset.cron)}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{preset.name}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs font-mono mt-1">{preset.cron}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Cron Input */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <label className="text-lg font-semibold text-gray-900 dark:text-white">
                Cron Expression
              </label>
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
            </div>
            <input
              type="text"
              value={customCron}
              onChange={(e) => handleCustomCronChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-lg"
              placeholder="0 0 * * *"
            />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Format: minute hour day-of-month month day-of-week
            </div>
          </div>

          {/* Field Builder */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Field Builder</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {Object.entries(expression).map(([fieldName, field]) => {
                const options = fieldOptions[fieldName as keyof typeof fieldOptions]
                return (
                  <div key={fieldName} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {options.label}
                    </label>
                    
                    {/* Type selector */}
                    <select
                      value={field.type}
                      onChange={(e) => updateField(fieldName as keyof CronExpression, { 
                        type: e.target.value as CronField['type'],
                        value: e.target.value === 'any' ? '*' : field.value
                      })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="any">Any (*)</option>
                      <option value="value">Specific Value</option>
                      <option value="range">Range</option>
                      <option value="list">List</option>
                      <option value="step">Step</option>
                    </select>

                    {/* Value input */}
                    {field.type !== 'any' && (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateField(fieldName as keyof CronExpression, { value: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white font-mono"
                        placeholder={
                          field.type === 'range' ? `${options.min}-${options.max}` :
                          field.type === 'list' ? `${options.min},${options.min + 1}` :
                          field.type === 'step' ? `*/${Math.min(5, options.max)}` :
                          options.min.toString()
                        }
                      />
                    )}

                    {/* Helper text */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {field.type === 'value' && `${options.min}-${options.max}`}
                      {field.type === 'range' && `${options.min}-${options.max}`}
                      {field.type === 'list' && 'Comma separated'}
                      {field.type === 'step' && 'base/step'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Description
            </h3>
            <p className="text-blue-700 dark:text-blue-300">{description}</p>
          </div>

          {/* Next Runs */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Next 5 Scheduled Runs
            </h3>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm">
                  {run}
                </div>
              ))}
            </div>
          </div>

          {/* Cron Format Reference */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Cron Format Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Field Order:</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>1. Minute (0-59)</div>
                  <div>2. Hour (0-23)</div>
                  <div>3. Day of Month (1-31)</div>
                  <div>4. Month (1-12)</div>
                  <div>5. Day of Week (0-6, Sunday=0)</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Special Characters:</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div><span className="font-mono">*</span> - Any value</div>
                  <div><span className="font-mono">,</span> - List separator</div>
                  <div><span className="font-mono">-</span> - Range</div>
                  <div><span className="font-mono">/</span> - Step values</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CronBuilderTool