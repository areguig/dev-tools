import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useHistory } from '../contexts/HistoryContext'

const TOOL_NAMES: { [key: string]: { name: string; icon: string } } = {
  '/base64': { name: 'Base64 Encoder/Decoder', icon: '🔤' },
  '/jwt': { name: 'JWT Token Decoder', icon: '🔐' },
  '/json': { name: 'JSON Formatter', icon: '📋' },
  '/xml': { name: 'XML Formatter', icon: '📄' },
  '/yaml': { name: 'YAML Validator', icon: '📝' },
  '/diff': { name: 'Text Diff Tool', icon: '📊' },
  '/url': { name: 'URL Encoder/Decoder', icon: '🔗' },
  '/hash': { name: 'Hash Generator', icon: '🔑' },
  '/password': { name: 'Password Generator', icon: '🛡️' },
  '/url-shortener': { name: 'URL Shortener', icon: '🔗' },
  '/qr-code': { name: 'QR Code Generator', icon: '📱' },
  '/lorem': { name: 'Lorem Ipsum Generator', icon: '📝' },
  '/color': { name: 'Color Palette Generator', icon: '🎨' },
  '/timestamp': { name: 'Timestamp Converter', icon: '⏰' },
  '/regex': { name: 'Regex Tester', icon: '🔍' },
  '/uuid': { name: 'UUID/GUID Generator', icon: '🆔' },
  '/html-entity': { name: 'HTML Entity Encoder', icon: '🏷️' },
  '/text-case': { name: 'Text Case Converter', icon: '📝' },
  '/image-base64': { name: 'Image to Base64 Converter', icon: '🖼️' }
}

const ToolTracker = () => {
  const location = useLocation()
  const { addToHistory } = useHistory()

  useEffect(() => {
    const toolInfo = TOOL_NAMES[location.pathname]
    if (toolInfo) {
      addToHistory(location.pathname, toolInfo.name, toolInfo.icon)
    }
  }, [location.pathname, addToHistory])

  return null // This component doesn't render anything
}

export default ToolTracker