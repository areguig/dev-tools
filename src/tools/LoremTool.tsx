import { useState, useCallback } from 'react'

type GenerationType = 'words' | 'sentences' | 'paragraphs'
type LoremType = 'classic' | 'hipster' | 'tech' | 'business' | 'casual'

const LoremTool = () => {
  const [output, setOutput] = useState('')
  const [generationType, setGenerationType] = useState<GenerationType>('paragraphs')
  const [loremType, setLoremType] = useState<LoremType>('classic')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [copied, setCopied] = useState(false)

  const loremSets = {
    classic: {
      words: [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'mauris', 'blandit',
        'aliquet', 'at', 'volutpat', 'maecenas', 'volutpat', 'blandit', 'aliquam',
        'etiam', 'tempor', 'orci', 'eu', 'lobortis', 'elementum', 'nibh', 'tellus'
      ],
      starter: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
    },
    hipster: {
      words: [
        'artisan', 'authentic', 'brooklyn', 'craft', 'organic', 'sustainable', 'vintage',
        'aesthetic', 'minimalist', 'curated', 'handcrafted', 'bespoke', 'artisanal',
        'locally', 'sourced', 'farm-to-table', 'small-batch', 'single-origin',
        'cold-pressed', 'kombucha', 'quinoa', 'kale', 'avocado', 'toast', 'bicycle',
        'fixie', 'vinyl', 'analog', 'polaroid', 'mason', 'jar', 'beard', 'mustache',
        'flannel', 'denim', 'leather', 'boots', 'coffee', 'roasters', 'third-wave',
        'pour-over', 'chemex', 'aeropress', 'espresso', 'latte', 'macchiato',
        'cappuccino', 'cortado', 'flat', 'white', 'nitro', 'cold', 'brew', 'matcha',
        'chai', 'turmeric', 'adaptogenic', 'mindful', 'wellness', 'meditation'
      ],
      starter: 'Artisan craft beer authentic brooklyn, sustainable organic'
    },
    tech: {
      words: [
        'algorithm', 'api', 'framework', 'database', 'server', 'client', 'frontend',
        'backend', 'fullstack', 'responsive', 'scalable', 'microservices', 'cloud',
        'kubernetes', 'docker', 'container', 'deployment', 'continuous', 'integration',
        'devops', 'agile', 'scrum', 'sprint', 'kanban', 'repository', 'version',
        'control', 'git', 'branch', 'merge', 'commit', 'pull', 'request', 'code',
        'review', 'testing', 'automation', 'machine', 'learning', 'artificial',
        'intelligence', 'neural', 'network', 'blockchain', 'cryptocurrency',
        'javascript', 'python', 'react', 'node', 'typescript', 'mongodb', 'sql',
        'nosql', 'redis', 'elasticsearch', 'graphql', 'rest', 'json', 'xml', 'yaml'
      ],
      starter: 'Advanced algorithm implementation utilizing scalable microservices architecture'
    },
    business: {
      words: [
        'strategy', 'synergy', 'leverage', 'optimize', 'maximize', 'streamline',
        'efficiency', 'productivity', 'innovation', 'disruption', 'transformation',
        'digital', 'analytics', 'insights', 'metrics', 'kpi', 'roi', 'revenue',
        'growth', 'market', 'share', 'competitive', 'advantage', 'stakeholder',
        'customer', 'engagement', 'retention', 'acquisition', 'conversion',
        'funnel', 'pipeline', 'forecast', 'budget', 'allocation', 'resources',
        'human', 'capital', 'talent', 'recruitment', 'onboarding', 'performance',
        'management', 'leadership', 'governance', 'compliance', 'risk', 'mitigation',
        'sustainability', 'corporate', 'responsibility', 'brand', 'positioning',
        'value', 'proposition', 'ecosystem', 'partnership', 'collaboration'
      ],
      starter: 'Strategic synergy leveraging innovative solutions to optimize business efficiency'
    },
    casual: {
      words: [
        'awesome', 'cool', 'amazing', 'fantastic', 'great', 'wonderful', 'excellent',
        'perfect', 'brilliant', 'outstanding', 'incredible', 'spectacular', 'fabulous',
        'marvelous', 'superb', 'terrific', 'magnificent', 'phenomenal', 'exceptional',
        'remarkable', 'impressive', 'stunning', 'beautiful', 'gorgeous', 'lovely',
        'charming', 'delightful', 'pleasant', 'enjoyable', 'fun', 'exciting',
        'thrilling', 'adventurous', 'interesting', 'fascinating', 'captivating',
        'engaging', 'entertaining', 'amusing', 'hilarious', 'funny', 'witty',
        'clever', 'smart', 'brilliant', 'genius', 'creative', 'innovative',
        'original', 'unique', 'special', 'extraordinary', 'uncommon', 'rare',
        'precious', 'valuable', 'worthwhile', 'meaningful', 'significant', 'important'
      ],
      starter: 'This awesome content will be absolutely fantastic and amazing to read'
    }
  }

  const generateWords = useCallback((wordCount: number) => {
    const { words, starter } = loremSets[loremType]
    const result: string[] = []
    
    if (startWithLorem && loremType === 'classic') {
      const starterWords = starter.split(' ')
      result.push(...starterWords)
      wordCount -= starterWords.length
    } else if (startWithLorem && loremType !== 'classic') {
      const starterWords = loremSets[loremType].starter.split(' ')
      result.push(...starterWords)
      wordCount -= starterWords.length
    }

    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      result.push(words[randomIndex])
    }

    return result.join(' ')
  }, [loremType, startWithLorem])

  const generateSentences = useCallback((sentenceCount: number) => {
    const sentences: string[] = []
    
    for (let i = 0; i < sentenceCount; i++) {
      const wordsInSentence = Math.floor(Math.random() * 10) + 8 // 8-17 words per sentence
      const words = generateWords(wordsInSentence).split(' ')
      
      // Capitalize first word
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
      
      // Add some commas randomly
      if (words.length > 10) {
        const commaPositions = Math.floor(Math.random() * 2) + 1
        for (let j = 0; j < commaPositions; j++) {
          const pos = Math.floor(Math.random() * (words.length - 3)) + 2
          words[pos] = words[pos] + ','
        }
      }
      
      sentences.push(words.join(' ') + '.')
    }
    
    return sentences.join(' ')
  }, [generateWords])

  const generateParagraphs = useCallback((paragraphCount: number) => {
    const paragraphs: string[] = []
    
    for (let i = 0; i < paragraphCount; i++) {
      const sentencesInParagraph = Math.floor(Math.random() * 4) + 3 // 3-6 sentences per paragraph
      paragraphs.push(generateSentences(sentencesInParagraph))
    }
    
    return paragraphs.join('\n\n')
  }, [generateSentences])

  const generateText = useCallback(() => {
    let result = ''
    
    switch (generationType) {
      case 'words':
        result = generateWords(count)
        break
      case 'sentences':
        result = generateSentences(count)
        break
      case 'paragraphs':
        result = generateParagraphs(count)
        break
    }
    
    setOutput(result)
    setCopied(false)
  }, [generationType, count, generateWords, generateSentences, generateParagraphs])

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

  const clearOutput = () => {
    setOutput('')
    setCopied(false)
  }

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).length
  }

  const getSentenceCount = (text: string): number => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  }

  const getParagraphCount = (text: string): number => {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Lorem Ipsum Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate placeholder text for your designs and prototypes. Choose from classic Lorem Ipsum or modern alternatives.
          </p>

          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Generation Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generation Options
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Type
                </label>
                <select
                  value={loremType}
                  onChange={(e) => setLoremType(e.target.value as LoremType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="classic">Classic Lorem Ipsum</option>
                  <option value="hipster">Hipster Ipsum</option>
                  <option value="tech">Tech Ipsum</option>
                  <option value="business">Business Ipsum</option>
                  <option value="casual">Casual Ipsum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generate
                </label>
                <select
                  value={generationType}
                  onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="paragraphs">Paragraphs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Count: {count}
                </label>
                <input
                  type="range"
                  min="1"
                  max={generationType === 'words' ? 200 : generationType === 'sentences' ? 50 : 20}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>{generationType === 'words' ? '100' : generationType === 'sentences' ? '25' : '10'}</span>
                  <span>{generationType === 'words' ? '200' : generationType === 'sentences' ? '50' : '20'}</span>
                </div>
              </div>

              {loremType === 'classic' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={startWithLorem}
                    onChange={(e) => setStartWithLorem(e.target.checked)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Start with "Lorem ipsum dolor sit amet..."
                  </span>
                </label>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setGenerationType('paragraphs')
                    setCount(3)
                    setLoremType('classic')
                  }}
                  className="p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="font-medium text-blue-900 dark:text-blue-100 text-sm">Standard</div>
                  <div className="text-blue-700 dark:text-blue-300 text-xs">3 paragraphs</div>
                </button>
                
                <button
                  onClick={() => {
                    setGenerationType('sentences')
                    setCount(5)
                    setLoremType('classic')
                  }}
                  className="p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="font-medium text-green-900 dark:text-green-100 text-sm">Short Text</div>
                  <div className="text-green-700 dark:text-green-300 text-xs">5 sentences</div>
                </button>

                <button
                  onClick={() => {
                    setGenerationType('words')
                    setCount(50)
                    setLoremType('tech')
                  }}
                  className="p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="font-medium text-purple-900 dark:text-purple-100 text-sm">Tech Copy</div>
                  <div className="text-purple-700 dark:text-purple-300 text-xs">50 tech words</div>
                </button>

                <button
                  onClick={() => {
                    setGenerationType('paragraphs')
                    setCount(10)
                    setLoremType('business')
                  }}
                  className="p-3 text-left bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <div className="font-medium text-orange-900 dark:text-orange-100 text-sm">Long Form</div>
                  <div className="text-orange-700 dark:text-orange-300 text-xs">10 paragraphs</div>
                </button>
              </div>

              <button
                onClick={generateText}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Generate Text
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Text
                {output && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {getWordCount(output)} words, {getSentenceCount(output)} sentences, {getParagraphCount(output)} paragraphs
                  </span>
                )}
              </label>
              <div className="flex space-x-2">
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
                <button
                  onClick={clearOutput}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 dark:text-white resize-none"
              placeholder="Generated text will appear here... Click 'Generate Text' to start."
            />
          </div>

          {/* Text Type Examples */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Text Type Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(loremSets).map(([type, data]) => (
                <div key={type} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1 capitalize">
                    {type} Ipsum
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {data.starter}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Lorem Ipsum
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Lorem Ipsum is standard placeholder text used in the printing and typesetting industry</li>
              <li>• It allows designers to focus on layout without being distracted by readable content</li>
              <li>• Classic Lorem Ipsum dates back to the 1500s and is based on Latin text</li>
              <li>• Modern alternatives use contemporary vocabularies for more relevant placeholder text</li>
              <li>• Perfect for mockups, wireframes, and content management systems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoremTool