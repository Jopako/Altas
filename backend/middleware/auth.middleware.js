import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não enviado.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Apenas admins.' });
  next();
}