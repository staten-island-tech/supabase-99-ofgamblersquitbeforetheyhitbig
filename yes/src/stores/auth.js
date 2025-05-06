import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
const fetchUser = async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
}

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
  
  const fetchUserData = async () => {
    if (!user.value) return
    const { data, error: err } = await supabase
      .from('profiles') // assuming you have a 'profiles' table
      .select('coins')
      .eq('id', user.value.id)
      .single()

    if (!err) {
      user.value.coins = data.coins || 0
    }
  }

  const addCoins = async (amount) => {
    if (!user.value) return

    const newCoinTotal = (user.value.coins || 0) + amount

    const { error: err } = await supabase
      .from('profiles')
      .update({ coins: newCoinTotal })
      .eq('id', user.value.id)

    if (!err) {
      user.value.coins = newCoinTotal
    }
  }

  return {
    user,
    error,
    loading,
    signIn,
    signUp,
    signOut,
    fetchUser,
    addCoins,
  }
})