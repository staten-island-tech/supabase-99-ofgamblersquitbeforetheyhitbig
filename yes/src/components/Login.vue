<script setup>
import { ref } from 'vue'
<<<<<<< HEAD
import { useUserStore } from '@/stores/auth'
=======
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
>>>>>>> Ryan

const email = ref('')
const password = ref('')
const isLogin = ref(true)

const handleAuth = async () => {
  if (isLogin.value) {
    await auth.signIn(email.value, password.value)
  } else {
    await auth.signUp(email.value, password.value)
  }
}
</script>

<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Login' : 'Sign Up' }}</h1>
    <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
    </form>
    <p @click="isLogin = !isLogin" style="cursor: pointer">
      {{ isLogin ? 'No account? Sign up' : 'Already have an account? Login' }}
    </p>
    <p v-if="auth.error" class="error">{{ auth.error }}</p>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}
.error {
  color: red;
}
</style>
