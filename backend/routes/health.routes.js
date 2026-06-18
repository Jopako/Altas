import { Router } from 'express';
import { getDB } from '../config/database.js';
import * as mapsService from '../services/maps.service.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/db-test', async (_req, res) => {
  try {
    const db = getDB();

    const result = await db.collection('teste').insertOne({
      mensagem: 'Conexão funcionando',
      data: new Date()
    });

    res.json({
      ok: true,
      insertedId: result.insertedId
    });

  } catch (err) {
    res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});

router.get('/map-test', async (_req, res) => {
  try {
    const map = await mapsService.createMap({
      name: 'Mapa Teste',
      filename: 'teste.png',
      creatorName: 'Julia',
      creatorEmail: 'teste@email.com'
    });

    res.json(map);

  } catch (err) {
    res.status(500).json({
      erro: err.message
    });
  }
});

export default router;
