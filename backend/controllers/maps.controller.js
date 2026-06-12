import * as mapsService from '../services/maps.service.js';

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  try {
    const map = mapsService.createMap({
      name:        req.body.name,
      filename:    req.file.filename,
      creatorName: req.user?.name || req.user?.email || 'Administrador',
      creatorEmail: req.user?.email,
    });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar imagem.' });
  }
};

export const listMaps = (_req, res) => {
  try {
    res.json(mapsService.listMaps());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar mapas.' });
  }
};

export const getMap = (req, res) => {
  const map = mapsService.getMap(req.params.id);
  if (!map) return res.status(404).json({ error: 'Mapa não encontrado.' });
  res.json(map);
};

export const saveFeatures = (req, res) => {
  const ok = mapsService.saveFeatures(req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: 'Mapa não encontrado.' });
  res.json({ success: true });
};

export const uploadPoiPhoto = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  res.json({ imageUrl: `/uploads/images/${req.file.filename}` });
};