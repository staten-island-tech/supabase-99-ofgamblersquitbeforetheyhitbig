<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const isLogin = ref(true)

const isLoggedIn = computed(() => !!auth.user)

const handleAuth = async () => {
  if (isLogin.value) {
    await auth.signIn(email.value, password.value)
  } else {
    const { user, error } = await auth.signUp(email.value, password.value)
    if (user && !error) {
      // 👇 insert username into users table
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: user.id, // link by auth UID
          email: email.value,
          username: username.value,
        },
      ])
      if (insertError) {
        auth.error = insertError.message
      }
    }
  }
}

const handleLogout = async () => {
  await auth.signOut()
}
</script>

<template>
  <div class="auth-container">
    <h1>{{ isLoggedIn ? 'Welcome!' : isLogin ? 'Login' : 'Sign Up' }}</h1>

    <!-- 🔒 Show login/signup form if not logged in -->
    <form v-if="!isLoggedIn" @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <!-- 👇 Only show username input on sign-up -->
      <input v-if="!isLogin" v-model="username" type="text" placeholder="Username" required />

      <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
    </form>

    <!-- 🔁 Toggle between login and sign up -->
    <p v-if="!isLoggedIn" @click="isLogin = !isLogin" style="cursor: pointer; margin-top: 10px">
      {{ isLogin ? 'No account? Sign up' : 'Already have an account? Login' }}
    </p>

    <!-- ⚠️ Error display -->
    <p v-if="auth.error" class="error">{{ auth.error }}</p>

    <!-- ✅ Show logout button if logged in -->
    <button v-if="isLoggedIn" @click="handleLogout" class="logout-btn">Logout</button>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

input {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #4f46e5;
  color: white;
  cursor: pointer;
}

button.logout-btn {
  background-color: #e53e3e;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
