import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/google',              authCtrl.googleRedirect);
router.get('/google/callback',     authCtrl.googleCallback);
router.get('/microsoft',           authCtrl.microsoftRedirect);
router.get('/microsoft/callback',  authCtrl.microsoftCallback);
router.post('/register',           authCtrl.register);
router.post('/login',              authCtrl.login);
router.get('/favorites',           authMiddleware, authCtrl.getFavorites);
router.post('/favorites/toggle',   authMiddleware, authCtrl.toggleFavorite);

export default router;