import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Base64Tool from './tools/Base64Tool'
import JWTTool from './tools/JWTTool'
import JSONTool from './tools/JSONTool'
import XMLTool from './tools/XMLTool'
import YAMLTool from './tools/YAMLTool'
import DiffTool from './tools/DiffTool'
import URLTool from './tools/URLTool'
import HashTool from './tools/HashTool'
import PasswordTool from './tools/PasswordTool'
import URLShortenerTool from './tools/URLShortenerTool'
import QRCodeTool from './tools/QRCodeTool'
import LoremTool from './tools/LoremTool'
import ColorTool from './tools/ColorTool'
import TimestampTool from './tools/TimestampTool'
import RegexTool from './tools/RegexTool'
import UUIDTool from './tools/UUIDTool'
import HTMLEntityTool from './tools/HTMLEntityTool'
import TextCaseTool from './tools/TextCaseTool'
import ImageBase64Tool from './tools/ImageBase64Tool'
import CSSFormatterTool from './tools/CSSFormatterTool'
import SQLFormatterTool from './tools/SQLFormatterTool'
import APITestTool from './tools/APITestTool'
import CronBuilderTool from './tools/CronBuilderTool'
import MarkdownTool from './tools/MarkdownTool'
import JavaScriptFormatterTool from './tools/JavaScriptFormatterTool'
import JWTGeneratorTool from './tools/JWTGeneratorTool'
import EnvVarsTool from './tools/EnvVarsTool'
import { ThemeProvider } from './contexts/ThemeContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { HistoryProvider } from './contexts/HistoryContext'
import { ShareAnalyticsProvider } from './contexts/ShareAnalyticsContext'

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <HistoryProvider>
          <ShareAnalyticsProvider>
            <Router basename="/dev-tools">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/base64" element={<Base64Tool />} />
                <Route path="/jwt" element={<JWTTool />} />
                <Route path="/json" element={<JSONTool />} />
                <Route path="/xml" element={<XMLTool />} />
                <Route path="/yaml" element={<YAMLTool />} />
                <Route path="/diff" element={<DiffTool />} />
                <Route path="/url" element={<URLTool />} />
                <Route path="/hash" element={<HashTool />} />
                <Route path="/password" element={<PasswordTool />} />
                <Route path="/url-shortener" element={<URLShortenerTool />} />
                <Route path="/qr-code" element={<QRCodeTool />} />
                <Route path="/lorem" element={<LoremTool />} />
                <Route path="/color" element={<ColorTool />} />
                <Route path="/timestamp" element={<TimestampTool />} />
                <Route path="/regex" element={<RegexTool />} />
                <Route path="/uuid" element={<UUIDTool />} />
                <Route path="/html-entity" element={<HTMLEntityTool />} />
                <Route path="/text-case" element={<TextCaseTool />} />
                <Route path="/image-base64" element={<ImageBase64Tool />} />
                <Route path="/css-formatter" element={<CSSFormatterTool />} />
                <Route path="/sql-formatter" element={<SQLFormatterTool />} />
                <Route path="/api-test" element={<APITestTool />} />
                <Route path="/cron-builder" element={<CronBuilderTool />} />
                <Route path="/markdown" element={<MarkdownTool />} />
                <Route path="/js-formatter" element={<JavaScriptFormatterTool />} />
                <Route path="/jwt-generator" element={<JWTGeneratorTool />} />
                <Route path="/env-vars" element={<EnvVarsTool />} />
              </Routes>
            </Layout>
            </Router>
          </ShareAnalyticsProvider>
        </HistoryProvider>
      </FavoritesProvider>
    </ThemeProvider>
  )
}

export default App
