/**
 * workspaces.routes.js — Rotas do workspace compartilhado.
 *
 * GET  /api/workspaces/public  → workspace público (sem auth)
 * GET  /api/workspaces/me      → workspace do admin logado (auth)
 * PUT  /api/workspaces/me      → salvar/atualizar workspace (auth)
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as wsCtrl from '../controllers/workspaces.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) =>
      cb(null, path.join(__dirname, '../uploads/images')),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const router = Router();

// Pública — usada por visitantes e QR codes
router.get('/public', wsCtrl.getPublic);

// Autenticadas — basta estar logado (o authMiddleware já garante isso)
router.get('/me', authMiddleware, wsCtrl.getMe);
router.put('/me', authMiddleware, wsCtrl.putMe);

// Upload de imagem de bloco (retorna URL relativa para guardar em blockMeta)
router.post(
  '/me/upload-image',
  authMiddleware,
  upload.single('image'),
  wsCtrl.uploadBlockImage
);

export default router;