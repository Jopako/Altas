import express from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import multer from 'multer';
import { extractPaths } from './pdfExtractor.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'users.json');

const saveOrUpdateUser = (profile) => {
  let users = [];
  if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }

  let role = 'comum';
  if (profile.email.endsWith('@ifc.edu.br')) {
    role = 'admin';
  }

  const existingUserIndex = users.findIndex((u) => u.email === profile.email);
  const userData = { email: profile.email, name: profile.name, role };

  if (existingUserIndex >= 0) {
    users[existingUserIndex] = userData;
  } else {
    users.push(userData);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  return userData;
};

const port = Number(process.env.PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ================= GOOGLE OAUTH =================
app.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${port}/auth/google/callback&response_type=code&scope=profile email`;
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: `http://localhost:${port}/auth/google/callback`,
      grant_type: 'authorization_code',
    });

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });

    const user = saveOrUpdateUser(userInfo.data);
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });
    res.redirect(`${frontendUrl}/callback?token=${jwtToken}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

// ================= MICROSOFT OAUTH =================
app.get('/auth/microsoft', (req, res) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MS_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:${port}/auth/microsoft/callback&response_mode=query&scope=user.read`;
  res.redirect(url);
});

app.get('/auth/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const params = new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID,
      scope: 'user.read',
      code,
      redirect_uri: `http://localhost:${port}/auth/microsoft/callback`,
      grant_type: 'authorization_code',
      client_secret: process.env.MS_CLIENT_SECRET,
    });

    const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const userInfo = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });

    const userProfile = {
      name: userInfo.data.displayName,
      email: userInfo.data.mail || userInfo.data.userPrincipalName,
    };

    const user = saveOrUpdateUser(userProfile);
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });
    res.redirect(`${frontendUrl}/callback?token=${jwtToken}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

// ================= API DE PDF =================
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

function resolveLibraryDir() {
  const candidates = [
    process.env.ALTAS_LIBRARY_DIR,
    path.join(__dirname, 'plantasPredios'),
    path.join(__dirname, '../../K - Biblioteca'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // ignora e tenta o próximo
    }
  }
  return null;
}

function safePdfName(fileName) {
  const base = path.basename(fileName || '');
  if (!base.toLowerCase().endsWith('.pdf')) return null;
  if (base.includes('\0')) return null;
  return base;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, libraryDir: resolveLibraryDir() });
});

app.get('/api/library', async (req, res) => {
  try {
    const libDir = resolveLibraryDir();
    if (!libDir) return res.json([]);
    const files = fs.readdirSync(libDir).filter((file) => file.toLowerCase().endsWith('.pdf'));
    res.json(files);
  } catch (err) {
    console.error('Erro na biblioteca:', err);
    res.status(500).json({ error: 'Erro ao listar biblioteca.' });
  }
});

app.get('/api/pdf/load-local', async (req, res) => {
  try {
    const fileName = safePdfName(req.query.file);
    if (!fileName) return res.status(400).json({ error: 'Arquivo inválido.' });

    const libDir = resolveLibraryDir();
    if (!libDir) return res.status(404).json({ error: 'Biblioteca não encontrada.' });

    const filePath = path.join(libDir, fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' });

    console.log('📄 Processando PDF local:', filePath);
    const geojson = await extractPaths(filePath);
    res.json(geojson);
  } catch (err) {
    console.error('Erro na extração local:', err);
    res.status(500).json({ error: 'Erro ao processar o PDF local.' });
  }
});

app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    console.log('📄 Processando PDF upload:', req.file.path);
    const geojson = await extractPaths(req.file.path);
    res.json(geojson);
  } catch (err) {
    console.error('Erro na extração:', err);
    res.status(500).json({ error: 'Erro ao processar o PDF.' });
  }
});

// ================= START =================
app.listen(port, () => {
  console.log(`🚀 ALTAS backend rodando em http://localhost:${port}`);
});
