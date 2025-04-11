import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '../stores/auth'

export const useCoinStore = defineStore('coins', () => {
  const coins = ref(0)
  const userStore = useUserStore()

  async function loadCoins() {
    const user = userStore.user
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      coins.value = data.coins
    }
  }

  async function saveCoins() {
    const user = userStore.user
    if (!user) return

    await supabase
      .from('profiles')
      .upsert({ id: user.id, coins: coins.value }) // `upsert` creates or updates
  }

  async function add(amount) {
    coins.value += amount
    await saveCoins()
  }

  async function reset() {
    coins.value = 0
    await saveCoins()
  }

  return { coins, loadCoins, add, reset }
})