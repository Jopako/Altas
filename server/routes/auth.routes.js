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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login tradicional com e-mail e senha
 *     tags: [Auth]
 */
router.post('/login', authCtrl.login);

// /register e OAuth Google foram removidos — autenticação apenas via Microsoft e Login Direto.

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
