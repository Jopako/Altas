import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: '30m' });