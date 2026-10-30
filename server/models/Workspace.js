/**
 * models/Workspace.js — Modelo do Workspace ALTAS no MongoDB.
 *
 * Campos:
 *  - ownerId: string (email do usuário admin, ou 'system' para o público) — indexado
 *  - name: string
 *  - blockMeta: Record<string, { name: string, imageUrl: string, bounds: number[][] }>
 *  - features: GeoJSON FeatureCollection
 *  - createdAt: Date
 *  - updatedAt: Date
 */
import { getDB } from '../config/database.js';

const COLLECTION_NAME = 'workspaces';
let indexesEnsured = false;

export function workspaceCollection() {
  const col = getDB().collection(COLLECTION_NAME);
  if (!indexesEnsured) {
    col.createIndex({ ownerId: 1 }).catch((err) => {
      console.warn('Erro ao criar índice em workspaces.ownerId:', err.message);
    });
    indexesEnsured = true;
  }
  return col;
}

export async function findWorkspaceByOwner(ownerId) {
  return workspaceCollection().findOne(
    { ownerId },
    { projection: { _id: 0, ownerId: 0 } }
  );
}

export async function findPublicWorkspace() {
  return workspaceCollection().findOne(
    { ownerId: 'system' },
    { projection: { _id: 0, ownerId: 0 } }
  );
}

export async function upsertWorkspace(ownerId, { name, blockMeta, features }) {
  const now = new Date();
  const filter = { ownerId };
  const update = {
    $set: {
      name: name || 'Workspace ALTAS',
      blockMeta: blockMeta || {},
      features: features || { type: 'FeatureCollection', features: [] },
      updatedAt: now,
    },
    $setOnInsert: {
      ownerId,
      createdAt: now,
    },
  };

  await workspaceCollection().updateOne(filter, update, { upsert: true });

  // Também replica para o workspace público 'system'
  if (ownerId !== 'system') {
    await workspaceCollection().updateOne(
      { ownerId: 'system' },
      {
        $set: {
          name: name || 'Workspace ALTAS',
          blockMeta: blockMeta || {},
          features: features || { type: 'FeatureCollection', features: [] },
          updatedAt: now,
        },
        $setOnInsert: {
          ownerId: 'system',
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }

  return { name, blockMeta, features, updatedAt: now };
}
