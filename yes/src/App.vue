<script setup>
import { ref, nextTick } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { useAuthStore } from '@/stores/auth'

const menuOpen = ref(false)
const overlayMenu = ref(null)
const overlayBg = ref(null)
const auth = useAuthStore()
const router = useRouter()

function openMenu() {
  menuOpen.value = true
  nextTick(() => {
    gsap.fromTo(
      overlayBg.value,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.3, ease: 'power2.out' },
    )
    gsap.fromTo(
      overlayMenu.value,
      { x: -250, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
    )
  })
}
function closeMenu() {
  gsap.to(overlayMenu.value, {
    x: -250,
    opacity: 0,
    duration: 0.25,
    ease: 'power3.in',
    onComplete: () => (menuOpen.value = false),
  })
  gsap.to(overlayBg.value, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  })
}
function toggleMenu() {
  if (menuOpen.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

// Handler for Login navigation
function handleLoginClick(e) {
  if (auth.user) {
    e.preventDefault()
    alert('You must log out before logging in again.')
    closeMenu()
  } else {
    closeMenu()
  }
}

// Handler for protected routes
function handleProtectedClick(e, to) {
  if (!auth.user) {
    e.preventDefault()
    alert('You must log in before accessing this page.')
    closeMenu()
  } else {
    closeMenu()
    // Optionally, you could use router.push(to) here for manual navigation
  }
}
</script>

<template>
  <div class="app-wrapper">
    <header>
      <img alt="Vue logo" class="logo" src="@/assets/Lebron.jpg" width="90" height="90" />
      <button
        class="hamburger"
        @click="toggleMenu"
        :aria-expanded="menuOpen"
        aria-label="Open navigation"
      >
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
      </button>
    </header>

    <!-- Overlay Background -->
    <div v-if="menuOpen" ref="overlayBg" class="overlay-bg" @click="closeMenu"></div>

    <!-- Overlay Menu -->
    <nav v-if="menuOpen" ref="overlayMenu" class="overlay-menu">
      <button class="close-btn" @click="closeMenu" aria-label="Close menu">&times;</button>
      <!-- Login link with custom handler -->
      <RouterLink to="/" @click="handleLoginClick">Login</RouterLink>
      <RouterLink to="/about" @click="(e) => handleProtectedClick(e, '/about')">Profile</RouterLink>
      <RouterLink to="/minesweeper" @click="(e) => handleProtectedClick(e, '/minesweeper')"
        >Get Coins</RouterLink
      >
      <RouterLink to="/gacha" @click="(e) => handleProtectedClick(e, '/gacha')">Gacha</RouterLink>
    </nav>

    <!-- Main Content -->
    <main class="main-view">
      <RouterView />
    </main>
  </div>
</template>
<style scoped>
header {
  position: relative;
  text-align: center;
  padding: 1.5rem 0 0 0;
}
.logo {
  margin: 0 auto 1.2rem auto;
  display: block;
}

/* Hamburger Menu (triple lines) - top left corner */
.hamburger {
  position: fixed;
  top: 18px;
  left: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 201;
}
.hamburger span {
  display: block;
  width: 30px;
  height: 4px;
  background: #222;
  margin: 5px 0;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 2, 0.6, 1);
}
.hamburger span.open:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Overlay background */
.overlay-bg {
  position: fixed;
  inset: 0;
  background: #222;
  opacity: 0.6;
  z-index: 200;
  transition: opacity 0.25s;
}

/* Overlay menu */
.overlay-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #fff;
  box-shadow: 3px 0 24px #0002;
  z-index: 202;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.4rem 1.4rem 1.4rem;
  gap: 1.2rem;
  font-size: 1.13rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 1;
  /* Hide outline on focus for cleaner look */
  outline: none;
}
.overlay-menu a {
  color: #222;
  text-decoration: none;
  padding: 0.5em 0;
  border-radius: 6px;
  transition:
    background 0.18s,
    color 0.18s;
}
.overlay-menu a.router-link-exact-active,
.overlay-menu a:hover {
  background: #f3f4f6;
  color: #409eff;
}
.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 2.1rem;
  align-self: flex-end;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: color 0.18s;
  line-height: 1;
}
.close-btn:hover {
  color: #ef4444;
}

@media (max-width: 600px) {
  .overlay-menu {
    width: 75vw;
    min-width: 110px;
    padding: 1.3rem 0.8rem;
    font-size: 1rem;
    gap: 0.7rem;
  }
  .hamburger {
    width: 38px;
    height: 38px;
    top: 12px;
    left: 10px;
  }
  .hamburger span {
    width: 23px;
    height: 3px;
    margin: 4px 0;
  }
}
</style>
