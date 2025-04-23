import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import minesweeper from '@/views/minesweeper.vue'

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

export default router
