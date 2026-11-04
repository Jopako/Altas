import { Router } from 'express';
import { generateAudio } from '../controllers/tts.controller.js';

const router = Router();

// Limite simples por IP (a rota gasta crédito do provedor). Para produção, prefira express-rate-limit.
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 20) return res.status(429).json({ error: 'Muitas requisições. Tente em instantes.' });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

router.post('/', rateLimit, generateAudio);

export default router;
