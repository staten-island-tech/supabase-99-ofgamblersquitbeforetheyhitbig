import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const signUp = async (email, password) => {
    loading.value = true
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    user.value = data.user
    error.value = err?.message
    loading.value = false
  }

  const signIn = async (email, password) => {
    loading.value = true
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    user.value = data.user
    error.value = err?.message
    loading.value = false
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }

  return {
    user,
    error,
    loading,
    signIn,
    signUp,
    signOut,
    fetchUser,
  }
})
