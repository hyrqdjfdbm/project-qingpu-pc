import cors from 'cors';
import express from 'express';
import overviewRouter from './routes/overview.js';
import projectsRouter from './routes/projects.js';
import { ok } from './utils/response.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  ok(res, { status: 'ok' });
});

app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/overview', overviewRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: err.message || 'Internal Server Error', data: null });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
