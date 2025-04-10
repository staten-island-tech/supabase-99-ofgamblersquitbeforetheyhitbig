import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Minesweeper from '@/components/minesweeper.vue'
import { useUserStore } from '@/stores/auth'

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
      component: Minesweeper,
      meta: { requiresAuth: true }, // protect minesweeper page
    },
  ],
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.user) {
    next('/') // send them home if not logged in
  } else {
    next()
  }
})

export default router
