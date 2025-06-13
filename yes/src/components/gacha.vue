<template>
  <div class="gacha-bg">
    <div v-if="!isDimmed && !showRarityOverlay" class="center upshift">
      <div class="pull-buttons">
        <button
          @click="startOverlayPull('single')"
          :disabled="isCooldown || coins < 10"
          class="btn single"
        >
          🎲 Single Pull
          <span class="cost">(10 <span class="coin-emoji">🪙</span>)</span>
        </button>
        <button
          @click="startOverlayPull('ten')"
          :disabled="isCooldown || coins < 100"
          class="btn ten"
        >
          🔥 10 Pull
          <span class="cost">(100 <span class="coin-emoji">🪙</span>)</span>
        </button>
      </div>
      <div class="coins">Coins: <span>{{ coins }}</span></div>
      <button class="btn rarity-btn" @click="showRarityOverlay = true">
        👀 Show Rarity Rates
      </button>
    </div>

    <!-- Pull Overlay -->
    <transition name="fade">
      <div v-if="isDimmed" class="overlay" @click.self="hidePullOverlay" tabindex="0">
        <div
          v-if="pullType === 'single' && overlayResults.length === 1"
          class="overlay-cards overlay-single"
        >
          <div class="card" :class="rarityClass(overlayResults[0].Rarity)">
            <img :src="overlayResults[0].Image" alt="Character" class="card-img" />
            <p class="card-name">{{ overlayResults[0].Name }}</p>
            <p class="card-stars">
              <span v-for="n in getStars(overlayResults[0].Rarity)" :key="n">⭐</span>
            </p>
            <p class="card-desc">{{ overlayResults[0].Desc }}</p>
          </div>
        </div>
        <div
          v-else
          class="overlay-cards overlay-ten"
          :class="{
            'overlay-5x2': isDesktop,
            'overlay-2x5': isPhone
          }"
        >
          <div
            v-for="(item, index) in overlayResults"
            :key="index"
            class="card"
            :class="rarityClass(item.Rarity)"
          >
            <img :src="item.Image" alt="Character" class="card-img" />
            <p class="card-name">{{ item.Name }}</p>
            <p class="card-stars">
              <span v-for="n in getStars(item.Rarity)" :key="n">⭐</span>
            </p>
            <p class="card-desc">{{ item.Desc }}</p>
          </div>
        </div>
        <p class="overlay-tip">Click background or <kbd>ESC</kbd> to continue</p>
      </div>
    </transition>

    <!-- Rarity Rates Overlay -->
    <transition name="fade">
      <div v-if="showRarityOverlay" class="overlay" @click.self="showRarityOverlay = false" tabindex="0">
        <div class="rarity-modal">
          <h2 class="rarity-title">Rarity Rates</h2>
          <ul class="rarity-list">
            <li
              v-for="(rate, rarity) in rarityRates"
              :key="rarity"
              :class="rarityClass(rarity)"
            >
              <span class="rarity-label">{{ rarity }}</span>
              <span class="rarity-percent">{{ rate }}%</span>
            </li>
          </ul>
          <button class="btn rarity-btn-close" @click="showRarityOverlay = false">
            Close
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()
const overlayResults = ref([])
const isCooldown = ref(false)
const COOLDOWN_MS = 1000
const coins = ref(0)
const isDimmed = ref(false)
const pullType = ref('single')
const showRarityOverlay = ref(false)

const isDesktop = ref(true)
const isPhone = ref(false)

// Responsive grid logic
function handleResize() {
  if (window.matchMedia('(max-width: 600px)').matches) {
    isDesktop.value = false
    isPhone.value = true
  } else {
    isDesktop.value = true
    isPhone.value = false
  }
}
onMounted(() => {
  fetchCoins()
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', (e) => {
    if (isDimmed.value && (e.key === 'Escape' || e.key === ' ')) hidePullOverlay()
    if (showRarityOverlay.value && e.key === 'Escape') showRarityOverlay.value = false
  })
})

async function fetchCoins() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('users')
    .select('coins')
    .eq('id', auth.user.id)
    .single()
  if (!error) coins.value = data.coins ?? 0
}

async function addToInventory(cards) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  const inventoryEntries = cards.map((card) => ({
    user_id: user.id,
    card_name: card.Name,
    rarity: card.Rarity,
    desc: card.Desc,
    image: card.Image,
  }))
  await supabase.from('inventory').insert(inventoryEntries)
}

async function updateCoinsInDB() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('users')
    .update({ coins: coins.value })
    .eq('id', auth.user.id)
}

const rarityRates = {
  'Lebron James': 0.01,
  Korean: 0.1,
  Legendary: 1,
  Rare: 25,
  Common: 73.89,
}

const gachaPool = [
  { Name: 'Barney', Rarity: 'Rare', Desc: 'Barney is a dinosaur that haunts your imagination', Image: 'Barney.webp' },
  { Name: 'Belle', Rarity: 'Korean', Desc: 'ryyan loves gooning', Image: 'Belle.jpg' },
  { Name: 'Bob', Rarity: 'Rare', Desc: 'licks you', Image: 'Bob.jpg' },
  { Name: 'Brude', Rarity: 'Common', Desc: 'mander', Image: 'Brude.jpg' },
  { Name: 'Bunger', Rarity: 'Common', Desc: 'Bunger goes Bunger', Image: 'Bunger.webp' },
  { Name: 'Chaewon', Rarity: 'Korean', Desc: 'Dlyan loves gooning', Image: 'Chaewon.jpg' },
  { Name: 'Daniel', Rarity: 'Rare', Desc: 'UwU', Image: 'Daniel.png' },
  { Name: 'Drake', Rarity: 'Rare', Desc: 'UwU', Image: 'Drake.jpg' },
  { Name: 'EDP', Rarity: 'Common', Desc: 'I want some cupcakes', Image: 'EDP.gif' },
  { Name: 'Einstein', Rarity: 'Legendary', Desc: 'Erm actually', Image: 'Einstein.webp' },
  { Name: 'Elon', Rarity: 'Common', Desc: 'I love daddy Trump', Image: 'Elon.webp' },
  { Name: 'GoJong', Rarity: 'Korean', Desc: 'Back in my day', Image: 'GoJong.jpg' },
  { Name: 'Greg', Rarity: 'Common', Desc: 'Im taking a massive dump', Image: 'Greg.jpg' },
  { Name: 'Hanni', Rarity: 'Korean', Desc: 'Dlyan loves gooning', Image: 'Hanni.jpg' },
  { Name: 'Jason', Rarity: 'Rare', Desc: 'FBoy in the making', Image: 'jason.jpg' },
  { Name: 'Jay Park', Rarity: 'Korean', Desc: 'I love a women', Image: 'Jay Park.webp' },
  { Name: 'Jeff', Rarity: 'Legendary', Desc: 'My name is jeff', Image: 'Jeff.jpg' },
  { Name: 'Jennie', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Jennie.jpg' },
  { Name: 'JoYuri', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'JoYuri.jpg' },
  { Name: 'Julie', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Julie.jpg' },
  { Name: 'Jungkook', Rarity: 'Korean', Desc: 'Standing next to you', Image: 'Jungkook.jpg' },
  { Name: 'Kanye', Rarity: 'Legendary', Desc: 'I love my cousin', Image: 'Kanye.jpg' },
  { Name: 'Keshi', Rarity: 'Common', Desc: 'Socal Asian moment', Image: 'Keshi.jpg' },
  { Name: 'Kim Jong Un', Rarity: 'Korean', Desc: 'Top three Korea right here', Image: 'KimJongUn.jpg' },
  { Name: 'LEBRON JAMES', Rarity: 'Lebron James', Desc: 'Dylan loves gooning', Image: 'Lebron.jpg' },
  { Name: 'Big Mac', Rarity: 'Common', Desc: 'Big back big back', Image: 'Mac.jpg' },
  { Name: 'McConner', Rarity: 'Common', Desc: 'Wsg gang', Image: 'McConner.jpg' },
  { Name: 'Minji', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Minji.jpg' },
  { Name: 'NingNing', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'NingNing.jpg' },
  { Name: 'Salmon', Rarity: 'Common', Desc: 'Im a fish', Image: 'Salmon.jpg' },
  { Name: 'Sung', Rarity: 'Korean', Desc: 'Arise', Image: 'Sung.jpg' },
  { Name: 'Vanilla', Rarity: 'Legendary', Desc: 'Dylan loves gooning', Image: 'Vanilla.webp' },
  { Name: 'Winter', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Winter.webp' },
]

function getRandomRarity() {
  const roll = Math.random() * 100
  let total = 0
  for (const [rarity, rate] of Object.entries(rarityRates)) {
    total += rate
    if (roll <= total) return rarity
  }
  return 'Common'
}

function pullOneCharacter() {
  const rarity = getRandomRarity()
  const pool = gachaPool.filter((c) => c.Rarity === rarity)
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}

function startCooldown() {
  isCooldown.value = true
  setTimeout(() => { isCooldown.value = false }, COOLDOWN_MS)
}

async function startOverlayPull(type) {
  if (isCooldown.value) return
  if (type === 'single' && coins.value < 10) return
  if (type === 'ten' && coins.value < 100) return

  pullType.value = type
  overlayResults.value = []

  if (type === 'single') {
    coins.value -= 10
    const pull = pullOneCharacter()
    if (pull) overlayResults.value = [pull]
    if (pull) await addToInventory([pull])
  } else {
    coins.value -= 100
    const pulls = []
    for (let i = 0; i < 10; i++) {
      const p = pullOneCharacter()
      if (p) pulls.push(p)
    }
    overlayResults.value = pulls
    if (pulls.length) await addToInventory(pulls)
  }
  await updateCoinsInDB()
  await showPullOverlay()
  startCooldown()
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'Lebron James': return 'lebron'
    case 'Korean': return 'korean'
    case 'Legendary': return 'legendary'
    case 'Rare': return 'rare'
    default: return 'common'
  }
}

function getStars(rarity) {
  switch (rarity) {
    case 'Lebron James': return 6
    case 'Legendary': return 4
    case 'Korean': return 5
    case 'Rare': return 3
    default: return 1
  }
}

async function showPullOverlay() {
  isDimmed.value = true
  await nextTick()
  gsap.fromTo('.overlay', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
  if (overlayResults.value.length === 1) {
    gsap.from('.card', { duration: 0.7, opacity: 0, y: 70, ease: 'power3.out', delay: 0.1 })
  } else {
    gsap.from('.card', {
      duration: 0.7, opacity: 0, y: 70,
      stagger: { amount: 0.6, grid: [2, 5], ease: 'power3.out' },
      delay: 0.1,
    })
  }
}

function hidePullOverlay() {
  gsap.to('.overlay', {
    opacity: 0, duration: 0.4, ease: 'power2.in',
    onComplete: () => {
      isDimmed.value = false
      overlayResults.value = []
    },
  })
}
</script>

<style scoped>
.gacha-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex; align-items: flex-start; justify-content: center;
}
.center {
  width: 100vw; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
}
.upshift {
  margin-top: 5vh;
}
.pull-buttons {
  display: flex; flex-direction: column; gap: 1.7rem; margin-bottom: 1.5rem; align-items: center; width: 100%;
}
.btn {
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
  padding: 1.1em 2.8em; margin: 0.2em 0; border-radius: 1.1em;
  font-size: 1.2rem; font-weight: 800; border: none; box-shadow: 0 4px 22px #2563eb18;
  transition: background 0.16s, transform 0.11s, box-shadow 0.11s;
  letter-spacing: 0.01em; cursor: pointer; outline: none; background: #e0e7ff; color: #22223b;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.single { background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%); color: white; }
.single:hover:not(:disabled) { background: linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%); }
.ten { background: linear-gradient(90deg, #fbbf24 0%, #f87171 100%); color: #fff; }
.ten:hover:not(:disabled) { background: linear-gradient(90deg, #f59e42 0%, #ef4444 100%); }
.cost { font-size: 0.97em; color: #fde047; margin-left: 0.6em; font-weight: 700; }
.coins { font-size: 1.34rem; color: #0ea5e9; font-weight: 700; margin-bottom: 1.7rem; }
.coins span { color: #475569; }
.rarity-btn { background: linear-gradient(90deg, #818cf8 0%, #38bdf8 100%); color: #fff; margin-top: 1.2em; font-size: 1.15rem; font-weight: 800; padding: 0.8em 2.1em; border-radius: 1.1em; }
.rarity-btn:hover { background: linear-gradient(90deg, #2563eb 0%, #818cf8 100%); }
.rarity-btn-close { background: #e0e7ff; color: #334155; margin-top: 1.4em; font-size: 1.02rem; font-weight: 700; padding: 0.58em 1.7em; border-radius: 0.7em; }
.rarity-btn-close:hover { background: #818cf8; color: #fff; }

.overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(30, 41, 59, 0.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
.overlay-cards {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.2rem;
  gap: 2.2vw 2.2vw;
}
.overlay-single { flex-direction: column; gap: 1.7em; }
.overlay-5x2 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 2.2vw 2.2vw;
}
.overlay-2x5 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 2vw 2vw;
}
.card {
  background: #fff; border-radius: 1.1rem; box-shadow: 0 4px 18px #2226;
  padding: 1.3em 0.85em 1.1em 0.85em; width: 170px;
  display: flex; flex-direction: column; align-items: center;
  border: 5px solid #e5e7eb; transition: border 0.2s;
}
.card-img { width: 100%; height: 110px; object-fit: cover; border-radius: 0.6em; margin-bottom: 0.45em; }
.card-name { font-weight: bold; font-size: 1.18em; margin-bottom: 0.15em; }
.card-stars { color: gold; margin: 0.25em 0 0.15em 0; font-size: 1.04em; }
.card-desc { font-size: 0.97em; color: #4b5563; margin-top: 0.12em; text-align: center; }
.lebron { border-color: #ef4444; }
.korean { border-color: #a855f7; }
.legendary { border-color: #f59e0b; }
.rare { border-color: #3b82f6; }
.common { border-color: #d1d5db; }
.overlay-tip { color: #fff; font-size: 1.12rem; font-weight: bold; margin-top: 1.8rem; text-shadow: 0 1px 6px #000a; }

.rarity-modal {
  background: #fff; border-radius: 2.1em; padding: 2.2em 2.7em 1.8em 2.7em;
  box-shadow: 0 8px 40px #818cf899, 0 2px 18px #818cf833;
  display: flex; flex-direction: column; align-items: center;
  min-width: 320px; max-width: 95vw;
}
.rarity-title { font-size: 2.1rem; font-weight: 900; color: #334155; margin-bottom: 1.2em; letter-spacing: 0.01em; }
.rarity-list { list-style: none; padding: 0; margin: 0 0 0.7em 0; width: 100%; }
.rarity-list li {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.32em 1.11em; margin-bottom: 0.4em; border-radius: 10px;
  font-weight: 700; font-size: 1.1rem; background: #f1f5f9;
}
.lebron { background: #fee2e2 !important; }
.korean { background: #ede9fe !important; }
.legendary { background: #fef3c7 !important; }
.rare { background: #dbeafe !important; }
.common { background: #f9fafb !important; }
.rarity-label { font-weight: bold; }
.rarity-percent { color: #f59e0b; font-weight: 900; }

@media (max-width: 800px) {
  .overlay-cards { gap: 1.4vw 1.4vw; }
  .card { width: 120px; padding: 0.6em 0.3em 0.5em 0.3em; }
  .card-img { height: 60px; }
  .rarity-modal { padding: 1.2em 0.8em 1.1em 0.8em; min-width: 0; }
}
@media (max-width: 600px) {
  .overlay-5x2 { display: none !important; }
  .overlay-2x5 { display: grid !important; }
}
@media (min-width: 601px) {
  .overlay-2x5 { display: none !important; }
  .overlay-5x2 { display: grid !important; }
}
@media (max-width: 500px) {
  .pull-buttons { gap: 0.7rem; }
  .btn { font-size: 1.01rem; padding: 0.7em 1.4em; }
  .coins { font-size: 1.01rem; }
  .rarity-modal { padding: 0.8em 0.2em 0.5em 0.2em; }
  .rarity-title { font-size: 1.1rem; }
  .rarity-list li { font-size: 1rem; padding: 0.2em 0.5em; }
}
</style>