import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = 3000

const server = http.createServer((req, res) => {
  console.log('Request:', req.url)
  
  let filePath = path.join(__dirname, 'dist')
  
  if (req.url === '/dev-tools/' || req.url === '/dev-tools') {
    filePath = path.join(filePath, 'index.html')
  } else if (req.url.startsWith('/dev-tools/')) {
    filePath = path.join(filePath, req.url.replace('/dev-tools/', ''))
  } else {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  
  if (req.url.includes('..')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('File not found')
      return
    }
    
    const ext = path.extname(filePath)
    let contentType = 'text/html'
    
    if (ext === '.css') contentType = 'text/css'
    else if (ext === '.js') contentType = 'application/javascript'
    else if (ext === '.json') contentType = 'application/json'
    
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/dev-tools/`)
})