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
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
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
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
