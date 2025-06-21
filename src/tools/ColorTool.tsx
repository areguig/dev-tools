import { useState, useCallback } from 'react'

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
  name?: string
}

type PaletteType = 'complementary' | 'triadic' | 'analogous' | 'monochromatic' | 'split-complementary' | 'tetradic'
type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv'

const ColorTool = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6')
  const [palette, setPalette] = useState<Color[]>([])
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary')
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex')
  const [inputColor, setInputColor] = useState('#3B82F6')
  const [copied, setCopied] = useState('')

  // Color conversion functions
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }, [])

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }, [])

  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }, [])

  const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360
    s /= 100
    l /= 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    if (s === 0) {
      const gray = Math.round(l * 255)
      return { r: gray, g: gray, b: gray }
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
      }
    }
  }, [])

  const rgbToHsv = useCallback((r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
  }, [])

  const createColor = useCallback((hex: string): Color => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    return { hex, rgb, hsl, hsv }
  }, [hexToRgb, rgbToHsl, rgbToHsv])

  const generatePalette = useCallback((baseHex: string, type: PaletteType): Color[] => {
    const base = createColor(baseHex)
    const colors: Color[] = [base]

    switch (type) {
      case 'complementary':
        {
          const rgb = hslToRgb((base.hsl.h + 180) % 360, base.hsl.s, base.hsl.l)
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)))
        }
        break

      case 'triadic':
        {
          const rgb1 = hslToRgb((base.hsl.h + 120) % 360, base.hsl.s, base.hsl.l)
          const rgb2 = hslToRgb((base.hsl.h + 240) % 360, base.hsl.s, base.hsl.l)
          colors.push(createColor(rgbToHex(rgb1.r, rgb1.g, rgb1.b)))
          colors.push(createColor(rgbToHex(rgb2.r, rgb2.g, rgb2.b)))
        }
        break

      case 'analogous':
        for (let i = 1; i <= 4; i++) {
          const rgb = hslToRgb((base.hsl.h + i * 30) % 360, base.hsl.s, base.hsl.l)
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)))
        }
        break

      case 'monochromatic':
        for (let i = 1; i <= 4; i++) {
          const lightness = Math.max(10, Math.min(90, base.hsl.l + (i * 15) - 30))
          const rgb = hslToRgb(base.hsl.h, base.hsl.s, lightness)
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)))
        }
        break

      case 'split-complementary':
        {
          const rgb1 = hslToRgb((base.hsl.h + 150) % 360, base.hsl.s, base.hsl.l)
          const rgb2 = hslToRgb((base.hsl.h + 210) % 360, base.hsl.s, base.hsl.l)
          colors.push(createColor(rgbToHex(rgb1.r, rgb1.g, rgb1.b)))
          colors.push(createColor(rgbToHex(rgb2.r, rgb2.g, rgb2.b)))
        }
        break

      case 'tetradic':
        {
          const rgb1 = hslToRgb((base.hsl.h + 90) % 360, base.hsl.s, base.hsl.l)
          const rgb2 = hslToRgb((base.hsl.h + 180) % 360, base.hsl.s, base.hsl.l)
          const rgb3 = hslToRgb((base.hsl.h + 270) % 360, base.hsl.s, base.hsl.l)
          colors.push(createColor(rgbToHex(rgb1.r, rgb1.g, rgb1.b)))
          colors.push(createColor(rgbToHex(rgb2.r, rgb2.g, rgb2.b)))
          colors.push(createColor(rgbToHex(rgb3.r, rgb3.g, rgb3.b)))
        }
        break
    }

    return colors
  }, [createColor, rgbToHex, hslToRgb])

  const handleColorChange = (color: string) => {
    setBaseColor(color)
    setInputColor(color)
    const newPalette = generatePalette(color, paletteType)
    setPalette(newPalette)
  }

  const handlePaletteTypeChange = (type: PaletteType) => {
    setPaletteType(type)
    const newPalette = generatePalette(baseColor, type)
    setPalette(newPalette)
  }

  const formatColorValue = (color: Color, format: ColorFormat): string => {
    switch (format) {
      case 'hex':
        return color.hex.toUpperCase()
      case 'rgb':
        return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
      case 'hsl':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
      case 'hsv':
        return `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`
      default:
        return color.hex.toUpperCase()
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const copyAllColors = async () => {
    const colorValues = palette.map(color => formatColorValue(color, colorFormat)).join('\n')
    await copyToClipboard(colorValues, 'all')
  }

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    handleColorChange(randomHex)
  }

  const getContrastRatio = (color1: Color, color2: Color): number => {
    const getLuminance = (color: Color) => {
      const { r, g, b } = color.rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Initialize palette on mount
  useState(() => {
    handleColorChange(baseColor)
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Color Palette Generator
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate beautiful color palettes based on color theory. Convert between different color formats and analyze contrast ratios.
          </p>

          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Color Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Base Color
              </h3>
              
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputColor}
                    onChange={(e) => {
                      setInputColor(e.target.value)
                      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        handleColorChange(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3B82F6"
                  />
                </div>
                <button
                  onClick={generateRandomColor}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  🎲 Random
                </button>
              </div>
            </div>

            {/* Palette Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Palette Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Harmony
                </label>
                <select
                  value={paletteType}
                  onChange={(e) => handlePaletteTypeChange(e.target.value as PaletteType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                  <option value="analogous">Analogous</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="split-complementary">Split Complementary</option>
                  <option value="tetradic">Tetradic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Format
                </label>
                <select
                  value={colorFormat}
                  onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                  <option value="hsv">HSV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generated Palette */}
          {palette.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Palette ({paletteType})
                </h3>
                <button
                  onClick={copyAllColors}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    copied === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
                    <div
                      className="w-full h-24 rounded-lg mb-3 border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-2">
                      <button
                        onClick={() => copyToClipboard(formatColorValue(color, colorFormat), `color-${index}`)}
                        className={`w-full text-left font-mono text-sm p-2 rounded border transition-colors ${
                          copied === `color-${index}`
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {formatColorValue(color, colorFormat)}
                      </button>
                      
                      {/* Contrast info with white/black text */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div>White: {getContrastRatio(color, createColor('#FFFFFF')).toFixed(1)}:1</div>
                        <div>Black: {getContrastRatio(color, createColor('#000000')).toFixed(1)}:1</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Converter */}
          {baseColor && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Color Conversions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['hex', 'rgb', 'hsl', 'hsv'] as ColorFormat[]).map(format => (
                  <div key={format} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                      {format}
                    </label>
                    <button
                      onClick={() => copyToClipboard(formatColorValue(createColor(baseColor), format), `convert-${format}`)}
                      className={`w-full text-left font-mono text-sm p-3 rounded border transition-colors ${
                        copied === `convert-${format}`
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {formatColorValue(createColor(baseColor), format)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Theory Info */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Color Harmony Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Complementary</div>
                <div className="text-blue-700 dark:text-blue-300">Colors opposite on the color wheel</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Triadic</div>
                <div className="text-blue-700 dark:text-blue-300">Three colors evenly spaced on the wheel</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Analogous</div>
                <div className="text-blue-700 dark:text-blue-300">Colors next to each other on the wheel</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Monochromatic</div>
                <div className="text-blue-700 dark:text-blue-300">Different shades of the same color</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Split Complementary</div>
                <div className="text-blue-700 dark:text-blue-300">Base color plus two adjacent to its complement</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Tetradic</div>
                <div className="text-blue-700 dark:text-blue-300">Four colors forming a rectangle on the wheel</div>
              </div>
            </div>
          </div>

          {/* Accessibility Info */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Accessibility Guidelines
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• <strong>AA Normal:</strong> Contrast ratio of at least 4.5:1</li>
              <li>• <strong>AA Large:</strong> Contrast ratio of at least 3:1 for large text</li>
              <li>• <strong>AAA Normal:</strong> Contrast ratio of at least 7:1</li>
              <li>• <strong>AAA Large:</strong> Contrast ratio of at least 4.5:1 for large text</li>
              <li>• Use color palette tools to ensure your designs are accessible to all users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorTool