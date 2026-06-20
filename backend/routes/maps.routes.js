import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import * as mapsCtrl from '../controllers/maps.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads/images')),
    filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Maps
 *   description: Gerenciamento de mapas
 */


/**
 * @swagger
 * /api/maps/upload-image:
 *   post:
 *     summary: Upload de mapa
 *     tags: [Maps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload realizado
 */

router.post('/upload-image',     authMiddleware, adminMiddleware, upload.single('image'), mapsCtrl.uploadImage);

/**
 * @swagger
 * /api/maps/upload-poi-photo:
 *   post:
 *     summary: Upload de foto de POI
 *     tags: [Maps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto enviada
 */

router.post('/upload-poi-photo', authMiddleware, adminMiddleware, upload.single('image'), mapsCtrl.uploadPoiPhoto);

/**
 * @swagger
 * /api/maps:
 *   get:
 *     summary: Listar mapas
 *     tags: [Maps]
 *     responses:
 *       200:
 *         description: Lista de mapas
 */

router.get('/',                  mapsCtrl.listMaps);

/**
 * @swagger
 * /api/maps/{id}:
 *   get:
 *     summary: Buscar mapa
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mapa encontrado
 */

router.get('/:id',               mapsCtrl.getMap);

/**
 * @swagger
 * /api/maps/{id}/features:
 *   put:
 *     summary: Salvar features
 *     tags: [Maps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Features salvas
 */

router.put('/:id/features',      authMiddleware, adminMiddleware, mapsCtrl.saveFeatures);

export default router;
