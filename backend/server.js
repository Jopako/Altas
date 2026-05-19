import express from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'users.json');

// Lista de e-mails específicos que devem ser administradores do sistema
const ADMIN_EMAILS = [
  'juliabaldissera06@gmail.com',
  'julia.baldissera@estudantes.ifc.edu.br',
  'samuelcastilhopereira@gmail.com',
  'samuel.pereira@estudantes.ifc.edu.br'
];

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const saveOrUpdateUser = (profile) => {
  let users = [];
  if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }

  // Normaliza o e-mail para letras minúsculas para evitar problemas de digitação
  const userEmail = profile.email.toLowerCase();

  let role = 'visitante';
  
  // Regra 1: Se o e-mail estiver na lista de admins permitidos OU
  // Regra 2: Se for um e-mail do domínio geral dos servidores do IFC
  if (ADMIN_EMAILS.includes(userEmail) || userEmail.endsWith('@ifc.edu.br')) {
    role = 'admin';
  }

  const existingUserIndex = users.findIndex((u) => u.email.toLowerCase() === userEmail);
  const userData = { email: profile.email, name: profile.name, role };

  if (existingUserIndex >= 0) {
    // Preserve any existing password if it exists
    if (users[existingUserIndex].password) {
      userData.password = users[existingUserIndex].password;
    }
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

// ================= STANDARD AUTH =================

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos (nome, e-mail e senha) são obrigatórios.' });
    }

    const userEmail = email.toLowerCase().trim();
    if (userEmail.endsWith('@estudantes.ifc.edu.br') || userEmail.endsWith('@ifc.edu.br')) {
      return res.status(400).json({ error: 'Contas institucionais (@estudantes.ifc.edu.br ou @ifc.edu.br) devem obrigatoriamente utilizar o login com Microsoft.' });
    }

    let users = [];
    if (fs.existsSync(DB_FILE)) {
      users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === userEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const newUser = {
      email: userEmail,
      name: name.trim(),
      role: 'visitante',
      password: hashPassword(password),
    };

    users.push(newUser);
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));

    // Sign token (without the password field)
    const userPayload = { email: newUser.email, name: newUser.name, role: newUser.role };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao realizar cadastro.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const userEmail = email.toLowerCase().trim();
    let users = [];
    if (fs.existsSync(DB_FILE)) {
      users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    const user = users.find((u) => u.email.toLowerCase() === userEmail);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos, ou usuário cadastrado via OAuth.' });
    }

    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const userPayload = { email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// ================= API DE MAPAS =================

const uploadDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const mapsDir = path.join(uploadDir, 'maps');

fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(mapsDir, { recursive: true });

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


// ================= AUTH MIDDLEWARE =================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não enviado.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret'
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      error: 'Token inválido.',
    });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Apenas admins.',
    });
  }

  next();
}


// ================= HEALTH =================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
  });
});


// ================= UPLOAD MAPA =================

app.post(
  '/api/maps/upload-image',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Nenhuma imagem enviada.',
        });
      }

      const mapId = Date.now().toString();

      const mapData = {
        id: mapId,
        name: req.body.name || 'Mapa sem nome',
        imageUrl: `/uploads/images/${req.file.filename}`,
        creatorName: req.user?.name || req.user?.email || 'Administrador',
        features: {
          type: 'FeatureCollection',
          features: [],
        },
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync(
        path.join(mapsDir, `${mapId}.json`),
        JSON.stringify(mapData, null, 2)
      );

      res.json(mapData);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: 'Erro ao enviar imagem.',
      });
    }
  }
);


// ================= LISTAR MAPAS =================

app.get('/api/maps', (req, res) => {
  try {
    const files = fs.readdirSync(mapsDir);

    const maps = files.map((file) => {
      const raw = fs.readFileSync(
        path.join(mapsDir, file),
        'utf8'
      );

      return JSON.parse(raw);
    });

    res.json(maps);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao listar mapas.',
    });
  }
});


// ================= PEGAR MAPA =================

app.get('/api/maps/:id', (req, res) => {
  try {
    const filePath = path.join(
      mapsDir,
      `${req.params.id}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Mapa não encontrado.',
      });
    }

    const raw = fs.readFileSync(filePath, 'utf8');

    res.json(JSON.parse(raw));

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao carregar mapa.',
    });
  }
});


// ================= SALVAR GEOJSON =================

app.put(
  '/api/maps/:id/features',
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    try {
      const filePath = path.join(
        mapsDir,
        `${req.params.id}.json`
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'Mapa não encontrado.',
        });
      }

      const mapData = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
      );

      mapData.features = req.body;

      fs.writeFileSync(
        filePath,
        JSON.stringify(mapData, null, 2)
      );

      res.json({
        success: true,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: 'Erro ao salvar features.',
      });
    }
  }
);

// ================= START =================
app.listen(port, () => {
  console.log(`🚀 ALTAS backend rodando em http://localhost:${port}`);
});