export interface Tool {
  name: string
  path: string
  icon: string
  category: string
  description: string
  tags: string[]
  popularity: number // 1-5 scale
  complexity: 'Easy' | 'Medium' | 'Hard'
  keywords: string[]
}

export interface ToolCategory {
  title: string
  description: string
  tools: Tool[]
}

export const toolsData: ToolCategory[] = [
  {
    title: 'Text Processing',
    description: 'Tools for encoding, decoding, and formatting text',
    tools: [
      {
        name: 'Base64 Encoder/Decoder',
        path: '/base64',
        icon: '🔤',
        category: 'Text Processing',
        description: 'Encode text to Base64 or decode Base64 strings back to text with UTF-8 support',
        tags: ['encoding', 'text', 'security', 'popular', 'binary'],
        popularity: 5,
        complexity: 'Easy',
        keywords: ['base64', 'encode', 'decode', 'binary', 'ascii', 'utf8']
      },
      {
        name: 'URL Encoder/Decoder',
        path: '/url',
        icon: '🔗',
        category: 'Text Processing',
        description: 'Encode and decode URLs, URIs, and URL components with multiple encoding types',
        tags: ['encoding', 'url', 'web', 'percent', 'uri'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['url', 'uri', 'percent', 'encode', 'decode', 'web']
      },
      {
        name: 'JWT Token Decoder',
        path: '/jwt',
        icon: '🔐',
        category: 'Text Processing',
        description: 'Decode and inspect JWT tokens, view claims, and check expiration times',
        tags: ['jwt', 'token', 'security', 'auth', 'decode'],
        popularity: 5,
        complexity: 'Medium',
        keywords: ['jwt', 'json', 'web', 'token', 'auth', 'bearer', 'claims']
      }
    ]
  },
  {
    title: 'Data Formatting',
    description: 'Format and validate structured data',
    tools: [
      {
        name: 'JSON Formatter',
        path: '/json',
        icon: '📋',
        category: 'Data Formatting',
        description: 'Format, validate, and minify JSON data with syntax highlighting',
        tags: ['json', 'format', 'validate', 'api', 'popular'],
        popularity: 5,
        complexity: 'Easy',
        keywords: ['json', 'format', 'validate', 'minify', 'pretty', 'api']
      },
      {
        name: 'XML Formatter',
        path: '/xml',
        icon: '📄',
        category: 'Data Formatting',
        description: 'Format and validate XML documents with proper indentation',
        tags: ['xml', 'format', 'validate', 'markup', 'soap'],
        popularity: 3,
        complexity: 'Medium',
        keywords: ['xml', 'format', 'validate', 'markup', 'soap', 'rss']
      },
      {
        name: 'YAML Validator',
        path: '/yaml',
        icon: '📝',
        category: 'Data Formatting',
        description: 'Validate YAML syntax and display errors with line numbers',
        tags: ['yaml', 'validate', 'config', 'kubernetes', 'docker'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['yaml', 'yml', 'validate', 'config', 'kubernetes', 'docker']
      }
    ]
  },
  {
    title: 'Code Formatting',
    description: 'Format and beautify code for better readability',
    tools: [
      {
        name: 'CSS Formatter',
        path: '/css-formatter',
        icon: '🎨',
        category: 'Code Formatting',
        description: 'Format and minify CSS with compression statistics',
        tags: ['css', 'format', 'minify', 'styles', 'web'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['css', 'format', 'minify', 'beautify', 'styles', 'web']
      },
      {
        name: 'SQL Formatter',
        path: '/sql-formatter',
        icon: '🗃️',
        category: 'Code Formatting',
        description: 'Format SQL queries with proper indentation and keyword capitalization',
        tags: ['sql', 'format', 'database', 'query', 'mysql'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['sql', 'format', 'database', 'query', 'mysql', 'postgres']
      },
      {
        name: 'Markdown to HTML Converter',
        path: '/markdown',
        icon: '📄',
        category: 'Code Formatting',
        description: 'Convert Markdown to HTML with live preview and syntax support',
        tags: ['markdown', 'html', 'convert', 'documentation', 'github'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['markdown', 'md', 'html', 'convert', 'documentation', 'github']
      },
      {
        name: 'JavaScript Formatter',
        path: '/js-formatter',
        icon: '📜',
        category: 'Code Formatting',
        description: 'Format and minify JavaScript/TypeScript code with ES6+ support',
        tags: ['javascript', 'format', 'minify', 'es6', 'typescript'],
        popularity: 5,
        complexity: 'Medium',
        keywords: ['javascript', 'js', 'typescript', 'ts', 'format', 'minify', 'es6']
      }
    ]
  },
  {
    title: 'Security & Hashing',
    description: 'Generate hashes and secure passwords',
    tools: [
      {
        name: 'Hash Generator',
        path: '/hash',
        icon: '🔑',
        category: 'Security & Hashing',
        description: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes for text and files',
        tags: ['hash', 'md5', 'sha', 'security', 'checksum'],
        popularity: 5,
        complexity: 'Easy',
        keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'crypto']
      },
      {
        name: 'Password Generator',
        path: '/password',
        icon: '🛡️',
        category: 'Security & Hashing',
        description: 'Generate strong, secure passwords with customizable options and strength analysis',
        tags: ['password', 'security', 'random', 'strong', 'generator'],
        popularity: 5,
        complexity: 'Easy',
        keywords: ['password', 'generate', 'secure', 'random', 'strong', 'strength']
      },
      {
        name: 'JWT Token Generator',
        path: '/jwt-generator',
        icon: '🔐',
        category: 'Security & Hashing',
        description: 'Generate JWT tokens with HMAC-SHA256 signing and standard claims',
        tags: ['jwt', 'token', 'generate', 'auth', 'hmac'],
        popularity: 4,
        complexity: 'Hard',
        keywords: ['jwt', 'generate', 'token', 'auth', 'hmac', 'claims', 'sign']
      }
    ]
  },
  {
    title: 'URL & QR Tools',
    description: 'Shorten URLs and generate QR codes',
    tools: [
      {
        name: 'URL Shortener',
        path: '/url-shortener',
        icon: '🔗',
        category: 'URL & QR Tools',
        description: 'Shorten URLs using TinyURL with QR code generation and analytics',
        tags: ['url', 'shorten', 'tinyurl', 'qr', 'analytics'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['url', 'shorten', 'tiny', 'short', 'link', 'redirect']
      },
      {
        name: 'QR Code Generator',
        path: '/qr-code',
        icon: '📱',
        category: 'URL & QR Tools',
        description: 'Generate QR codes for text, URLs, WiFi with customizable options',
        tags: ['qr', 'code', 'generate', 'mobile', 'barcode'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['qr', 'code', 'generate', 'barcode', 'mobile', 'scan']
      },
      {
        name: 'Lorem Ipsum Generator',
        path: '/lorem',
        icon: '📝',
        category: 'URL & QR Tools',
        description: 'Generate placeholder text in multiple styles (Classic, Hipster, Tech)',
        tags: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy'],
        popularity: 3,
        complexity: 'Easy',
        keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text', 'filler']
      }
    ]
  },
  {
    title: 'Design & Visual',
    description: 'Color tools and visual utilities',
    tools: [
      {
        name: 'Color Palette Generator',
        path: '/color',
        icon: '🎨',
        category: 'Design & Visual',
        description: 'Generate color palettes using color theory with accessibility analysis',
        tags: ['color', 'palette', 'design', 'harmony', 'accessibility'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['color', 'palette', 'hex', 'rgb', 'hsl', 'design', 'harmony']
      },
      {
        name: 'Timestamp Converter',
        path: '/timestamp',
        icon: '⏰',
        category: 'Design & Visual',
        description: 'Convert between Unix timestamps and human-readable dates with timezone support',
        tags: ['timestamp', 'date', 'time', 'unix', 'convert'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert']
      },
      {
        name: 'Regex Tester',
        path: '/regex',
        icon: '🔍',
        category: 'Design & Visual',
        description: 'Test regular expressions with real-time matching and group highlighting',
        tags: ['regex', 'regexp', 'pattern', 'match', 'test'],
        popularity: 5,
        complexity: 'Hard',
        keywords: ['regex', 'regexp', 'regular', 'expression', 'pattern', 'match']
      }
    ]
  },
  {
    title: 'Developer Utilities',
    description: 'Essential tools for software development',
    tools: [
      {
        name: 'UUID/GUID Generator',
        path: '/uuid',
        icon: '🆔',
        category: 'Developer Utilities',
        description: 'Generate UUID v1/v4 and GUID values with validation and bulk generation',
        tags: ['uuid', 'guid', 'unique', 'identifier', 'random'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['uuid', 'guid', 'unique', 'identifier', 'random', 'generate']
      },
      {
        name: 'HTML Entity Encoder',
        path: '/html-entity',
        icon: '🏷️',
        category: 'Developer Utilities',
        description: 'Encode and decode HTML entities with comprehensive character mapping',
        tags: ['html', 'entity', 'encode', 'escape', 'character'],
        popularity: 3,
        complexity: 'Easy',
        keywords: ['html', 'entity', 'encode', 'decode', 'escape', 'character']
      },
      {
        name: 'Text Case Converter',
        path: '/text-case',
        icon: '📝',
        category: 'Developer Utilities',
        description: 'Convert text between 12 case types including camelCase and snake_case',
        tags: ['text', 'case', 'convert', 'camel', 'snake'],
        popularity: 4,
        complexity: 'Easy',
        keywords: ['text', 'case', 'camel', 'snake', 'pascal', 'kebab', 'convert']
      },
      {
        name: 'Image to Base64 Converter',
        path: '/image-base64',
        icon: '🖼️',
        category: 'Developer Utilities',
        description: 'Convert images to Base64 with drag-drop upload and preview',
        tags: ['image', 'base64', 'convert', 'upload', 'data-url'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['image', 'base64', 'convert', 'upload', 'data', 'url']
      },
      {
        name: 'Environment Variables Manager',
        path: '/env-vars',
        icon: '⚙️',
        category: 'Developer Utilities',
        description: 'Convert environment variables between 6 formats (.env, JSON, YAML)',
        tags: ['env', 'environment', 'variables', 'config', 'docker'],
        popularity: 4,
        complexity: 'Medium',
        keywords: ['env', 'environment', 'variables', 'config', 'docker', 'yaml']
      }
    ]
  },
  {
    title: 'Advanced Tools',
    description: 'Professional development and testing utilities',
    tools: [
      {
        name: 'API Testing Tool',
        path: '/api-test',
        icon: '🔌',
        category: 'Advanced Tools',
        description: 'Full REST API client with custom headers and response analysis',
        tags: ['api', 'rest', 'http', 'test', 'client'],
        popularity: 5,
        complexity: 'Hard',
        keywords: ['api', 'rest', 'http', 'test', 'client', 'request', 'response']
      },
      {
        name: 'Cron Expression Builder',
        path: '/cron-builder',
        icon: '⏰',
        category: 'Advanced Tools',
        description: 'Visual cron expression builder with human-readable descriptions',
        tags: ['cron', 'schedule', 'expression', 'unix', 'time'],
        popularity: 3,
        complexity: 'Hard',
        keywords: ['cron', 'schedule', 'expression', 'unix', 'time', 'job']
      }
    ]
  },
  {
    title: 'Comparison & Analysis',
    description: 'Compare and analyze text and files',
    tools: [
      {
        name: 'Text Diff Tool',
        path: '/diff',
        icon: '📊',
        category: 'Comparison & Analysis',
        description: 'Compare text files with side-by-side and unified diff views',
        tags: ['diff', 'compare', 'text', 'file', 'merge'],
        popularity: 3,
        complexity: 'Medium',
        keywords: ['diff', 'compare', 'text', 'file', 'merge', 'changes']
      }
    ]
  }
]