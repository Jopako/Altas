import express from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './users.json';

// Função para simular o banco de dados
const saveOrUpdateUser = (profile) => {
  let users = [];
  if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }

  // Lógica de Permissão
  let role = 'comum';
  if (profile.email.endsWith('@ifc.edu.br')) {
    role = 'admin';
  } // Se for @estudantes.ifc.edu.br ou qualquer outro, fica 'comum'

  const existingUserIndex = users.findIndex(u => u.email === profile.email);
  const userData = { email: profile.email, name: profile.name, role };

  if (existingUserIndex >= 0) {
    users[existingUserIndex] = userData;
  } else {
    users.push(userData);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  return userData;
};

// ================= GOOGLE OAUTH =================
app.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=profile email`;
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:3000/auth/google/callback',
      grant_type: 'authorization_code'
    });

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    const user = saveOrUpdateUser(userInfo.data);
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    // Redireciona de volta para o frontend com o token
    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${jwtToken}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// ================= MICROSOFT OAUTH =================
app.get('/auth/microsoft', (req, res) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MS_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/auth/microsoft/callback&response_mode=query&scope=user.read`;
  res.redirect(url);
});

app.get('/auth/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const params = new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID,
      scope: 'user.read',
      code,
      redirect_uri: 'http://localhost:3000/auth/microsoft/callback',
      grant_type: 'authorization_code',
      client_secret: process.env.MS_CLIENT_SECRET
    });

    const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userInfo = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    const userProfile = {
      name: userInfo.data.displayName,
      email: userInfo.data.mail || userInfo.data.userPrincipalName
    };

    const user = saveOrUpdateUser(userProfile);
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${jwtToken}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend rodando na porta ${process.env.PORT}`);
});