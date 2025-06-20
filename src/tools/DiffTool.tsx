import { useState, useCallback, useRef } from 'react'
import * as Diff from 'diff'

type ViewMode = 'side-by-side' | 'unified'

const DiffTool = () => {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)

  const generateDiff = useCallback(() => {
    const options = {
      ignoreWhitespace,
      ignoreCase
    }

    if (viewMode === 'unified') {
      return Diff.createPatch('', leftText, rightText, '', '', options)
    } else {
      return Diff.diffLines(leftText, rightText, options)
    }
  }, [leftText, rightText, viewMode, ignoreWhitespace, ignoreCase])

  const handleFileUpload = (file: File, isLeft: boolean) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (isLeft) {
        setLeftText(content)
      } else {
        setRightText(content)
      }
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    setLeftText('')
    setRightText('')
    if (leftFileRef.current) leftFileRef.current.value = ''
    if (rightFileRef.current) rightFileRef.current.value = ''
  }

  const swapTexts = () => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
  }

  const diff = generateDiff()

  const renderSideBySideDiff = () => {
    if (typeof diff === 'string') return null

    const changes = diff as Diff.Change[]
    const leftLines: React.ReactNode[] = []
    const rightLines: React.ReactNode[] = []
    let leftLineNum = 1
    let rightLineNum = 1

    changes.forEach((change, index) => {
      if (change.removed) {
        const lines = change.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '')
        lines.forEach((line, lineIndex) => {
          leftLines.push(
            <div key={`left-${index}-${lineIndex}`} className="flex">
              <span className="w-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-1 border-r">
                {leftLineNum++}
              </span>
              <span className="flex-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 font-mono text-sm">
                {line || ' '}
              </span>
            </div>
          )
        })
      } else if (change.added) {
        const lines = change.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '')
        lines.forEach((line, lineIndex) => {
          rightLines.push(
            <div key={`right-${index}-${lineIndex}`} className="flex">
              <span className="w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 border-r">
                {rightLineNum++}
              </span>
              <span className="flex-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 font-mono text-sm">
                {line || ' '}
              </span>
            </div>
          )
        })
      } else {
        const lines = change.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '')
        lines.forEach((line, lineIndex) => {
          leftLines.push(
            <div key={`left-${index}-${lineIndex}`} className="flex">
              <span className="w-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 border-r">
                {leftLineNum++}
              </span>
              <span className="flex-1 bg-white dark:bg-gray-800 px-2 py-1 font-mono text-sm">
                {line || ' '}
              </span>
            </div>
          )
          rightLines.push(
            <div key={`right-${index}-${lineIndex}`} className="flex">
              <span className="w-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 border-r">
                {rightLineNum++}
              </span>
              <span className="flex-1 bg-white dark:bg-gray-800 px-2 py-1 font-mono text-sm">
                {line || ' '}
              </span>
            </div>
          )
        })
      }
    })

    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original</h3>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-96 overflow-auto">
            {leftLines.length > 0 ? leftLines : (
              <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No content</div>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modified</h3>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-96 overflow-auto">
            {rightLines.length > 0 ? rightLines : (
              <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No content</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderUnifiedDiff = () => {
    if (typeof diff !== 'string') return null

    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unified Diff</h3>
        <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-96 overflow-auto bg-gray-50 dark:bg-gray-900">
          <pre className="p-4 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {diff || 'No differences found'}
          </pre>
        </div>
      </div>
    )
  }

  const getDiffStats = () => {
    if (typeof diff === 'string') return null

    const changes = diff as Diff.Change[]
    let added = 0
    let removed = 0

    changes.forEach(change => {
      if (change.added) {
        added += change.count || 0
      } else if (change.removed) {
        removed += change.count || 0
      }
    })

    return { added, removed }
  }

  const stats = getDiffStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Text Diff Tool
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Compare two pieces of text and visualize the differences. Upload files or paste text directly.
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* View Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Unified
              </button>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore whitespace</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore case</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={swapTexts}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                ⇄ Swap
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <div className="flex space-x-4 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  +{stats.added} additions
                </span>
                <span className="text-red-600 dark:text-red-400">
                  -{stats.removed} deletions
                </span>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original Text
                </label>
                <input
                  ref={leftFileRef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.json,.xml,.html,.css,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.dart,.sql,.sh,.yml,.yaml"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, true)
                  }}
                  className="text-xs"
                />
              </div>
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Paste original text here or upload a file..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modified Text
                </label>
                <input
                  ref={rightFileRef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.json,.xml,.html,.css,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.dart,.sql,.sh,.yml,.yaml"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, false)
                  }}
                  className="text-xs"
                />
              </div>
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Paste modified text here or upload a file..."
              />
            </div>
          </div>

          {/* Diff Display */}
          {(leftText || rightText) && (
            viewMode === 'side-by-side' ? renderSideBySideDiff() : renderUnifiedDiff()
          )}

          {/* Examples Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setLeftText(`function hello() {
  console.log("Hello World");
}`)
                  setRightText(`function hello(name) {
  console.log("Hello " + name);
  return true;
}`)
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Code Changes</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Compare function modifications
                </div>
              </button>
              
              <button
                onClick={() => {
                  setLeftText(`Line 1
Line 2
Line 3
Line 4`)
                  setRightText(`Line 1
Line 2 modified
Line 3
Line 5`)
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Text Changes</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Compare line modifications
                </div>
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Text Diff
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Red highlighting shows removed content</li>
              <li>• Green highlighting shows added content</li>
              <li>• Side-by-side view shows original and modified text separately</li>
              <li>• Unified view shows changes in patch format</li>
              <li>• Supports file uploads for comparing documents</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiffTool