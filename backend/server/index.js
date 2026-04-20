import cors from 'cors'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractPaths } from './services/pdfExtractor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

const uploadDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({ dest: uploadDir })

app.use(
  cors({
    origin: true,
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    libraryDir: resolveLibraryDir(),
  })
})

function resolveLibraryDir() {
  const candidates = [
    process.env.ALTAS_LIBRARY_DIR,
    path.join(__dirname, '../../K - Biblioteca'),
    path.join(__dirname, '../../../testeView/K - Biblioteca'),
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate
      }
    } catch {
      // ignore and try next candidate
    }
  }
  return null
}

function safePdfName(fileName) {
  const base = path.basename(fileName || '')
  if (!base.toLowerCase().endsWith('.pdf')) return null
  if (base.includes('\0')) return null
  return base
}

app.get('/api/library', async (req, res) => {
  try {
    const libDir = resolveLibraryDir()
    if (!libDir) return res.json([])

    const files = fs.readdirSync(libDir).filter((file) => file.toLowerCase().endsWith('.pdf'))
    res.json(files)
  } catch (err) {
    console.error('Erro na biblioteca:', err)
    res.status(500).json({ error: 'Erro ao listar biblioteca.' })
  }
})

app.get('/api/pdf/load-local', async (req, res) => {
  try {
    const fileName = safePdfName(req.query.file)
    if (!fileName) return res.status(400).json({ error: 'Arquivo inválido.' })

    const libDir = resolveLibraryDir()
    if (!libDir) return res.status(404).json({ error: 'Biblioteca não encontrada.' })

    const filePath = path.join(libDir, fileName)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' })

    console.log('📄 Processando PDF Local:', filePath)
    const geojson = await extractPaths(filePath)
    res.json(geojson)
  } catch (err) {
    console.error('Erro na extração local:', err)
    res.status(500).json({ error: 'Erro ao processar o PDF local.' })
  }
})

app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' })

    console.log('📄 Processando PDF Upload:', req.file.path)
    const geojson = await extractPaths(req.file.path)
    res.json(geojson)
  } catch (err) {
    console.error('Erro na extração:', err)
    res.status(500).json({ error: 'Erro ao processar o PDF.' })
  }
})

const distDir = path.join(__dirname, '../../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const PORT = Number(process.env.PORT || 3001)
const server = app.listen(PORT, () => {
  console.log(`🚀 ALTAS backend rodando em http://localhost:${PORT}`)
})
server.on('error', (err) => {
  console.error('❌ Falha ao iniciar backend:', err)
  process.exitCode = 1
})
