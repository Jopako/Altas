/**
 * workspaces.controller.js — CRUD do workspace no MongoDB.
 */
import {
  findPublicWorkspace,
  findWorkspaceByOwner,
  upsertWorkspace,
} from '../models/Workspace.js';

// ── GET /api/workspaces/public ────────────────────────────
export async function getPublic(_req, res) {
  try {
    const ws = await findPublicWorkspace();
    // Se não existir workspace público, retorna um padrão vazio
    res.json(ws || {
      name: 'Workspace ALTAS',
      blockMeta: {},
      features: { type: 'FeatureCollection', features: [] }
    });
  } catch (err) {
    console.error('getPublic:', err);
    res.status(500).json({ error: 'Erro interno ao buscar workspace público.' });
  }
}

// ── GET /api/workspaces/me ────────────────────────────────
export async function getMe(req, res) {
  try {
    const ws = await findWorkspaceByOwner(req.user.email);
    
    // Se for o primeiro acesso do admin, manda um workspace vazio padrão
    res.json(ws || {
      name: 'Workspace ALTAS',
      blockMeta: {},
      features: { type: 'FeatureCollection', features: [] }
    });
  } catch (err) {
    console.error('getMe:', err);
    res.status(500).json({ error: 'Erro interno ao buscar workspace do usuário.' });
  }
}

// ── PUT /api/workspaces/me ────────────────────────────────
export async function putMe(req, res) {
  try {
    const { name, blockMeta, features } = req.body;

    if (!features || !blockMeta) {
      return res.status(400).json({ error: 'Body deve conter blockMeta e features.' });
    }

    const saved = await upsertWorkspace(req.user.email, { name, blockMeta, features });
    
    // Retorna o workspace salvo direto, sem embrulhar em { ok: true, workspace: ... }
    res.json(saved);
  } catch (err) {
    console.error('putMe:', err);
    res.status(500).json({ error: 'Erro interno ao salvar workspace.' });
  }
}

// ── POST /api/workspaces/me/upload-image ─────────────────
export async function uploadBlockImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error('uploadBlockImage:', err);
    res.status(500).json({ error: 'Erro interno ao enviar imagem.' });
  }
}