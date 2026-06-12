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

router.post('/upload-image',     authMiddleware, adminMiddleware, upload.single('image'), mapsCtrl.uploadImage);
router.post('/upload-poi-photo', authMiddleware, adminMiddleware, upload.single('image'), mapsCtrl.uploadPoiPhoto);
router.get('/',                  mapsCtrl.listMaps);
router.get('/:id',               mapsCtrl.getMap);
router.put('/:id/features',      authMiddleware, adminMiddleware, mapsCtrl.saveFeatures);

export default router;