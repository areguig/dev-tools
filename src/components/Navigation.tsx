import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const tools = [
    { name: 'Base64', path: '/base64' },
    { name: 'JWT Decoder', path: '/jwt' },
    { name: 'JSON Formatter', path: '/json' },
    { name: 'XML Formatter', path: '/xml' },
    { name: 'YAML Validator', path: '/yaml' },
    { name: 'Text Diff', path: '/diff' },
    { name: 'URL Encoder', path: '/url' },
    { name: 'Hash Generator', path: '/hash' },
    { name: 'Password Generator', path: '/password' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => {
              console.log('DevTools clicked, forcing navigation to home')
              // Force a full navigation to home
              window.location.href = '/dev-tools/'
            }}
            className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            DevTools
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Tools
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {tools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mr-2"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-700">
              {tools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation