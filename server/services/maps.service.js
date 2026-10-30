import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';

function mapsCollection() {
  return getDB().collection('mapas');
}

export async function createMap({
  name,
  filename,
  creatorName,
  creatorEmail
}) {
  const map = {
    name: name || 'Mapa sem nome',
    imageUrl: `/uploads/images/${filename}`,
    creatorName,
    creatorEmail: creatorEmail || '',
    features: {
      type: 'FeatureCollection',
      features: []
    },
    createdAt: new Date()
  };

  const result = await mapsCollection().insertOne(map);

  return {
    id: result.insertedId.toString(),
    ...map
  };
}

export async function listMaps() {
  const maps = await mapsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return maps.map(map => ({
    ...map,
    id: map._id.toString()
  }));
}

export async function getMap(id) {
  const map = await mapsCollection().findOne({
    _id: new ObjectId(id)
  });

  if (!map) return null;

  return {
    ...map,
    id: map._id.toString()
  };
}

export async function saveFeatures(id, features) {
  const result = await mapsCollection().updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: { features }
    }
  );

  return result.matchedCount > 0;
}
