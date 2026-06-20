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

router.get('/google',              authCtrl.googleRedirect);
router.get('/google/callback',     authCtrl.googleCallback);
router.get('/microsoft',           authCtrl.microsoftRedirect);
router.get('/microsoft/callback',  authCtrl.microsoftCallback);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário criado
 */

router.post('/register',           authCtrl.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado
 */

router.post('/login',              authCtrl.login);

/**
 * @swagger
 * /api/auth/favorites:
 *   get:
 *     summary: Lista favoritos
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 */

router.get('/favorites',           authMiddleware, authCtrl.getFavorites);

/**
 * @swagger
 * /api/auth/favorites/toggle:
 *   post:
 *     summary: Adiciona ou remove favorito
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorito atualizado
 */

router.post('/favorites/toggle',   authMiddleware, authCtrl.toggleFavorite);

export default router;
