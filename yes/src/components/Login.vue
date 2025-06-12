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
  <div class="auth-bg flex items-center justify-center min-h-screen">
    <div class="auth-main-box bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="auth-title mb-6">
        {{ isLogin ? 'Login' : 'Sign Up' }}
      </h1>
      <div class="form-box p-6 rounded-xl shadow-md bg-gray-50 border border-gray-200 mb-4">
        <form @submit.prevent="handleAuth" class="space-y-4">
          <input
            v-if="isLogin"
            v-model="identifier"
            type="text"
            placeholder="Email or Username"
            class="styled-input"
            required
          />

          <input
            v-if="!isLogin"
            v-model="email"
            type="email"
            placeholder="Email"
            class="styled-input"
            required
          />

          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="styled-input"
            required
          />

          <input
            v-if="!isLogin"
            v-model="username"
            type="text"
            placeholder="Username"
            class="styled-input"
            required
          />

          <input
            v-if="!isLogin"
            v-model="ImageURL"
            type="text"
            placeholder="Image URL"
            class="styled-input"
          />

          <button type="submit" class="styled-btn">
            {{ isLogin ? 'Login' : 'Sign Up' }}
          </button>
        </form>
      </div>

      <p
        @click="isLogin = !isLogin"
        class="mt-4 text-center text-sm text-blue-600 hover:underline cursor-pointer"
      >
        {{ isLogin ? 'No account? Sign up' : 'Already have an account? Login' }}
      </p>

      <p v-if="auth.error" class="mt-4 text-red-500 text-sm text-center">{{ auth.error }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-bg {
  background: #f3f4f6;
  min-height: 100vh;
  overflow: auto;
}

.auth-main-box {
  width: 370px;
  max-width: 96vw;
  margin: 2rem auto;
  padding: 2.5rem 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.form-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.auth-title {
  text-align: center;
  font-size: 1.875rem; /* text-3xl */
  font-weight: 600; /* font-semibold */
  color: #1f2937; /* text-gray-800 */
  font-family: inherit;
  letter-spacing: 0;
  margin-top: 0;
  margin-bottom: 1.5rem;
  line-height: 2.25rem;
}

.styled-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #d1d5db;
  background: #fff;
  font-size: 1rem;
  color: #374151;
  transition:
    border,
    box-shadow 0.2s;
  outline: none;
  box-shadow: 0 1px 2px rgba(30, 64, 175, 0.03);
  margin-bottom: 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
  font-family: inherit;
}

.styled-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  background: #f1f5fe;
}

.styled-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
  cursor: pointer;
  transition:
    background 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  overflow: hidden;
  font-family: inherit;
}

.styled-btn:hover,
.styled-btn:focus {
  background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
}
</style>
