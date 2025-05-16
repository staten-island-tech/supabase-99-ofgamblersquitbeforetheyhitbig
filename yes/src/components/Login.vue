<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import AboutView from '@/views/AboutView.vue'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const username = ref('')
const ImageURL = ref('')
const isLogin = ref(true)

const handleAuth = async () => {
  if (isLogin.value) {
    await auth.signIn(email.value, password.value)

    if (auth.user) {
      router.push('/about') // ✅ redirect after login
    }
  } else {
    const { user, error } = await auth.signUp(email.value, password.value)
    if (user && !error) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: user.id,
          email: email.value,
          username: username.value,
          ImageURL: ImageURL.value,
        },
      ])
      if (insertError) {
        auth.error = insertError.message
        return
      }

      // ✅ redirect after signup
      router.push('/about')
    }
  }
}
</script>

<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Login' : 'Sign Up' }}</h1>
    <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />

      <!-- 👇 Show username only on sign-up -->
      <input v-if="!isLogin" v-model="username" type="text" placeholder="Username" required />
      <input v-if="!isLogin" v-model="ImageURL" type="text" placeholder="ImageURL" required />

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
