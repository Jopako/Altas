import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../users.json');

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : [];
  
export const hashPassword = (pw) =>
  crypto.createHash('sha256').update(pw).digest('hex');

export function readUsers() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

export function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export function resolveRole(email) {
  const e = email.toLowerCase();
  return ADMIN_EMAILS.includes(e) || e.endsWith('@ifc.edu.br')
    ? 'admin'
    : 'visitante';
}

export function saveOrUpdateUser(profile) {
  const users = readUsers();
  const email = profile.email.toLowerCase();
  const role  = resolveRole(email);
  const idx   = users.findIndex((u) => u.email.toLowerCase() === email);

  const userData = { email: profile.email, name: profile.name, role };

  if (idx >= 0) {
    if (users[idx].password) userData.password = users[idx].password;
    users[idx] = userData;
  } else {
    users.push(userData);
  }

  writeUsers(users);
  return userData;
}