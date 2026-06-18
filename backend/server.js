import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes   from './routes/auth.routes.js';
import mapsRoutes   from './routes/maps.routes.js';
import healthRoutes from './routes/health.routes.js';
import { connectDB } from "./config/database.js";


dotenv.config();


await connectDB();


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth',   authRoutes);
app.use('/api/maps',   mapsRoutes);
app.use('/api',        healthRoutes);
app.use('/auth',       authRoutes); // rotas OAuth /auth/google, /auth/microsoft


app.listen(Number(process.env.PORT || 3000), () =>
  console.log(`ALTAS backend rodando em http://localhost:${process.env.PORT || 3000}`)
);
