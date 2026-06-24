import { Router } from 'express';
import { projectStore } from '../store/projects.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/stats', (_req, res) => {
  ok(res, projectStore.getOverview());
});

export default router;
