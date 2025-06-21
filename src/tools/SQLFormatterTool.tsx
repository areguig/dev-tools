import { useState } from 'react'

type FormatMode = 'beautify' | 'compress'

const SQLFormatterTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<FormatMode>('beautify')
  const [copied, setCopied] = useState(false)

  // SQL Keywords for formatting
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
    'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
    'AS', 'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'DISTINCT', 'TOP', 'LIMIT', 'OFFSET', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'IF', 'BEGIN', 'END', 'DECLARE', 'SET', 'EXEC', 'EXECUTE', 'RETURN'
  ]

  // SQL beautification
  const beautifySQL = (sql: string): string => {
    if (!sql.trim()) return ''

    let formatted = sql
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()

    // Convert keywords to uppercase
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword.toUpperCase())
    })

    // Add line breaks after major clauses
    formatted = formatted
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bUNION(?:\s+ALL)?\b/gi, '\nUNION')
      .replace(/\bINSERT\b/gi, '\nINSERT')
      .replace(/\bUPDATE\b/gi, '\nUPDATE')
      .replace(/\bDELETE\b/gi, '\nDELETE')
      .replace(/\bCREATE\b/gi, '\nCREATE')
      .replace(/\bALTER\b/gi, '\nALTER')
      .replace(/\bDROP\b/gi, '\nDROP')

    // Add line breaks for JOINs
    formatted = formatted
      .replace(/\b(INNER|LEFT|RIGHT|FULL)\s+JOIN\b/gi, '\n$1 JOIN')
      .replace(/\bJOIN\b(?!\s+(INNER|LEFT|RIGHT|FULL))/gi, '\nJOIN')

    // Handle AND/OR in WHERE clauses
    formatted = formatted
      .replace(/\bAND\b(?=.*\bWHERE\b)/gi, '\n  AND')
      .replace(/\bOR\b(?=.*\bWHERE\b)/gi, '\n  OR')

    // Add proper indentation
    const lines = formatted.split('\n')
    let indentLevel = 0
    const indentedLines = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      // Adjust indentation for specific patterns
      let currentIndent = indentLevel
      
      if (trimmed.match(/^\b(AND|OR)\b/i)) {
        currentIndent = 1
      } else if (trimmed.match(/^\b(INNER|LEFT|RIGHT|FULL|JOIN)\b/i)) {
        currentIndent = 0
      } else if (trimmed.match(/^\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|UNION)\b/i)) {
        currentIndent = 0
      }

      return '  '.repeat(currentIndent) + trimmed
    })

    // Clean up extra newlines and return
    return indentedLines
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // SQL compression
  const compressSQL = (sql: string): string => {
    if (!sql.trim()) return ''

    return sql
      // Remove comments
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove unnecessary spaces around operators
      .replace(/\s*([=<>!]+)\s*/g, '$1')
      .replace(/\s*([(),;])\s*/g, '$1')
      .trim()
  }

  // Process SQL based on mode
  const processSQL = (sql: string, formatMode: FormatMode): string => {
    try {
      return formatMode === 'beautify' ? beautifySQL(sql) : compressSQL(sql)
    } catch (error) {
      return 'Error processing SQL'
    }
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value)
    setCopied(false)
    
    if (value.trim()) {
      const processed = processSQL(value, mode)
      setOutput(processed)
    } else {
      setOutput('')
    }
  }

  // Handle mode change
  const handleModeChange = (newMode: FormatMode) => {
    setMode(newMode)
    setCopied(false)
    
    if (input.trim()) {
      const processed = processSQL(input, newMode)
      setOutput(processed)
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
    
    const inputSize = new Blob([input]).size
    const outputSize = new Blob([output]).size
    const inputLines = input.split('\n').length
    const outputLines = output.split('\n').length
    const compressionRatio = inputSize > 0 ? ((inputSize - outputSize) / inputSize * 100).toFixed(1) : '0'
    
    return {
      inputSize,
      outputSize,
      inputLines,
      outputLines,
      compressionRatio: mode === 'compress' ? compressionRatio : null
    }
  }

  const stats = getStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          SQL Formatter & Compressor
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Format and beautify SQL queries for readability, or compress them to save space.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleModeChange('beautify')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'beautify'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Beautify
              </button>
              <button
                onClick={() => handleModeChange('compress')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === 'compress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Compress
              </button>
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
                SQL Input
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter your SQL query here..."
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'beautify' ? 'Formatted SQL' : 'Compressed SQL'}
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
                placeholder={`${mode === 'beautify' ? 'Formatted' : 'Compressed'} SQL will appear here...`}
              />
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Input Size:</span>
                  <div className="font-mono font-medium">{stats.inputSize} bytes</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Output Size:</span>
                  <div className="font-mono font-medium">{stats.outputSize} bytes</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Input Lines:</span>
                  <div className="font-mono font-medium">{stats.inputLines}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Output Lines:</span>
                  <div className="font-mono font-medium">{stats.outputLines}</div>
                </div>
                {stats.compressionRatio && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Compression:</span>
                    <div className="font-mono font-medium">{stats.compressionRatio}%</div>
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
                onClick={() => handleInputChange(`select u.id, u.name, u.email, p.title, p.created_at from users u inner join posts p on u.id = p.user_id where u.active = 1 and p.status = 'published' order by p.created_at desc limit 10`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Simple Join Query</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  select u.id, u.name from users u...
                </div>
              </button>
              
              <button
                onClick={() => handleInputChange(`SELECT 
    c.customer_name,
    COUNT(o.order_id) as order_count,
    SUM(oi.quantity * oi.price) as total_spent,
    AVG(oi.quantity * oi.price) as avg_order_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(o.order_id) > 5
ORDER BY total_spent DESC`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Complex Aggregation</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  SELECT c.customer_name, COUNT(o.order_id)...
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`INSERT INTO products (name, description, price, category_id, created_at) VALUES ('Gaming Mouse', 'High-precision gaming mouse with RGB lighting', 79.99, 3, NOW()), ('Wireless Keyboard', 'Mechanical wireless keyboard with backlight', 129.99, 3, NOW()), ('USB-C Hub', 'Multi-port USB-C hub with HDMI output', 49.99, 2, NOW())`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Insert Statement</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  INSERT INTO products (name, description...)
                </div>
              </button>

              <button
                onClick={() => handleInputChange(`WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') as month,
        SUM(total_amount) as monthly_total,
        COUNT(*) as order_count
    FROM orders 
    WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
growth_analysis AS (
    SELECT 
        month,
        monthly_total,
        LAG(monthly_total) OVER (ORDER BY month) as prev_month_total,
        (monthly_total - LAG(monthly_total) OVER (ORDER BY month)) / LAG(monthly_total) OVER (ORDER BY month) * 100 as growth_rate
    FROM monthly_sales
)
SELECT * FROM growth_analysis WHERE growth_rate IS NOT NULL ORDER BY month`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">CTE Query</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                  WITH monthly_sales AS (SELECT...)
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              SQL Formatting Features
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Beautify:</strong> Formats with proper indentation, keyword capitalization, and line breaks</li>
              <li>• <strong>Compress:</strong> Removes comments, extra whitespace, and unnecessary characters</li>
              <li>• Handles complex queries with JOINs, subqueries, and CTEs</li>
              <li>• Properly formats WHERE clauses with AND/OR conditions</li>
              <li>• Supports modern SQL features and various database dialects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SQLFormatterTool