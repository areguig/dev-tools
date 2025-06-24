import React, { useState, useCallback } from 'react'
import { useFavorites } from '../contexts/FavoritesContext'
import { useHistory } from '../contexts/HistoryContext'
import { useShareTrigger } from '../hooks/useShareTrigger'
import ShareWidget from '../components/ShareWidget'

// Types for package.json structure
interface PackageJson {
  name?: string
  version?: string
  description?: string
  main?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  keywords?: string[]
  author?: string | { name: string; email?: string; url?: string }
  license?: string
  repository?: string | { type: string; url: string }
  homepage?: string
  bugs?: string | { url?: string; email?: string }
  engines?: Record<string, string>
  [key: string]: any
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  field: string
  message: string
  suggestion?: string
}

interface DependencyInfo {
  name: string
  currentVersion: string
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'
  issues: string[]
  suggestions: string[]
}

const PackageJsonTool = () => {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<{
    isValid: boolean
    packageData?: PackageJson
    validationIssues: ValidationIssue[]
    dependencyAnalysis: DependencyInfo[]
    securityIssues: ValidationIssue[]
    recommendations: ValidationIssue[]
    stats: {
      totalDependencies: number
      devDependencies: number
      peerDependencies: number
      optionalDependencies: number
      scripts: number
      estimatedSize: string
    }
  } | null>(null)

  const { favorites, toggleFavorite } = useFavorites()
  const { addToHistory } = useHistory()
  const shareState = useShareTrigger({
    toolName: 'Package.json Validator',
    triggerDelay: 3000,
    cooldownPeriod: 60000
  })

  const isFavorite = favorites.includes('/package-json')

  // Validation rules
  const validatePackageJson = useCallback((pkg: PackageJson): ValidationIssue[] => {
    const issues: ValidationIssue[] = []

    // Required fields
    if (!pkg.name) {
      issues.push({
        type: 'error',
        field: 'name',
        message: 'Package name is required',
        suggestion: 'Add a unique package name following npm naming conventions'
      })
    } else if (!/^[a-z0-9]([a-z0-9-._])*$/.test(pkg.name)) {
      issues.push({
        type: 'warning',
        field: 'name',
        message: 'Package name contains invalid characters',
        suggestion: 'Use lowercase letters, numbers, hyphens, dots, and underscores only'
      })
    }

    if (!pkg.version) {
      issues.push({
        type: 'error',
        field: 'version',
        message: 'Version is required',
        suggestion: 'Add a semantic version (e.g., "1.0.0")'
      })
    } else if (!/^\d+\.\d+\.\d+/.test(pkg.version)) {
      issues.push({
        type: 'warning',
        field: 'version',
        message: 'Version should follow semantic versioning',
        suggestion: 'Use format: MAJOR.MINOR.PATCH (e.g., "1.0.0")'
      })
    }

    // Recommended fields
    if (!pkg.description) {
      issues.push({
        type: 'warning',
        field: 'description',
        message: 'Description is recommended',
        suggestion: 'Add a brief description of your package'
      })
    }

    if (!pkg.license) {
      issues.push({
        type: 'warning',
        field: 'license',
        message: 'License is recommended',
        suggestion: 'Specify a license (e.g., "MIT", "Apache-2.0")'
      })
    }

    if (!pkg.repository) {
      issues.push({
        type: 'info',
        field: 'repository',
        message: 'Repository URL is recommended',
        suggestion: 'Add repository information for better discoverability'
      })
    }

    if (!pkg.author) {
      issues.push({
        type: 'info',
        field: 'author',
        message: 'Author information is recommended',
        suggestion: 'Add author name and contact information'
      })
    }

    if (!pkg.keywords || pkg.keywords.length === 0) {
      issues.push({
        type: 'info',
        field: 'keywords',
        message: 'Keywords help with package discovery',
        suggestion: 'Add relevant keywords as an array'
      })
    }

    // Script validations
    if (pkg.scripts) {
      if (!pkg.scripts.test) {
        issues.push({
          type: 'info',
          field: 'scripts.test',
          message: 'Test script is recommended',
          suggestion: 'Add a test script for automated testing'
        })
      }

      if (!pkg.scripts.build && !pkg.scripts.compile) {
        issues.push({
          type: 'info',
          field: 'scripts.build',
          message: 'Build script is recommended',
          suggestion: 'Add a build script for production builds'
        })
      }
    }

    return issues
  }, [])

  // Dependency analysis
  const analyzeDependencies = useCallback((pkg: PackageJson): DependencyInfo[] => {
    const analysis: DependencyInfo[] = []
    const depTypes: Array<keyof Pick<PackageJson, 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'>> = [
      'dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'
    ]

    depTypes.forEach(depType => {
      const deps = pkg[depType]
      if (deps) {
        Object.entries(deps).forEach(([name, version]) => {
          const issues: string[] = []
          const suggestions: string[] = []

          // Version format validation
          if (version.includes('*')) {
            issues.push('Wildcard versions can cause unpredictable builds')
            suggestions.push('Use specific version ranges like "^1.0.0" or "~1.0.0"')
          }

          if (version.startsWith('git+') || version.includes('github:')) {
            issues.push('Git dependencies can be unstable')
            suggestions.push('Consider using published npm packages when available')
          }

          if (!version.match(/^[\^~]?\d+\.\d+\.\d+/)) {
            issues.push('Invalid or non-standard version format')
            suggestions.push('Use semantic versioning format (e.g., "^1.0.0")')
          }

          // Common outdated packages
          const outdatedPackages: Record<string, string> = {
            'babel-core': 'Use @babel/core instead',
            'babel-preset-env': 'Use @babel/preset-env instead',
            'babel-preset-react': 'Use @babel/preset-react instead',
            'babel-preset-stage-0': 'Stage presets are deprecated',
            'react-scripts': 'Check for latest version regularly',
            'webpack': 'Consider if you need direct webpack dependency',
            'node-sass': 'Consider migrating to sass (Dart Sass)',
            'tslint': 'TSLint is deprecated, use ESLint with TypeScript support'
          }

          if (outdatedPackages[name]) {
            issues.push('Package may be outdated or deprecated')
            suggestions.push(outdatedPackages[name])
          }

          // Security considerations
          const securityRisks: Record<string, string> = {
            'lodash': 'Consider tree-shaking or using specific lodash modules',
            'moment': 'Consider using date-fns or dayjs for smaller bundle size',
            'request': 'Package is deprecated, use node-fetch or axios',
            'bower': 'Bower is deprecated, use npm or yarn'
          }

          if (securityRisks[name]) {
            issues.push('Potential security or performance concern')
            suggestions.push(securityRisks[name])
          }

          analysis.push({
            name,
            currentVersion: version,
            type: depType,
            issues,
            suggestions
          })
        })
      }
    })

    return analysis
  }, [])

  // Security analysis
  const analyzeSecurityIssues = useCallback((pkg: PackageJson): ValidationIssue[] => {
    const issues: ValidationIssue[] = []

    // Check for common security issues
    if (pkg.scripts) {
      Object.entries(pkg.scripts).forEach(([scriptName, script]) => {
        if (script.includes('rm -rf') || script.includes('del /')) {
          issues.push({
            type: 'warning',
            field: `scripts.${scriptName}`,
            message: 'Script contains potentially dangerous file deletion commands',
            suggestion: 'Review and ensure file deletion is intentional and safe'
          })
        }

        if (script.includes('sudo') || script.includes('chmod 777')) {
          issues.push({
            type: 'error',
            field: `scripts.${scriptName}`,
            message: 'Script uses potentially unsafe system commands',
            suggestion: 'Avoid using sudo or overly permissive file permissions'
          })
        }

        if (script.includes('curl') && script.includes('sh')) {
          issues.push({
            type: 'warning',
            field: `scripts.${scriptName}`,
            message: 'Script downloads and executes remote code',
            suggestion: 'Verify the source and consider security implications'
          })
        }
      })
    }

    // Check for private package publication risks
    if (!pkg.private && pkg.name && !pkg.name.startsWith('@')) {
      issues.push({
        type: 'info',
        field: 'private',
        message: 'Package appears to be public',
        suggestion: 'Add "private": true if this package should not be published to npm'
      })
    }

    return issues
  }, [])

  // Generate recommendations
  const generateRecommendations = useCallback((pkg: PackageJson): ValidationIssue[] => {
    const recommendations: ValidationIssue[] = []

    // Performance recommendations
    const depCount = Object.keys(pkg.dependencies || {}).length
    if (depCount > 50) {
      recommendations.push({
        type: 'warning',
        field: 'dependencies',
        message: `Large number of dependencies (${depCount})`,
        suggestion: 'Consider if all dependencies are necessary to reduce bundle size'
      })
    }

    // Modern JavaScript recommendations
    if (pkg.engines && pkg.engines.node) {
      const nodeVersion = pkg.engines.node.replace(/[^\d.]/g, '')
      if (nodeVersion && parseFloat(nodeVersion) < 16) {
        recommendations.push({
          type: 'info',
          field: 'engines.node',
          message: 'Consider updating minimum Node.js version',
          suggestion: 'Node.js 16+ provides better performance and security'
        })
      }
    }

    // Module system recommendations
    if (!pkg.type && !pkg.main?.endsWith('.mjs')) {
      recommendations.push({
        type: 'info',
        field: 'type',
        message: 'Consider specifying module type',
        suggestion: 'Add "type": "module" for ES modules or "type": "commonjs" for CommonJS'
      })
    }

    // TypeScript recommendations
    if (pkg.devDependencies?.typescript && !pkg.main?.endsWith('.d.ts') && !pkg.types) {
      recommendations.push({
        type: 'info',
        field: 'types',
        message: 'TypeScript types not exposed',
        suggestion: 'Add "types" field pointing to your declaration file'
      })
    }

    return recommendations
  }, [])

  // Calculate package statistics
  const calculateStats = useCallback((pkg: PackageJson) => {
    const dependencies = Object.keys(pkg.dependencies || {}).length
    const devDependencies = Object.keys(pkg.devDependencies || {}).length
    const peerDependencies = Object.keys(pkg.peerDependencies || {}).length
    const optionalDependencies = Object.keys(pkg.optionalDependencies || {}).length
    const scripts = Object.keys(pkg.scripts || {}).length

    // Rough bundle size estimation
    const estimateSize = (deps: number) => {
      if (deps === 0) return '< 1KB'
      if (deps < 5) return '< 50KB'
      if (deps < 15) return '< 200KB'
      if (deps < 30) return '< 500KB'
      if (deps < 50) return '< 1MB'
      return '> 1MB'
    }

    return {
      totalDependencies: dependencies + devDependencies + peerDependencies + optionalDependencies,
      devDependencies,
      peerDependencies,
      optionalDependencies,
      scripts,
      estimatedSize: estimateSize(dependencies)
    }
  }, [])

  // Main analysis function
  const analyzePackageJson = useCallback(() => {
    if (!input.trim()) {
      setResults(null)
      return
    }

    try {
      const packageData = JSON.parse(input) as PackageJson
      
      const validationIssues = validatePackageJson(packageData)
      const dependencyAnalysis = analyzeDependencies(packageData)
      const securityIssues = analyzeSecurityIssues(packageData)
      const recommendations = generateRecommendations(packageData)
      const stats = calculateStats(packageData)

      const isValid = !validationIssues.some(issue => issue.type === 'error')

      setResults({
        isValid,
        packageData,
        validationIssues,
        dependencyAnalysis,
        securityIssues,
        recommendations,
        stats
      })

      // Add to history
      addToHistory('/package-json', 'Package.json Validator', '📦')
      
      // Trigger share widget after successful analysis
      shareState.triggerShare()

    } catch (error) {
      setResults({
        isValid: false,
        validationIssues: [{
          type: 'error',
          field: 'JSON',
          message: 'Invalid JSON format',
          suggestion: 'Check for syntax errors, missing commas, or invalid characters'
        }],
        dependencyAnalysis: [],
        securityIssues: [],
        recommendations: [],
        stats: {
          totalDependencies: 0,
          devDependencies: 0,
          peerDependencies: 0,
          optionalDependencies: 0,
          scripts: 0,
          estimatedSize: '0KB'
        }
      })
    }
  }, [input, validatePackageJson, analyzeDependencies, analyzeSecurityIssues, generateRecommendations, calculateStats, addToHistory])

  // Auto-analyze when input changes
  React.useEffect(() => {
    const timeoutId = setTimeout(analyzePackageJson, 500)
    return () => clearTimeout(timeoutId)
  }, [input, analyzePackageJson])

  const handleClear = () => {
    setInput('')
    setResults(null)
  }

  const handleLoadExample = () => {
    const examplePackage = {
      name: "my-awesome-package",
      version: "1.0.0",
      description: "A sample package.json for demonstration",
      main: "index.js",
      scripts: {
        start: "node index.js",
        test: "jest",
        build: "webpack --mode production",
        dev: "webpack serve --mode development"
      },
      keywords: ["javascript", "node", "example"],
      author: "Your Name <your.email@example.com>",
      license: "MIT",
      repository: {
        type: "git",
        url: "https://github.com/username/my-awesome-package"
      },
      dependencies: {
        express: "^4.18.0",
        lodash: "^4.17.21",
        moment: "^2.29.0"
      },
      devDependencies: {
        jest: "^29.0.0",
        webpack: "^5.74.0",
        "@types/node": "^18.0.0"
      },
      engines: {
        node: ">=16.0.0",
        npm: ">=8.0.0"
      }
    }
    setInput(JSON.stringify(examplePackage, null, 2))
  }

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
    }
  }

  const getIssueColor = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📦</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Package.json Validator & Analyzer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Validate structure, analyze dependencies, and get security recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite('/package-json')}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            {shareState.isVisible && (
              <ShareWidget 
                toolName="Package.json Validator"
                isVisible={shareState.isVisible}
                onClose={shareState.hideShare}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Package.json Content
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleLoadExample}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Load Example
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your package.json content here..."
              className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {results && (
              <>
                {/* Status Overview */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  results.isValid 
                    ? 'bg-green-50 dark:bg-green-900 border-green-400' 
                    : 'bg-red-50 dark:bg-red-900 border-red-400'
                }`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {results.isValid ? '✅' : '❌'}
                    </span>
                    <div>
                      <h3 className="font-medium">
                        {results.isValid ? 'Valid Package.json' : 'Invalid Package.json'}
                      </h3>
                      <p className="text-sm opacity-75">
                        {results.isValid 
                          ? 'Structure is valid with some recommendations'
                          : 'Contains errors that need to be fixed'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package Statistics */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">📊 Package Statistics</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>Total Dependencies: <span className="font-medium">{results.stats.totalDependencies}</span></div>
                    <div>Dev Dependencies: <span className="font-medium">{results.stats.devDependencies}</span></div>
                    <div>Scripts: <span className="font-medium">{results.stats.scripts}</span></div>
                    <div>Estimated Size: <span className="font-medium">{results.stats.estimatedSize}</span></div>
                  </div>
                </div>
              </>
            )}

            {/* Analysis Results Tabs would go here - for now showing scrollable content */}
            {results && (
              <div className="h-96 overflow-y-auto space-y-4">
                {/* Validation Issues */}
                {results.validationIssues.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">🔍 Validation Issues</h3>
                    <div className="space-y-2">
                      {results.validationIssues.map((issue, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-gray-300">
                          <div className="flex items-start space-x-2">
                            <span>{getIssueIcon(issue.type)}</span>
                            <div className="flex-1">
                              <div className={`font-medium ${getIssueColor(issue.type)}`}>
                                {issue.field}: {issue.message}
                              </div>
                              {issue.suggestion && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  💡 {issue.suggestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Issues */}
                {results.securityIssues.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">🔒 Security Analysis</h3>
                    <div className="space-y-2">
                      {results.securityIssues.map((issue, index) => (
                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900 rounded border-l-4 border-red-300">
                          <div className="flex items-start space-x-2">
                            <span>{getIssueIcon(issue.type)}</span>
                            <div className="flex-1">
                              <div className={`font-medium ${getIssueColor(issue.type)}`}>
                                {issue.field}: {issue.message}
                              </div>
                              {issue.suggestion && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  💡 {issue.suggestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependency Analysis */}
                {results.dependencyAnalysis.filter(dep => dep.issues.length > 0 || dep.suggestions.length > 0).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">📦 Dependency Analysis</h3>
                    <div className="space-y-2">
                      {results.dependencyAnalysis
                        .filter(dep => dep.issues.length > 0 || dep.suggestions.length > 0)
                        .map((dep, index) => (
                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded border-l-4 border-yellow-300">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">
                            {dep.name}@{dep.currentVersion} ({dep.type})
                          </div>
                          {dep.issues.map((issue, i) => (
                            <div key={i} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              ⚠️ {issue}
                            </div>
                          ))}
                          {dep.suggestions.map((suggestion, i) => (
                            <div key={i} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              💡 {suggestion}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">💡 Recommendations</h3>
                    <div className="space-y-2">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900 rounded border-l-4 border-blue-300">
                          <div className="flex items-start space-x-2">
                            <span>{getIssueIcon(rec.type)}</span>
                            <div className="flex-1">
                              <div className={`font-medium ${getIssueColor(rec.type)}`}>
                                {rec.field}: {rec.message}
                              </div>
                              {rec.suggestion && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  💡 {rec.suggestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageJsonTool