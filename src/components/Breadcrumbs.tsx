import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path: string
}

const Breadcrumbs = () => {
  const location = useLocation()
  
  // Tool name mappings for better breadcrumb labels
  const toolNames: { [key: string]: string } = {
    '/': 'Home',
    '/base64': 'Base64 Encoder/Decoder',
    '/url': 'URL Encoder/Decoder',
    '/jwt': 'JWT Token Decoder',
    '/json': 'JSON Formatter',
    '/xml': 'XML Formatter',
    '/yaml': 'YAML Validator',
    '/css-formatter': 'CSS Formatter',
    '/sql-formatter': 'SQL Formatter',
    '/markdown': 'Markdown to HTML Converter',
    '/js-formatter': 'JavaScript Formatter',
    '/hash': 'Hash Generator',
    '/password': 'Password Generator',
    '/jwt-generator': 'JWT Token Generator',
    '/url-shortener': 'URL Shortener',
    '/qr-code': 'QR Code Generator',
    '/lorem': 'Lorem Ipsum Generator',
    '/color': 'Color Palette Generator',
    '/timestamp': 'Timestamp Converter',
    '/regex': 'Regex Tester',
    '/uuid': 'UUID/GUID Generator',
    '/html-entity': 'HTML Entity Encoder',
    '/text-case': 'Text Case Converter',
    '/image-base64': 'Image to Base64 Converter',
    '/env-vars': 'Environment Variables Manager',
    '/api-test': 'API Testing Tool',
    '/cron-builder': 'Cron Expression Builder',
    '/diff': 'Text Diff Tool'
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always start with home
    breadcrumbs.push({ label: 'Developer Tools', path: '/' })
    
    // Add current tool if not on home page
    if (location.pathname !== '/' && toolNames[location.pathname]) {
      breadcrumbs.push({
        label: toolNames[location.pathname],
        path: location.pathname
      })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
      
      {/* Structured Data for Breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": breadcrumb.label,
            "item": `https://areguig.github.io/dev-tools${breadcrumb.path === '/' ? '' : breadcrumb.path}`
          }))
        })}
      </script>
    </nav>
  )
}

export default Breadcrumbs