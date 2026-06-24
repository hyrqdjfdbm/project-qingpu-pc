import { Router } from 'express';
import { projectStore } from '../store/projects.js';
import { fail, ok } from '../utils/response.js';

const router = Router();

router.get('/', (req, res) => {
  const data = projectStore.list({
    keyword: req.query.keyword,
    projectType: req.query.projectType,
    investRange: req.query.investRange,
    streetTown: req.query.streetTown,
    responsibleUnit: req.query.responsibleUnit,
    status: req.query.status,
    poolStage: req.query.poolStage || 'supplement',
    projectAttribute: req.query.projectAttribute
  });
  ok(res, data);
});

router.get('/:id', (req, res) => {
  const item = projectStore.getById(req.params.id);
  if (!item) return fail(res, '项目不存在', 404);
  ok(res, item);
});

router.post('/', (req, res) => {
  const data = projectStore.create(req.body, req.body.poolStage || 'supplement');
  ok(res, data);
});

router.put('/:id', (req, res) => {
  const item = projectStore.update(req.params.id, req.body);
  if (!item) return fail(res, '项目不存在', 404);
  ok(res, item);
});

router.post('/:id/audit', (req, res) => {
  const item = projectStore.audit(req.params.id, req.body);
  if (!item) return fail(res, '项目不存在', 404);
  ok(res, item);
});

router.post('/:id/transfer', (req, res) => {
  const { poolStage } = req.body;
  if (!poolStage) return fail(res, '缺少目标库');
  const item = projectStore.transferPool(req.params.id, poolStage);
  if (!item) return fail(res, '项目不存在', 404);
  ok(res, item);
});

export default router;
