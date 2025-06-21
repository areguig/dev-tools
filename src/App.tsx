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
import { ThemeProvider } from './contexts/ThemeContext'
import { FavoritesProvider } from './contexts/FavoritesContext'

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
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
            </Routes>
          </Layout>
        </Router>
      </FavoritesProvider>
    </ThemeProvider>
  )
}

export default App
