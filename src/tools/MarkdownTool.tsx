import { useState, useMemo } from 'react'

const MarkdownTool = () => {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  // Simple markdown to HTML converter
  const convertMarkdownToHTML = (markdown: string): string => {
    if (!markdown.trim()) return ''

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // Handle code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang ? ` class="language-${lang}"` : ''
      return `<pre><code${language}>${code.trim()}</code></pre>`
    })

    // Handle blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // Handle unordered lists
    const listItems = html.split('\n').map(line => {
      if (line.match(/^[\s]*[-*+] /)) {
        return line.replace(/^[\s]*[-*+] (.*)/, '<li>$1</li>')
      }
      return line
    })

    // Group list items
    let inList = false
    const processedLines = []
    for (const line of listItems) {
      if (line.includes('<li>')) {
        if (!inList) {
          processedLines.push('<ul>')
          inList = true
        }
        processedLines.push(line)
      } else {
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(line)
      }
    }
    if (inList) {
      processedLines.push('</ul>')
    }

    html = processedLines.join('\n')

    // Handle ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')

    // Handle horizontal rules
    html = html.replace(/^---$/gim, '<hr>')
    html = html.replace(/^\*\*\*$/gim, '<hr>')

    // Handle line breaks and paragraphs
    const lines = html.split('\n')
    const paragraphs = []
    let currentParagraph = []

    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines and HTML block elements
      if (!trimmed || 
          trimmed.match(/^<(h[1-6]|div|ul|ol|li|blockquote|pre|hr)/i) ||
          trimmed.match(/<\/(h[1-6]|div|ul|ol|blockquote|pre)>$/i)) {
        
        if (currentParagraph.length > 0) {
          paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`)
          currentParagraph = []
        }
        
        if (trimmed && !trimmed.match(/^<\/?(ul|ol|li)/i)) {
          paragraphs.push(trimmed)
        }
      } else {
        currentParagraph.push(trimmed)
      }
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`)
    }

    return paragraphs.join('\n').trim()
  }

  // Generate HTML output
  const htmlOutput = useMemo(() => convertMarkdownToHTML(input), [input])

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!htmlOutput) return
    
    try {
      await navigator.clipboard.writeText(htmlOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setCopied(false)
  }

  // Get statistics
  const getStats = () => {
    if (!input || !htmlOutput) return null
    
    const inputLines = input.split('\n').length
    const inputWords = input.trim().split(/\s+/).filter(word => word.length > 0).length
    const inputChars = input.length
    const outputChars = htmlOutput.length
    const htmlTags = (htmlOutput.match(/<[^>]+>/g) || []).length
    
    return {
      inputLines,
      inputWords,
      inputChars,
      outputChars,
      htmlTags
    }
  }

  const stats = getStats()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Markdown to HTML Converter
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Convert Markdown text to HTML with support for headers, lists, links, code blocks, and more.
          </p>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
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
                Markdown Input
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                placeholder="Enter your Markdown here..."
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  HTML Output
                </label>
                <button
                  onClick={copyToClipboard}
                  disabled={!htmlOutput}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
              <textarea
                value={htmlOutput}
                readOnly
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder="HTML output will appear here..."
              />
            </div>
          </div>

          {/* Live Preview */}
          {htmlOutput && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Live Preview</h3>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Lines:</span>
                  <div className="font-mono font-medium">{stats.inputLines}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Words:</span>
                  <div className="font-mono font-medium">{stats.inputWords}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">MD Chars:</span>
                  <div className="font-mono font-medium">{stats.inputChars}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">HTML Chars:</span>
                  <div className="font-mono font-medium">{stats.outputChars}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">HTML Tags:</span>
                  <div className="font-mono font-medium">{stats.htmlTags}</div>
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
                onClick={() => setInput(`# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold text** and *italic text*.

- List item 1
- List item 2
- List item 3

[Link to Google](https://google.com)

\`inline code\` example`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Basic Formatting</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Headers, bold, italic, lists, links
                </div>
              </button>
              
              <button
                onClick={() => setInput(`# Code Examples

Here's some JavaScript:

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

And some inline \`code\` too.

> This is a blockquote
> with multiple lines

---

1. First item
2. Second item
3. Third item`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Code & Quotes</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Code blocks, blockquotes, ordered lists
                </div>
              </button>

              <button
                onClick={() => setInput(`# Documentation Example

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## Usage

\`\`\`javascript
import { myFunction } from 'my-package';

const result = myFunction('hello');
console.log(result);
\`\`\`

## Features

- ✅ Fast and lightweight
- ✅ TypeScript support
- ✅ Zero dependencies
- ❌ No IE support

## Links

- [GitHub](https://github.com/user/repo)
- [Documentation](https://docs.example.com)

---

*Built with ❤️ by developers*`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">README Style</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Documentation format with code
                </div>
              </button>

              <button
                onClick={() => setInput(`# Article Example

## Introduction

This is a **sample article** with various *formatting options*.

![Sample Image](https://via.placeholder.com/300x200)

## Features

### Text Formatting
- **Bold text**
- *Italic text*  
- ~~Strikethrough~~
- \`Inline code\`

### Links & References
Check out [this link](https://example.com) for more info.

> "The best way to predict the future is to invent it."  
> — Alan Kay

### Code Example

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

That's it!`)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">Article Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Complete article with images, quotes
                </div>
              </button>
            </div>
          </div>

          {/* Markdown Reference */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Supported Markdown Syntax
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-medium mb-2">Text Formatting:</h4>
                <ul className="space-y-1">
                  <li>• <code>**bold**</code> or <code>__bold__</code></li>
                  <li>• <code>*italic*</code> or <code>_italic_</code></li>
                  <li>• <code>~~strikethrough~~</code></li>
                  <li>• <code>`inline code`</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Structure:</h4>
                <ul className="space-y-1">
                  <li>• <code># Header 1</code></li>
                  <li>• <code>## Header 2</code></li>
                  <li>• <code>### Header 3</code></li>
                  <li>• <code>- List item</code></li>
                  <li>• <code>1. Numbered item</code></li>
                  <li>• <code>{'> Blockquote'}</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Links & Media:</h4>
                <ul className="space-y-1">
                  <li>• <code>[text](url)</code></li>
                  <li>• <code>![alt](image-url)</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Code Blocks:</h4>
                <ul className="space-y-1">
                  <li>• <code>```language</code></li>
                  <li>• <code>code here</code></li>
                  <li>• <code>```</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarkdownTool