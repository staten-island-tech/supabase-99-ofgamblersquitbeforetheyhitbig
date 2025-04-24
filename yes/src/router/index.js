import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import minesweeper from '@/views/minesweeper.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/minesweeper',
      name: 'minesweeper',
      component: minesweeper,
      meta: { requiresAuth: true },
    },
  ],
})
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // ✅ call the Pinia store's fetchUser(), not a local one
  if (!auth.user) {
    await auth.fetchUser()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return next('/') // redirect if not logged in
  }

  next()
})

export default router
