import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes        from './routes/auth.routes.js';
import mapsRoutes        from './routes/maps.routes.js';
import healthRoutes      from './routes/health.routes.js';
import workspacesRoutes  from './routes/workspaces.routes.js';
import { connectDB } from "./config/database.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não definido no .env. O servidor não pode subir sem ele.');
  process.exit(1);
}

await connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Permite requisições sem origin (ex: curl, mobile) e as origins listadas
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado para: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',        authRoutes);
app.use('/api/maps',        mapsRoutes);
app.use('/api/workspaces',  workspacesRoutes);
app.use('/api',             healthRoutes);
app.use('/auth',            authRoutes); // rotas OAuth /auth/microsoft

app.listen(Number(process.env.PORT || 3000), () =>
  console.log(`ALTAS backend rodando em http://localhost:${process.env.PORT || 3000}`)
);
