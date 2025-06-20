import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Base64Tool from './tools/Base64Tool'
import JWTTool from './tools/JWTTool'
import JSONTool from './tools/JSONTool'
import XMLTool from './tools/XMLTool'
import YAMLTool from './tools/YAMLTool'
import DiffTool from './tools/DiffTool'
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
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
