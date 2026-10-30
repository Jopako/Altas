import * as mapsService from '../services/maps.service.js';

export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  try {
    const map = await mapsService.createMap({
      name: req.body.name,
      filename: req.file.filename,
      creatorName: req.user?.name || req.user?.email || 'Administrador',
      creatorEmail: req.user?.email,
    });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar imagem.' });
  }
};

export const listMaps = async (_req, res) => {
  try {
    const maps = await mapsService.listMaps();

    res.json(maps);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao listar mapas.'
    });
  }
};

export const getMap = async (req, res) => {
  try {
    const map = await mapsService.getMap(req.params.id);

    if (!map) {
      return res.status(404).json({
        error: 'Mapa não encontrado.'
      });
    }

    res.json(map);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao buscar mapa.'
    });
  }
};

export const saveFeatures = async (req, res) => {
  try {
    const ok = await mapsService.saveFeatures(
      req.params.id,
      req.body
    );

    if (!ok) {
      return res.status(404).json({
        error: 'Mapa não encontrado.'
      });
    }

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao salvar pontos de interesse.'
    });
  }
};

export const uploadPoiPhoto = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  res.json({ imageUrl: `/uploads/images/${req.file.filename}` });
};
