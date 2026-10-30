import jwt from 'jsonwebtoken';

// JWT_SECRET é obrigatório — o server.js já bloqueia a subida sem ele.
const SECRET = process.env.JWT_SECRET;

export const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: '8h' });