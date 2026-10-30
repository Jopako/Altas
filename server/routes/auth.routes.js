import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação
 */

// OAuth Microsoft
router.get('/microsoft',           authCtrl.microsoftRedirect);
router.get('/microsoft/callback',  authCtrl.microsoftCallback);

// OAuth Google (mantido se quiser ativar futuramente)
router.get('/google',              authCtrl.googleRedirect);
router.get('/google/callback',     authCtrl.googleCallback);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login com e-mail e senha (legado)
 *     tags: [Auth]
 */
router.post('/login', authCtrl.login);

// /register foi removido — autenticação é apenas via OAuth Microsoft.

/**
 * @swagger
 * /api/auth/favorites:
 *   get:
 *     summary: Lista favoritos
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/favorites',           authMiddleware, authCtrl.getFavorites);
router.post('/favorites/toggle',   authMiddleware, authCtrl.toggleFavorite);

export default router;
