import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isInvestmentMgmtRole } from '@/mock/current-user';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to) => {
  if (to.path.startsWith('/data-management') && !isInvestmentMgmtRole(getCurrentUser().role)) {
    return { path: '/cockpit' };
  }
  return true;
});

export default router;
