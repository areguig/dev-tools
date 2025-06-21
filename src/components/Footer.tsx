import { useState } from 'react'

const Footer = () => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Main Footer Content */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>🛠️</span>
              <span className="font-medium">Developer Tools Suite</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🆓</span>
              <span>Free & Open Source</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Privacy-First</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>27 Professional Tools</span>
            </div>
          </div>

          {/* GitHub Link */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/areguig/dev-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>View Source Code</span>
            </a>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm font-medium"
            >
              {showDetails ? 'Hide Details' : 'About This Project'}
            </button>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="w-full max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🚀 About This Project</h3>
                  <ul className="space-y-1">
                    <li>• <strong>27 professional developer tools</strong> in one app</li>
                    <li>• <strong>100% free and open source</strong> under MIT license</li>
                    <li>• <strong>Privacy-first design</strong> - all processing happens locally</li>
                    <li>• <strong>No data collection</strong> - your data never leaves your device</li>
                    <li>• <strong>Frontend-only</strong> - no servers or databases required</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">👨‍💻 Development</h3>
                  <ul className="space-y-1">
                    <li>• Built by <strong>@areguig</strong> in collaboration with <strong>Claude Code</strong></li>
                    <li>• Developed using <strong>React + TypeScript + Tailwind CSS</strong></li>
                    <li>• Hosted on <strong>GitHub Pages</strong> with automated deployment</li>
                    <li>• Community contributions welcome via GitHub</li>
                    <li>• Fully documented and maintainable codebase</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <a href="https://github.com/areguig/dev-tools/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">🐛 Report Issues</a>
                  <a href="https://github.com/areguig/dev-tools/discussions" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">💡 Suggest Features</a>
                  <a href="https://github.com/areguig/dev-tools" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">⭐ Star on GitHub</a>
                  <span className="text-gray-500 dark:text-gray-500">|</span>
                  <span className="text-gray-500 dark:text-gray-500">🤖 Generated with Claude Code</span>
                </div>
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
            © 2025 Developer Tools Suite • Built with ❤️ by @areguig & Claude Code
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer