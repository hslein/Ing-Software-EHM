import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../app/App.vue'),
    // Removed meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

// Only redirect logged-in users away from login page
router.beforeEach((to, from, next) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading.value) {
    const unsubscribe = setInterval(() => {
      if (!loading.value) {
        clearInterval(unsubscribe);
        if (to.path === '/login' && isAuthenticated.value) {
          next('/');
        } else {
          next();
        }
      }
    }, 100);
  } else {
    if (to.path === '/login' && isAuthenticated.value) {
      next('/');
    } else {
      next();
    }
  }
});

export default router;