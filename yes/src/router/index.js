import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import minesweeper from '@/views/minesweeper.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresGuest: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true },
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
  const isLoggedIn = !!auth.user
  // ✅ call the Pinia store's fetchUser(), not a local one
  if (!auth.user) {
    await auth.fetchUser()
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/') // redirect if not logged in
  }

  if (to.meta.requiresGuest && isLoggedIn) {
    // Already logged in, trying to access login page
    return next('/')
  }

  next()
})

export default router
