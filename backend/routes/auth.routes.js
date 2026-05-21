import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';

const router = Router();

router.get('/google',              authCtrl.googleRedirect);
router.get('/google/callback',     authCtrl.googleCallback);
router.get('/microsoft',           authCtrl.microsoftRedirect);
router.get('/microsoft/callback',  authCtrl.microsoftCallback);
router.post('/register',           authCtrl.register);
router.post('/login',              authCtrl.login);

export default router;