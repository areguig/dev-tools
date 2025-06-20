import { Link } from 'react-router-dom'

const Home = () => {
  const toolCategories = [
    {
      title: 'Text Processing',
      description: 'Tools for encoding, decoding, and formatting text',
      tools: [
        { name: 'Base64 Encoder/Decoder', path: '/base64', icon: '🔤' },
        { name: 'URL Encoder/Decoder', path: '/url', icon: '🔗' },
        { name: 'JWT Token Decoder', path: '/jwt', icon: '🔐' },
      ]
    },
    {
      title: 'Data Formatting',
      description: 'Format and validate structured data',
      tools: [
        { name: 'JSON Formatter', path: '/json', icon: '📋' },
        { name: 'XML Formatter', path: '/xml', icon: '📄' },
        { name: 'YAML Validator', path: '/yaml', icon: '📝' },
      ]
    },
    {
      title: 'Security & Hashing',
      description: 'Generate hashes and secure passwords',
      tools: [
        { name: 'Hash Generator', path: '/hash', icon: '🔑' },
        { name: 'Password Generator', path: '/password', icon: '🛡️' },
      ]
    },
    {
      title: 'Comparison & Analysis',
      description: 'Compare and analyze text and files',
      tools: [
        { name: 'Text Diff Tool', path: '/diff', icon: '📊' },
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Developer Tools
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Essential utilities for developers - all running locally in your browser
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {toolCategories.map((category) => (
          <div
            key={category.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {category.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {category.description}
            </p>
            <div className="space-y-2">
              {category.tools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-2xl mr-3">{tool.icon}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {tool.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 More tools coming soon!
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            This is just the beginning. We're adding more developer utilities regularly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home