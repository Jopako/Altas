import crypto from 'node:crypto';
import { getDB } from '../config/database.js';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : [];

export const hashPassword = (pw) =>
  crypto.createHash('sha256').update(pw).digest('hex');

export function resolveRole(email) {
  const e = email.toLowerCase();

  return ADMIN_EMAILS.includes(e) || e.endsWith('@ifc.edu.br')
    ? 'admin'
    : 'visitante';
}

function usersCollection() {
  return getDB().collection('usuarios');
}

export async function findUserByEmail(email) {
  return usersCollection().findOne({
    email: email.toLowerCase()
  });
}

export async function createUser(user) {
  await usersCollection().insertOne(user);
  return user;
}

export async function saveOrUpdateUser(profile) {
  const email = profile.email.toLowerCase();
  const role = resolveRole(email);

  const existing = await findUserByEmail(email);

  if (existing) {
    await usersCollection().updateOne(
      { email },
      {
        $set: {
          name: profile.name,
          role
        }
      }
    );

    return {
      ...existing,
      name: profile.name,
      role
    };
  }

  const user = {
    email,
    name: profile.name,
    role,
    favorites: []
  };

  await createUser(user);

  return user;
}

export async function getUserFavorites(email) {
  const user = await findUserByEmail(email);

  return user?.favorites || [];
}

export async function toggleUserFavorite(email, mapId, poiId) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw Object.assign(
      new Error('Usuário não encontrado'),
      { status: 404 }
    );
  }

  const favorites = user.favorites || [];

  const favorite = `${mapId}:${poiId}`;

  const index = favorites.indexOf(favorite);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(favorite);
  }

  await usersCollection().updateOne(
    { email: email.toLowerCase() },
    {
      $set: { favorites }
    }
  );

  return favorites;
}
