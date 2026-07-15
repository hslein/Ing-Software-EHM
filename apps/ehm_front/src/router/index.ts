import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { hideChrome: true },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/About.vue'),
  },
  {
    path: '/credit',
    name: 'Credit',
    component: () => import('../pages/Credit.vue'),
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../pages/Inventory.vue'),
  },
  {
    path: '/my-vehicles',
    name: 'MyVehicles',
    component: () => import('../pages/MyVehiclesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/UsersList.vue'),
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../pages/AdminDashboard.vue'),
  },
  {
    path: '/user-details',
    name: 'UserDetails',
    component: () => import('../pages/UserDetails.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

router.beforeEach((to, _from) => {
  const { isAuthenticated, loading } = useAuth();

  const resolveNavigation = () => {
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    if (to.path === '/login' && isAuthenticated.value) {
      return '/';
    }

    return true;
  };

  if (loading.value) {
    return new Promise((resolve) => {
      const unsubscribe = setInterval(() => {
        if (!loading.value) {
          clearInterval(unsubscribe);
          resolve(resolveNavigation());
        }
      }, 100);
    });
  }

  return resolveNavigation();
});

export default router;
