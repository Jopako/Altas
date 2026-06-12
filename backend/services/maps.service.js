import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapsDir   = path.join(__dirname, '../uploads/maps');
const imagesDir = path.join(__dirname, '../uploads/images');

fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(mapsDir,   { recursive: true });

const mapPath = (id) => path.join(mapsDir, `${id}.json`);

export function createMap({ name, filename, creatorName, creatorEmail }) {
  const id = Date.now().toString();
  const data = {
    id,
    name:        name || 'Mapa sem nome',
    imageUrl:    `/uploads/images/${filename}`,
    creatorName,
    creatorEmail: creatorEmail || '',
    features:    { type: 'FeatureCollection', features: [] },
    createdAt:   new Date().toISOString(),
  };
  fs.writeFileSync(mapPath(id), JSON.stringify(data, null, 2));
  return data;
}

export function listMaps() {
  return fs.readdirSync(mapsDir)
    .map((f) => JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')));
}

export function getMap(id) {
  const fp = mapPath(id);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

export function saveFeatures(id, features) {
  const fp = mapPath(id);
  if (!fs.existsSync(fp)) return false;
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  data.features = features;
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  return true;
}