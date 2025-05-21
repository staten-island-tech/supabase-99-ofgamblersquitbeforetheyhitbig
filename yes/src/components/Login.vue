<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const username = ref('')
const ImageURL = ref('')
const isLogin = ref(true)
const identifier = ref('')

const handleAuth = async () => {
  auth.error = null

  if (isLogin.value) {
    let loginEmail = identifier.value.trim()
    const isEmail = loginEmail.includes('@')

    if (!isEmail) {
      // Look up email based on username
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', loginEmail)
        .maybeSingle()

      if (error || !data) {
        auth.error = 'Username not found.'
        return
      }

      loginEmail = data.email
    }

    await auth.signIn(loginEmail, password.value)
  } else {
    if (!email.value.trim()) {
      auth.error = 'Email is required.'
      return
    }

    if (!username.value.trim()) {
      auth.error = 'Username is required.'
      return
    }

    const { user, error } = await auth.signUp(email.value, password.value)

    if (user && !error) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: user.id,
          email: email.value,
          username: username.value,
          ImageURL: ImageURL.value || null,
        },
      ])

      if (insertError) {
        auth.error = insertError.message
        return
      }
    } else if (error) {
      auth.error = error.message
      return
    }
  }

  router.push('/about')
}
</script>

<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Login' : 'Sign Up' }}</h1>
    <form @submit.prevent="handleAuth">
      <!-- Show this for login -->
      <input
        v-if="isLogin"
        v-model="identifier"
        type="text"
        placeholder="Email or Username"
        required
      />

      <!-- Show this for signup -->
      <input v-if="!isLogin" v-model="email" type="email" placeholder="Email" required />

      <input v-model="password" type="password" placeholder="Password" required />
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
