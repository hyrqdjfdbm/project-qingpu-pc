import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import overviewRouter from './routes/overview.js';
import projectsRouter from './routes/projects.js';
import { ok } from './utils/response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../../dist');
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  ok(res, { status: 'ok' });
});

app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/overview', overviewRouter);

if (isProduction) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: err.message || 'Internal Server Error', data: null });
});

app.listen(port, () => {
  console.log(
    isProduction
      ? `App running at http://localhost:${port}`
      : `API server running at http://localhost:${port}`
  );
});
