import { MongoClient } from "mongodb";

let db;
let client;

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  console.log("URI:", uri);

  if (!uri) {
    throw new Error("MONGO_URI não encontrada no arquivo .env");
  }

  client = new MongoClient(uri);

  await client.connect();

  db = client.db("Altas");

  console.log("MongoDB conectado");

  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("Banco ainda não conectado");
  }

  return db;
}
